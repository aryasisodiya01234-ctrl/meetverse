import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mic, MicOff, Video, VideoOff, MoreVertical, X, UserMinus, Volume2 } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
}

interface ParticipantsPanelProps {
  participants: Participant[];
  currentUserId: string;
  isCurrentUserHost: boolean;
  onMuteParticipant?: (participantId: string) => void;
  onRemoveParticipant?: (participantId: string) => void;
  onClose: () => void;
}

export function ParticipantsPanel({
  participants,
  currentUserId,
  isCurrentUserHost,
  onMuteParticipant,
  onRemoveParticipant,
  onClose,
}: ParticipantsPanelProps) {
  return (
    <div className="w-80 h-full bg-card border-l border-card-border flex flex-col" data-testid="participants-panel">
      <div className="p-4 border-b border-card-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Participants</h3>
          <Badge variant="secondary" className="text-xs" data-testid="badge-participant-count">
            {participants.length}
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          data-testid="button-close-participants"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {participants.map((participant) => {
            const isCurrentUser = participant.id === currentUserId;
            const initials = participant.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-2 rounded-md hover-elevate"
                data-testid={`participant-${participant.id}`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate" data-testid={`text-participant-name-${participant.id}`}>
                      {participant.name}
                      {isCurrentUser && " (You)"}
                    </span>
                    {participant.isHost && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                        Host
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {participant.isMuted ? (
                        <MicOff className="w-3 h-3" data-testid={`icon-participant-muted-${participant.id}`} />
                      ) : (
                        <Mic className="w-3 h-3" data-testid={`icon-participant-unmuted-${participant.id}`} />
                      )}
                      {participant.isVideoOff ? (
                        <VideoOff className="w-3 h-3" data-testid={`icon-participant-video-off-${participant.id}`} />
                      ) : (
                        <Video className="w-3 h-3" data-testid={`icon-participant-video-on-${participant.id}`} />
                      )}
                    </div>
                  </div>
                </div>

                {isCurrentUserHost && !isCurrentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="flex-shrink-0"
                        data-testid={`button-participant-actions-${participant.id}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!participant.isMuted && onMuteParticipant && (
                        <DropdownMenuItem 
                          onClick={() => onMuteParticipant(participant.id)}
                          data-testid={`button-mute-participant-${participant.id}`}
                        >
                          <Volume2 className="w-4 h-4 mr-2" />
                          Mute
                        </DropdownMenuItem>
                      )}
                      {onRemoveParticipant && (
                        <DropdownMenuItem 
                          onClick={() => onRemoveParticipant(participant.id)}
                          className="text-destructive"
                          data-testid={`button-remove-participant-${participant.id}`}
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
