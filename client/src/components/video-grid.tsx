import { VideoTile } from "./video-tile";

interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
  isMuted: boolean;
  isVideoOff: boolean;
  isHost: boolean;
  isScreenSharing: boolean;
}

interface VideoGridProps {
  participants: Participant[];
  localParticipantId: string;
}

export function VideoGrid({ participants, localParticipantId }: VideoGridProps) {
  const count = participants.length;
  
  let gridClass = "grid-cols-1";
  if (count === 2) gridClass = "grid-cols-2";
  else if (count >= 3 && count <= 4) gridClass = "grid-cols-2";
  else if (count >= 5 && count <= 9) gridClass = "grid-cols-3";
  else if (count >= 10) gridClass = "grid-cols-3 lg:grid-cols-4";

  return (
    <div className={`grid ${gridClass} gap-2 p-4 h-full overflow-y-auto`} data-testid="video-grid">
      {participants.map((participant) => (
        <VideoTile
          key={participant.id}
          participantId={participant.id}
          name={participant.name}
          stream={participant.stream}
          isMuted={participant.isMuted}
          isVideoOff={participant.isVideoOff}
          isHost={participant.isHost}
          isScreenSharing={participant.isScreenSharing}
          isLocal={participant.id === localParticipantId}
        />
      ))}
    </div>
  );
}
