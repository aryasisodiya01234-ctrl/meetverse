import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketServer } from "socket.io";
import { storage } from "./storage";
import type { Participant, ChatMessage } from "@shared/schema";

interface SocketData {
  participantId: string;
  meetingId: string;
  name: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-meeting", async (data: { 
      meetingCode: string; 
      name: string; 
      isHost: boolean;
      isMuted: boolean;
      isVideoOff: boolean;
    }) => {
      const { meetingCode, name, isHost, isMuted, isVideoOff } = data;
      
      let meeting = await storage.getMeeting(meetingCode);
      
      if (!meeting && isHost) {
        meeting = await storage.createMeeting(meetingCode, socket.id);
      }

      if (!meeting) {
        socket.emit("error", { message: "Meeting not found" });
        return;
      }

      const participant: Participant = {
        id: socket.id,
        meetingId: meeting.id,
        name,
        isHost,
        isMuted,
        isVideoOff,
        isScreenSharing: false,
      };

      await storage.addParticipant(participant);
      
      socket.join(meetingCode);
      
      const socketData: SocketData = {
        participantId: socket.id,
        meetingId: meetingCode,
        name,
      };
      socket.data = socketData;

      const existingParticipants = await storage.getParticipants(meeting.id);
      const otherParticipants = existingParticipants.filter(p => p.id !== socket.id);
      
      socket.emit("meeting-joined", {
        meetingId: meeting.id,
        participants: otherParticipants,
      });

      socket.to(meetingCode).emit("participant-joined", participant);

      console.log(`${name} joined meeting ${meetingCode}`);
    });

    socket.on("offer", (data: { to: string; offer: any }) => {
      socket.to(data.to).emit("offer", {
        from: socket.id,
        offer: data.offer,
      });
    });

    socket.on("answer", (data: { to: string; answer: any }) => {
      socket.to(data.to).emit("answer", {
        from: socket.id,
        answer: data.answer,
      });
    });

    socket.on("ice-candidate", (data: { to: string; candidate: any }) => {
      socket.to(data.to).emit("ice-candidate", {
        from: socket.id,
        candidate: data.candidate,
      });
    });

    socket.on("chat-message", async (data: { message: string }) => {
      const socketData = socket.data as SocketData;
      if (!socketData) return;

      const chatMessage: ChatMessage = {
        id: `${Date.now()}-${socket.id}`,
        meetingId: socketData.meetingId,
        senderId: socketData.participantId,
        senderName: socketData.name,
        message: data.message,
        timestamp: new Date(),
      };

      await storage.addMessage(chatMessage);
      
      io.to(socketData.meetingId).emit("chat-message", chatMessage);
    });

    socket.on("toggle-mute", async (data: { isMuted: boolean }) => {
      const socketData = socket.data as SocketData;
      if (!socketData) return;

      await storage.updateParticipant(
        socketData.meetingId,
        socketData.participantId,
        { isMuted: data.isMuted }
      );

      socket.to(socketData.meetingId).emit("participant-updated", {
        participantId: socket.id,
        updates: { isMuted: data.isMuted },
      });
    });

    socket.on("toggle-video", async (data: { isVideoOff: boolean }) => {
      const socketData = socket.data as SocketData;
      if (!socketData) return;

      await storage.updateParticipant(
        socketData.meetingId,
        socketData.participantId,
        { isVideoOff: data.isVideoOff }
      );

      socket.to(socketData.meetingId).emit("participant-updated", {
        participantId: socket.id,
        updates: { isVideoOff: data.isVideoOff },
      });
    });

    socket.on("toggle-screen-share", async (data: { isScreenSharing: boolean }) => {
      const socketData = socket.data as SocketData;
      if (!socketData) return;

      await storage.updateParticipant(
        socketData.meetingId,
        socketData.participantId,
        { isScreenSharing: data.isScreenSharing }
      );

      socket.to(socketData.meetingId).emit("participant-updated", {
        participantId: socket.id,
        updates: { isScreenSharing: data.isScreenSharing },
      });
    });

    socket.on("mute-participant", async (data: { participantId: string }) => {
      const socketData = socket.data as SocketData;
      if (!socketData) return;

      const participants = await storage.getParticipants(socketData.meetingId);
      const currentUser = participants.find(p => p.id === socketData.participantId);
      
      if (!currentUser?.isHost) return;

      await storage.updateParticipant(
        socketData.meetingId,
        data.participantId,
        { isMuted: true }
      );

      io.to(data.participantId).emit("force-muted");
      
      io.to(socketData.meetingId).emit("participant-updated", {
        participantId: data.participantId,
        updates: { isMuted: true },
      });
    });

    socket.on("remove-participant", async (data: { participantId: string }) => {
      const socketData = socket.data as SocketData;
      if (!socketData) return;

      const participants = await storage.getParticipants(socketData.meetingId);
      const currentUser = participants.find(p => p.id === socketData.participantId);
      
      if (!currentUser?.isHost) return;

      await storage.removeParticipant(socketData.meetingId, data.participantId);
      
      io.to(data.participantId).emit("removed-from-meeting");
      
      socket.to(socketData.meetingId).emit("participant-left", {
        participantId: data.participantId,
      });
    });

    socket.on("disconnect", async () => {
      const socketData = socket.data as SocketData;
      if (!socketData) return;

      await storage.removeParticipant(socketData.meetingId, socketData.participantId);
      
      socket.to(socketData.meetingId).emit("participant-left", {
        participantId: socket.id,
      });

      const remainingParticipants = await storage.getParticipants(socketData.meetingId);
      if (remainingParticipants.length === 0) {
        await storage.deleteMeeting(socketData.meetingId);
      }

      console.log(`${socketData.name} left meeting ${socketData.meetingId}`);
    });
  });

  return httpServer;
}
