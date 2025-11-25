import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { VideoGrid } from "@/components/video-grid";
import { ControlBar } from "@/components/control-bar";
import { ChatPanel } from "@/components/chat-panel";
import { ParticipantsPanel } from "@/components/participants-panel";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/lib/useWebSocket";
import { PeerConnection } from "@/lib/webrtc";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
  isMuted: boolean;
  isVideoOff: boolean;
  isHost: boolean;
  isScreenSharing: boolean;
}

interface Message {
  id: string;
  senderName: string;
  senderId: string;
  message: string;
  timestamp: Date;
}


export default function Meeting() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { socket, isConnected } = useWebSocket();

  const params = new URLSearchParams(window.location.search);
  const meetingCode = params.get("code") || "";
  const userName = params.get("name") || "";
  const isHost = params.get("isHost") === "true";
  const initialMuted = params.get("muted") === "true";
  const initialVideoOff = params.get("videoOff") === "true";

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isVideoOff, setIsVideoOff] = useState(initialVideoOff);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  
  const localIdRef = useRef<string>("");
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());

  // Initialize media
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: !initialVideoOff,
          audio: !initialMuted,
        });

        setLocalStream(stream);
        stream.getAudioTracks().forEach((track) => {
          track.enabled = !initialMuted;
        });
      } catch (error) {
        console.error("Media error:", error);
        toast({
          title: "Media access error",
          description: "Could not access camera or microphone",
          variant: "destructive",
        });
      }
    };

    initMedia();
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
      peersRef.current.forEach((peer) => {
        try {
          peer.destroy();
        } catch (e) {
          console.error("Error destroying peer:", e);
        }
      });
    };
  }, []);

  // Join meeting and handle signaling
  useEffect(() => {
    if (!socket || !isConnected || !localStream) return;

    // Emit join-meeting event
    socket.emit("join-meeting", {
      meetingCode,
      name: userName,
      isHost,
      isMuted: initialMuted,
      isVideoOff: initialVideoOff,
    });

    localIdRef.current = socket.id;
    console.log("Local ID:", socket.id);

    // Set self as first participant
    setParticipants([
      {
        id: socket.id,
        name: userName,
        stream: localStream,
        isMuted: initialMuted,
        isVideoOff: initialVideoOff,
        isHost,
        isScreenSharing: false,
      },
    ]);

    // Handle meeting-joined: you receive list of existing participants
    const handleMeetingJoined = (data: { meetingId: string; participants: Participant[] }) => {
      console.log("Meeting joined, existing participants:", data.participants.length);
      toast({
        title: "Joined meeting",
        description: `Meeting code: ${meetingCode}`,
      });

      // For each existing participant, create a peer connection where WE are the initiator
      data.participants.forEach((participant) => {
        console.log("Creating initiator peer for:", participant.name);
        createAndConnectPeer(participant.id, true);
      });
    };

    // Handle participant-joined: someone new joined the meeting
    const handleParticipantJoined = (participant: Participant) => {
      console.log("New participant joined:", participant.name);
      toast({
        title: "Participant joined",
        description: `${participant.name} joined the meeting`,
      });
      
      // Add to participants list
      setParticipants((prev) => [...prev, { ...participant, stream: undefined }]);
      
      // They will create a peer connection to us, so we don't create one here
    };

    // Handle offer from remote peer (they are initiating to us)
    const handleOffer = (data: { from: string; offer: any }) => {
      console.log("Received offer from:", data.from);
      
      // Check if we already have a peer connection for this participant
      let peer = peersRef.current.get(data.from);
      
      if (!peer && localStream) {
        // Create a non-initiator peer (we will answer)
        console.log("Creating answerer peer for:", data.from);
        peer = createAndConnectPeer(data.from, false);
      }
      
      // Handle the offer
      if (peer) {
        peer.handleOffer(data.offer);
      }
    };

    // Handle answer from remote peer
    const handleAnswer = (data: { from: string; answer: any }) => {
      console.log("Received answer from:", data.from);
      const peer = peersRef.current.get(data.from);
      if (peer) {
        peer.handleAnswer(data.answer);
      }
    };

    // Handle ICE candidate
    const handleIceCandidate = (data: { from: string; candidate: any }) => {
      const peer = peersRef.current.get(data.from);
      if (peer) {
        peer.handleIceCandidate(data.candidate);
      }
    };

    // Handle chat messages
    const handleChatMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
      if (!chatOpen && message.senderId !== socket.id) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    // Handle participant updates
    const handleParticipantUpdated = (data: { participantId: string; updates: Partial<Participant> }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === data.participantId ? { ...p, ...data.updates } : p))
      );
    };

    // Handle participant left
    const handleParticipantLeft = (data: { participantId: string }) => {
      const peer = peersRef.current.get(data.participantId);
      if (peer) {
        try {
          peer.destroy();
        } catch (e) {
          console.error("Error destroying peer:", e);
        }
        peersRef.current.delete(data.participantId);
      }

      setParticipants((prev) => {
        const participant = prev.find((p) => p.id === data.participantId);
        if (participant) {
          toast({
            title: "Participant left",
            description: `${participant.name} left the meeting`,
          });
        }
        return prev.filter((p) => p.id !== data.participantId);
      });
    };

    // Handle force mute
    const handleForceMuted = () => {
      setIsMuted(true);
      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
      }
      toast({
        title: "Muted by host",
        description: "You have been muted by the meeting host",
        variant: "destructive",
      });
    };

    // Handle removal from meeting
    const handleRemovedFromMeeting = () => {
      toast({
        title: "Removed from meeting",
        description: "You have been removed from the meeting by the host",
        variant: "destructive",
      });
      setTimeout(() => {
        confirmEndCall();
      }, 2000);
    };

    // Register all handlers
    socket.on("meeting-joined", handleMeetingJoined);
    socket.on("participant-joined", handleParticipantJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("chat-message", handleChatMessage);
    socket.on("participant-updated", handleParticipantUpdated);
    socket.on("participant-left", handleParticipantLeft);
    socket.on("force-muted", handleForceMuted);
    socket.on("removed-from-meeting", handleRemovedFromMeeting);

    return () => {
      socket.off("meeting-joined", handleMeetingJoined);
      socket.off("participant-joined", handleParticipantJoined);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("chat-message", handleChatMessage);
      socket.off("participant-updated", handleParticipantUpdated);
      socket.off("participant-left", handleParticipantLeft);
      socket.off("force-muted", handleForceMuted);
      socket.off("removed-from-meeting", handleRemovedFromMeeting);
    };
  }, [socket, isConnected, localStream, chatOpen]);

  const createAndConnectPeer = (peerId: string, initiator: boolean): PeerConnection | null => {
    if (!localStream || !socket) {
      console.error("[WebRTC] Missing localStream or socket");
      return null;
    }

    try {
      const peerConnection = new PeerConnection(
        peerId,
        socket,
        localStream,
        initiator,
        (remoteStream) => {
          console.log("[WebRTC] Received remote stream from:", peerId);
          setParticipants((prev) =>
            prev.map((p) =>
              p.id === peerId
                ? { ...p, stream: remoteStream }
                : p
            )
          );
        }
      );

      peersRef.current.set(peerId, peerConnection);
      return peerConnection;
    } catch (error: any) {
      console.error("[WebRTC] Error creating peer:", error);
      return null;
    }
  };

  const toggleMute = () => {
    if (localStream && socket) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
      socket.emit("toggle-mute", { isMuted: !isMuted });

      setParticipants((prev) =>
        prev.map((p) =>
          p.id === socket.id ? { ...p, isMuted: !isMuted } : p
        )
      );
    }
  };

  const toggleVideo = () => {
    if (localStream && socket) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
      socket.emit("toggle-video", { isVideoOff: !isVideoOff });

      setParticipants((prev) =>
        prev.map((p) =>
          p.id === socket.id ? { ...p, isVideoOff: !isVideoOff } : p
        )
      );
    }
  };

  const toggleScreenShare = async () => {
    if (!socket) return;

    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

        setScreenStream(stream);
        setIsScreenSharing(true);
        socket.emit("toggle-screen-share", { isScreenSharing: true });

        stream.getVideoTracks()[0].addEventListener("ended", () => {
          stopScreenShare();
        });
      } catch (error) {
        toast({
          title: "Screen share error",
          description: "Could not start screen sharing",
          variant: "destructive",
        });
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStream && socket) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      socket.emit("toggle-screen-share", { isScreenSharing: false });

      setParticipants((prev) =>
        prev.map((p) =>
          p.id === socket?.id
            ? { ...p, isScreenSharing: false }
            : p
        )
      );
    }
  };

  const toggleChat = () => {
    if (participantsOpen) setParticipantsOpen(false);
    setChatOpen(!chatOpen);
  };

  const toggleParticipants = () => {
    if (chatOpen) setChatOpen(false);
    setParticipantsOpen(!participantsOpen);
  };

  const handleSendMessage = (message: string) => {
    if (socket) {
      socket.emit("chat-message", { message });
    }
  };

  const handleMuteParticipant = (participantId: string) => {
    if (socket) {
      socket.emit("mute-participant", { participantId });
    }
  };

  const handleRemoveParticipant = (participantId: string) => {
    if (socket) {
      socket.emit("remove-participant", { participantId });
    }
  };

  const handleEndCall = () => {
    setShowEndDialog(true);
  };

  const confirmEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }
    peersRef.current.forEach((peer) => {
      try {
        peer.destroy();
      } catch (e) {
        console.error("Error destroying peer:", e);
      }
    });
    if (socket) {
      socket.disconnect();
    }
    setLocation("/");
  };

  if (!isConnected) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Connecting to meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background" data-testid="meeting-room">
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <VideoGrid
            participants={participants}
            localParticipantId={socket?.id || localIdRef.current}
          />
          <ControlBar
            meetingCode={meetingCode}
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            chatOpen={chatOpen}
            participantsOpen={participantsOpen}
            unreadCount={unreadCount}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onToggleScreenShare={toggleScreenShare}
            onToggleChat={toggleChat}
            onToggleParticipants={toggleParticipants}
            onEndCall={handleEndCall}
          />
        </div>

        {chatOpen && (
          <ChatPanel
            messages={messages}
            currentUserId={socket?.id || localIdRef.current}
            onSendMessage={handleSendMessage}
            onClose={() => setChatOpen(false)}
          />
        )}

        {participantsOpen && (
          <ParticipantsPanel
            participants={participants}
            currentUserId={socket?.id || localIdRef.current}
            isCurrentUserHost={isHost}
            onMuteParticipant={handleMuteParticipant}
            onRemoveParticipant={handleRemoveParticipant}
            onClose={() => setParticipantsOpen(false)}
          />
        )}
      </div>

      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this meeting?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-end-call">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmEndCall}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-end-call"
            >
              End Meeting
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
