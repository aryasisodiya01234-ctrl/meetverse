import { useState } from "react";
import { useLocation } from "wouter";
import {
  Crop as CropIcon,
  ChevronDown,
  ChevronLeft,
  Eye,
  Image as ImageIcon,
  Layers,
  Link2,
  Lock,
  Moon,
  Music,
  Pause,
  Play,
  Redo2,
  Rows3,
  Settings2,
  Sparkles,
  Type,
  Undo2,
  Volume2,
} from "lucide-react";
import { MediaPlaceholder } from "@/components/studio/media-placeholder";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const railTools = [
  { key: "image", label: "Image", icon: ImageIcon },
  { key: "text", label: "Text", icon: Type },
  { key: "audio", label: "Audio", icon: Music },
  { key: "ai", label: "AI", icon: Sparkles },
  { key: "layers", label: "Layers", icon: Layers },
  { key: "rows", label: "Tracks", icon: Rows3 },
  { key: "settings", label: "Settings", icon: Settings2 },
];

const settingsRows = ["Position", "Enter Animations", "Exit Animations", "3D Layout Effects"];

const ratios: { value: string; label: string }[] = [
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "4:5", label: "4:5" },
  { value: "1:1", label: "1:1" },
  { value: "all", label: "Compare all ratios" },
];

const compareCards = [
  { ratio: "9:16", className: "h-[420px] w-[236px]" },
  { ratio: "4:5", className: "h-[420px] w-[336px]", active: true },
  { ratio: "1:1", className: "h-[420px] w-[420px]" },
];

const timelineTracks = [
  { label: "IMAGE", color: "bg-[#6b5cdb] text-white", width: "w-[190px]", offset: "ml-[80px]" },
  {
    label: "There's never been a better time to create",
    color: "bg-background border text-foreground",
    width: "w-[220px]",
    offset: "ml-[86px]",
  },
  {
    label: "Video AI is evolving faster th…",
    color: "bg-background border text-foreground",
    width: "w-[180px]",
    offset: "ml-[300px]",
  },
];

export default function VideoEditor() {
  const [, setLocation] = useLocation();
  const [activeTool, setActiveTool] = useState("image");
  const [ratio, setRatio] = useState("16:9");
  const [crop, setCrop] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [dark, setDark] = useState(true);

  const compareMode = ratio === "all";

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-md px-1.5 py-1 hover-elevate"
          onClick={() => setLocation("/studio/shoots")}
          data-testid="button-back-to-shoots"
        >
          <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="h-5 w-5 shrink-0 rounded-md bg-foreground" />
          <p className="text-[13px] font-semibold text-foreground">Image</p>
        </button>

        {compareMode ? (
          <div className="flex items-center gap-2 text-[12px] text-amber-600 dark:text-amber-400">
            <span>Some changes can only be made in a single-ratio view</span>
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5"
            onClick={() => setDark((v) => !v)}
            data-testid="button-toggle-dark-preview"
          >
            <Moon className="h-3.5 w-3.5" />
            {dark ? "Dark" : "Light"}
          </Button>
        )}

        <Button size="sm" data-testid="button-export-video">
          Export Video
        </Button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Icon rail */}
        <div className="flex w-[52px] shrink-0 flex-col items-center gap-3.5 border-r bg-muted/30 py-4">
          {railTools.map((tool) => (
            <button
              key={tool.key}
              type="button"
              title={tool.label}
              onClick={() => setActiveTool(tool.key)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md hover-elevate",
                activeTool === tool.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground",
              )}
              data-testid={`rail-${tool.key}`}
            >
              <tool.icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        {/* Properties panel */}
        <div className="flex w-[256px] shrink-0 flex-col gap-3.5 overflow-y-auto border-r bg-muted/10 p-4">
          <MediaPlaceholder className="h-[72px] w-full" rounded="rounded-lg" />

          <Tabs defaultValue="settings">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings" data-testid="tab-settings">
                Settings
              </TabsTrigger>
              <TabsTrigger value="style" data-testid="tab-style">
                Style
              </TabsTrigger>
              <TabsTrigger value="ai" data-testid="tab-ai">
                AI
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5">
            <span className="text-[12.5px] font-semibold text-foreground">Crop</span>
            <Switch checked={crop} onCheckedChange={setCrop} data-testid="switch-crop" />
          </div>

          {settingsRows.map((row) => (
            <Collapsible
              key={row}
              open={openSection === row}
              onOpenChange={(open) => setOpenSection(open ? row : null)}
            >
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 hover-elevate"
                  data-testid={`collapsible-${row.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="text-[12.5px] font-semibold text-foreground">{row}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform",
                      openSection === row && "rotate-180",
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 py-2 text-[11.5px] text-muted-foreground">
                No settings configured yet.
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        {/* Preview */}
        <div className="flex flex-1 items-center justify-center overflow-x-auto bg-neutral-900 p-8">
          {compareMode ? (
            <div className="flex items-center gap-6">
              {compareCards.map((card) => (
                <div key={card.ratio} className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "relative rounded-md border",
                      card.active ? "border-primary" : "border-neutral-700",
                      card.className,
                    )}
                  >
                    <div className="absolute right-2 top-2 flex gap-1">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-neutral-800/80 text-neutral-300">
                        <CropIcon className="h-2.5 w-2.5" />
                      </div>
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-neutral-800/80 text-neutral-300">
                        <Link2 className="h-2.5 w-2.5" />
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-neutral-400">{card.ratio}</span>
                </div>
              ))}
            </div>
          ) : (
            <MediaPlaceholder className="h-[380px] w-[300px]" showPlay rounded="rounded-xl" />
          )}
        </div>
      </div>

      {/* Transport bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-y px-4">
        <div className="flex items-center gap-3">
          <button type="button" className="text-muted-foreground hover-elevate rounded p-1" data-testid="button-undo">
            <Undo2 className="h-4 w-4" />
          </button>
          <button type="button" className="text-muted-foreground hover-elevate rounded p-1" data-testid="button-redo">
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold text-foreground">1x</span>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background hover-elevate"
            data-testid="button-toggle-play"
          >
            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </button>
          <span className="text-[11.5px] text-muted-foreground">0:00.00 / 0:38.40</span>
        </div>

        <div className="flex items-center gap-3">
          <Select value={ratio} onValueChange={setRatio}>
            <SelectTrigger className="h-7 w-[168px] text-[11px]" data-testid="select-ratio">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ratios.map((r) => (
                <SelectItem key={r.value} value={r.value} data-testid={`ratio-option-${r.value}`}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider defaultValue={[70]} max={100} className="w-20" data-testid="slider-volume" />
        </div>
      </div>

      {/* Timeline */}
      <div className="flex h-[210px] shrink-0 flex-col gap-2 overflow-x-auto bg-muted/40 px-4 pb-3.5 pt-2.5">
        <div className="flex w-full items-center pl-12 text-[9.5px] text-muted-foreground">
          {["0s", "5s", "10s", "19s", "20s", "25s"].map((t, i) => (
            <span key={t} className={cn("shrink-0", i > 0 && "flex-1 text-right")}>
              {t}
            </span>
          ))}
        </div>

        {timelineTracks.map((track) => (
          <div key={track.label} className="flex w-full items-center gap-2">
            <div className="flex w-8 shrink-0 gap-1">
              <Eye className="h-2.5 w-2.5 text-muted-foreground" />
              <Lock className="h-2.5 w-2.5 text-muted-foreground" />
            </div>
            <div
              className={cn(
                "flex h-[26px] shrink-0 items-center whitespace-nowrap rounded px-2 text-[9.5px] font-semibold",
                track.color,
                track.width,
                track.offset,
              )}
            >
              {track.label}
            </div>
          </div>
        ))}

        <div className="flex w-full items-center gap-2">
          <div className="flex w-8 shrink-0 gap-1">
            <Eye className="h-2.5 w-2.5 text-muted-foreground" />
            <Lock className="h-2.5 w-2.5 text-muted-foreground" />
          </div>
          <div className="ml-10 flex gap-0.5">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="h-[30px] w-[34px] shrink-0 rounded-sm bg-muted-foreground/30" />
            ))}
          </div>
        </div>

        <div className="flex w-full items-center gap-2">
          <div className="flex w-8 shrink-0 gap-1">
            <Eye className="h-2.5 w-2.5 text-muted-foreground" />
            <Lock className="h-2.5 w-2.5 text-muted-foreground" />
          </div>
          <div className="ml-10 flex h-[26px] w-[560px] shrink-0 items-center rounded bg-[#ccdb73] px-2 text-[9.5px] font-semibold text-foreground">
            ♪ Slow Sunday Lofi
          </div>
        </div>
      </div>
    </div>
  );
}
