import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  senderName: string;
  senderId: string;
  message: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: Message[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
  onClose: () => void;
}

export function ChatPanel({ messages, currentUserId, onSendMessage, onClose }: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  return (
    <div className="w-80 h-full bg-card border-l border-card-border flex flex-col" data-testid="chat-panel">
      <div className="p-4 border-b border-card-border flex items-center justify-between">
        <h3 className="font-semibold">Chat</h3>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          data-testid="button-close-chat"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div ref={scrollRef} className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === currentUserId;
              const initials = msg.senderName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
                  data-testid={`message-${msg.id}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 space-y-1 ${isOwn ? "items-end" : ""}`}>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium">{msg.senderName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div 
                      className={`inline-block px-3 py-2 rounded-lg text-sm ${
                        isOwn 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}
                      data-testid={`message-content-${msg.id}`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-card-border">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            data-testid="input-chat-message"
          />
          <Button 
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim()}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
