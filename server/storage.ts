import { type Meeting, type Participant, type ChatMessage } from "@shared/schema";

export interface IStorage {
  createMeeting(code: string, hostId: string): Promise<Meeting>;
  getMeeting(code: string): Promise<Meeting | undefined>;
  deleteMeeting(code: string): Promise<void>;
  
  addParticipant(participant: Participant): Promise<void>;
  removeParticipant(meetingId: string, participantId: string): Promise<void>;
  getParticipants(meetingId: string): Promise<Participant[]>;
  updateParticipant(meetingId: string, participantId: string, updates: Partial<Participant>): Promise<void>;
  
  addMessage(message: ChatMessage): Promise<void>;
  getMessages(meetingId: string): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private meetings: Map<string, Meeting>;
  private participants: Map<string, Participant[]>;
  private messages: Map<string, ChatMessage[]>;

  constructor() {
    this.meetings = new Map();
    this.participants = new Map();
    this.messages = new Map();
  }

  async createMeeting(code: string, hostId: string): Promise<Meeting> {
    const meeting: Meeting = {
      id: code,
      code,
      hostId,
      createdAt: new Date(),
    };
    this.meetings.set(code, meeting);
    this.participants.set(code, []);
    this.messages.set(code, []);
    return meeting;
  }

  async getMeeting(code: string): Promise<Meeting | undefined> {
    return this.meetings.get(code);
  }

  async deleteMeeting(code: string): Promise<void> {
    this.meetings.delete(code);
    this.participants.delete(code);
    this.messages.delete(code);
  }

  async addParticipant(participant: Participant): Promise<void> {
    const participants = this.participants.get(participant.meetingId) || [];
    participants.push(participant);
    this.participants.set(participant.meetingId, participants);
  }

  async removeParticipant(meetingId: string, participantId: string): Promise<void> {
    const participants = this.participants.get(meetingId) || [];
    const filtered = participants.filter(p => p.id !== participantId);
    this.participants.set(meetingId, filtered);
  }

  async getParticipants(meetingId: string): Promise<Participant[]> {
    return this.participants.get(meetingId) || [];
  }

  async updateParticipant(meetingId: string, participantId: string, updates: Partial<Participant>): Promise<void> {
    const participants = this.participants.get(meetingId) || [];
    const index = participants.findIndex(p => p.id === participantId);
    if (index !== -1) {
      participants[index] = { ...participants[index], ...updates };
      this.participants.set(meetingId, participants);
    }
  }

  async addMessage(message: ChatMessage): Promise<void> {
    const messages = this.messages.get(message.meetingId) || [];
    messages.push(message);
    this.messages.set(message.meetingId, messages);
  }

  async getMessages(meetingId: string): Promise<ChatMessage[]> {
    return this.messages.get(meetingId) || [];
  }
}

export const storage = new MemStorage();
