import type { Socket } from "socket.io-client";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export class PeerConnection {
  private peerConnection: RTCPeerConnection;
  private peerId: string;
  private socket: Socket;
  private localStream: MediaStream;
  private onStreamReceived: (stream: MediaStream) => void;

  constructor(
    peerId: string,
    socket: Socket,
    localStream: MediaStream,
    initiator: boolean,
    onStreamReceived: (stream: MediaStream) => void
  ) {
    this.peerId = peerId;
    this.socket = socket;
    this.localStream = localStream;
    this.onStreamReceived = onStreamReceived;

    console.log(`[WebRTC] Creating RTCPeerConnection with ${peerId} as ${initiator ? "initiator" : "answerer"}`);

    // Create peer connection
    this.peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS.iceServers });

    // Add local stream tracks
    localStream.getTracks().forEach((track) => {
      console.log(`[WebRTC] Adding ${track.kind} track to connection with ${peerId}`);
      this.peerConnection.addTrack(track, localStream);
    });

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        console.log(`[WebRTC] Sending ICE candidate to ${peerId}`);
        this.socket.emit("ice-candidate", {
          to: this.peerId,
          candidate: event.candidate,
        });
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      console.log(`[WebRTC] Received remote ${event.track.kind} track from ${peerId}`);
      const remoteStream = event.streams[0];
      if (remoteStream) {
        this.onStreamReceived(remoteStream);
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state with ${peerId}: ${this.peerConnection.connectionState}`);
    };

    this.peerConnection.onicegatheringstatechange = () => {
      console.log(`[WebRTC] ICE gathering state with ${peerId}: ${this.peerConnection.iceGatheringState}`);
    };

    // If initiator, create offer
    if (initiator) {
      this.createOffer();
    }
  }

  private async createOffer() {
    try {
      console.log(`[WebRTC] Creating offer for ${this.peerId}`);
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      console.log(`[WebRTC] Sending offer to ${this.peerId}`);
      this.socket.emit("offer", {
        to: this.peerId,
        offer: offer,
      });
    } catch (error) {
      console.error(`[WebRTC] Error creating offer for ${this.peerId}:`, error);
    }
  }

  async handleOffer(offer: RTCSessionDescriptionInit) {
    try {
      console.log(`[WebRTC] Handling offer from ${this.peerId}`);
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      console.log(`[WebRTC] Sending answer to ${this.peerId}`);
      this.socket.emit("answer", {
        to: this.peerId,
        answer: answer,
      });
    } catch (error) {
      console.error(`[WebRTC] Error handling offer from ${this.peerId}:`, error);
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      console.log(`[WebRTC] Handling answer from ${this.peerId}`);
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error(`[WebRTC] Error handling answer from ${this.peerId}:`, error);
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      console.log(`[WebRTC] Adding ICE candidate from ${this.peerId}`);
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error(`[WebRTC] Error adding ICE candidate from ${this.peerId}:`, error);
    }
  }

  destroy() {
    console.log(`[WebRTC] Destroying connection with ${this.peerId}`);
    this.peerConnection.close();
  }
}
