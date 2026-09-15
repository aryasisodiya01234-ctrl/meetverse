import { Image as ImageIcon, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaPlaceholderProps {
  className?: string;
  showPlay?: boolean;
  duration?: string;
  rounded?: string;
}

/**
 * Stand-in for the reference photography used in the Figma wireframe.
 * Renders a neutral gradient tile instead of hot-linking Figma's
 * temporary (~7 day) asset URLs or bundling stock photography.
 */
export function MediaPlaceholder({
  className,
  showPlay = false,
  duration,
  rounded = "rounded-xl",
}: MediaPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden border bg-gradient-to-br from-muted to-muted-foreground/15",
        rounded,
        className,
      )}
    >
      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
      {showPlay && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35">
            <Play className="h-5 w-5 fill-white text-white" />
          </div>
        </div>
      )}
      {duration && (
        <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[9.5px] font-semibold text-white">
          {duration}
        </span>
      )}
    </div>
  );
}
