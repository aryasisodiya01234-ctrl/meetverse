import { useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Monitor } from "lucide-react";

interface VideoTileProps {
  participantId: string;
  name: string;
  stream?: MediaStream;
  isMuted: boolean;
  isVideoOff: boolean;
  isHost: boolean;
  isScreenSharing?: boolean;
  isLocal?: boolean;
}

export function VideoTile({ 
  name, 
  stream, 
  isMuted, 
  isVideoOff, 
  isHost,
  isScreenSharing = false,
  isLocal = false
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden group" data-testid={`video-tile-${name.toLowerCase().replace(/\s+/g, "-")}`}>
      {!isVideoOff && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
          data-testid={`video-stream-${name.toLowerCase().replace(/\s+/g, "-")}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Avatar className="w-24 h-24">
            <AvatarFallback className="text-2xl font-medium bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-white text-sm font-medium truncate" data-testid={`text-participant-name-${name.toLowerCase().replace(/\s+/g, "-")}`}>
              {name} {isLocal && "(You)"}
            </span>
            {isHost && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                Host
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isScreenSharing && (
              <div className="bg-primary/90 rounded p-1">
                <Monitor className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            <div className={`rounded p-1 ${isMuted ? "bg-destructive/90" : "bg-background/20"}`}>
              {isMuted ? (
                <MicOff className="w-3 h-3 text-destructive-foreground" data-testid={`icon-muted-${name.toLowerCase().replace(/\s+/g, "-")}`} />
              ) : (
                <Mic className="w-3 h-3 text-white" data-testid={`icon-unmuted-${name.toLowerCase().replace(/\s+/g, "-")}`} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
