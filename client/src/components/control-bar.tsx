import { Button } from "@/components/ui/button";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  MessageSquare,
  Users,
  Phone,
  Copy,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface ControlBarProps {
  meetingCode: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  chatOpen: boolean;
  participantsOpen: boolean;
  unreadCount: number;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onEndCall: () => void;
}

export function ControlBar({
  meetingCode,
  isMuted,
  isVideoOff,
  isScreenSharing,
  chatOpen,
  participantsOpen,
  unreadCount,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipants,
  onEndCall,
}: ControlBarProps) {
  const { toast } = useToast();
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const copyMeetingCode = () => {
    const meetingUrl = `${window.location.origin}/pre-meeting?code=${meetingCode}&isHost=false`;
    navigator.clipboard.writeText(meetingUrl);
    toast({
      title: "Link copied",
      description: "Meeting link has been copied to clipboard",
    });
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-20 bg-card border-t border-card-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="outline"
          size="sm"
          onClick={copyMeetingCode}
          className="gap-2"
          data-testid="button-copy-meeting-link"
        >
          <Copy className="w-4 h-4" />
          <span className="font-mono font-medium">{meetingCode}</span>
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="font-mono" data-testid="text-meeting-duration">{formatDuration(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          size="icon"
          variant={isMuted ? "destructive" : "secondary"}
          onClick={onToggleMute}
          className="rounded-full w-12 h-12"
          data-testid="button-toggle-mic-meeting"
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>
        
        <Button
          size="icon"
          variant={isVideoOff ? "destructive" : "secondary"}
          onClick={onToggleVideo}
          className="rounded-full w-12 h-12"
          data-testid="button-toggle-camera-meeting"
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </Button>

        <Button
          size="icon"
          variant={isScreenSharing ? "default" : "secondary"}
          onClick={onToggleScreenShare}
          className="rounded-full w-12 h-12"
          data-testid="button-toggle-screenshare"
        >
          {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </Button>

        <Button
          variant="destructive"
          onClick={onEndCall}
          className="rounded-full px-6 h-12"
          data-testid="button-end-call"
        >
          <Phone className="w-5 h-5 mr-2 rotate-[135deg]" />
          End Call
        </Button>
      </div>

      <div className="flex items-center justify-end gap-2 flex-1">
        <Button
          size="icon"
          variant={chatOpen ? "default" : "secondary"}
          onClick={onToggleChat}
          className="rounded-full w-12 h-12 relative"
          data-testid="button-toggle-chat"
        >
          <MessageSquare className="w-5 h-5" />
          {unreadCount > 0 && !chatOpen && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs"
              data-testid="badge-unread-count"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
        
        <Button
          size="icon"
          variant={participantsOpen ? "default" : "secondary"}
          onClick={onToggleParticipants}
          className="rounded-full w-12 h-12"
          data-testid="button-toggle-participants"
        >
          <Users className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
