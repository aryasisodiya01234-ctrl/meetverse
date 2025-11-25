import { z } from "zod";

export interface Meeting {
  id: string;
  code: string;
  hostId: string;
  createdAt: Date;
}

export interface Participant {
  id: string;
  meetingId: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
}

export interface ChatMessage {
  id: string;
  meetingId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}

export const createMeetingSchema = z.object({
  hostName: z.string().min(1, "Name is required"),
});

export const joinMeetingSchema = z.object({
  code: z.string().min(6, "Meeting code must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

export const sendMessageSchema = z.object({
  meetingId: z.string(),
  message: z.string().min(1),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type JoinMeetingInput = z.infer<typeof joinMeetingSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
