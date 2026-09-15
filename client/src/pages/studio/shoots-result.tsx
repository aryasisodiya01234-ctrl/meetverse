import { useLocation } from "wouter";
import {
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  Images,
  Layers,
  MoreHorizontal,
  Paperclip,
  Sparkles,
  Wand2,
} from "lucide-react";
import { StudioSidebar } from "@/components/studio/studio-sidebar";
import { MediaPlaceholder } from "@/components/studio/media-placeholder";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const sizeOptions = [
  { value: "square", label: "Square", meta: "Instagram Post • 1080 × 1080" },
  { value: "portrait", label: "Portrait", meta: "Instagram Portrait • 1080 × 1350" },
  { value: "story", label: "Story/Reel", meta: "Instagram Story • 1080 × 1920" },
  { value: "landscape", label: "Landscape", meta: "Facebook Cover • 1920 × 1080" },
];

// Screens "01 Shoots Result" and "02 Shoots Result, Change Size expanded" from the
// adza.ai Figma wireframe, combined into one interactive page: opening the asset
// menu's "Change Size" item reveals the same submenu shown in screen 02.
export default function ShootsResult() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <StudioSidebar active="video" />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <div className="flex h-[50px] shrink-0 items-center gap-3 border-b pl-7 pr-6">
          <div className="h-4 w-4 shrink-0 rounded-sm bg-muted" />
          <p className="flex-1 truncate text-[13.5px] font-semibold text-foreground">
            Riley Sports Jacket – Boxing Gym Commercial
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5" data-testid="button-actions">
                Actions
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem data-testid="menuitem-rename">Rename thread</DropdownMenuItem>
              <DropdownMenuItem data-testid="menuitem-archive">Archive</DropdownMenuItem>
              <DropdownMenuItem data-testid="menuitem-delete">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto bg-muted/30 px-10 py-6">
          <div className="mb-4 flex w-full justify-end">
            <Button variant="outline" size="sm" className="gap-1.5" data-testid="button-add-to-album">
              <Images className="h-3.5 w-3.5" />
              Add to album
            </Button>
          </div>

          <div className="flex w-full items-start gap-3">
            <Avatar className="h-[30px] w-[30px]">
              <AvatarFallback className="text-[11px]">AI</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col items-start gap-3.5">
              <p className="text-[13px] text-foreground">
                Here's your Boxing Gym Commercial 19s, 9:16. Want tweaks, or use it in an ad?
              </p>

              <div className="group relative">
                <MediaPlaceholder
                  className="h-[380px] w-[214px]"
                  showPlay
                  duration="19s"
                  rounded="rounded-xl"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/40 text-white opacity-0 hover-elevate group-hover:opacity-100"
                      data-testid="button-asset-menu"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuItem data-testid="menuitem-view">
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="menuitem-add-to-selects">
                      <Layers className="h-3.5 w-3.5" />
                      Add to Selects
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      data-testid="menuitem-edit-with-prompt"
                      onSelect={() => setLocation("/studio/edit?step=modify")}
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      Edit with Prompt
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="menuitem-save-to-album">
                      <Images className="h-3.5 w-3.5" />
                      Save to Album
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="menuitem-make-ads">
                      <Sparkles className="h-3.5 w-3.5" />
                      Make Ads
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="menuitem-download">
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger data-testid="menuitem-change-size">
                        Change Size
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-[260px] p-3">
                        <p className="pb-2.5 text-xs text-muted-foreground">
                          Resize your image to any aspect ratio, and AI will intelligently
                          fill the new areas.
                        </p>
                        <RadioGroup defaultValue="story" className="gap-2">
                          {sizeOptions.map((opt) => (
                            <Label
                              key={opt.value}
                              htmlFor={`size-${opt.value}`}
                              className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 hover-elevate has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5"
                            >
                              <RadioGroupItem
                                value={opt.value}
                                id={`size-${opt.value}`}
                                data-testid={`radio-size-${opt.value}`}
                              />
                              <span className="flex flex-col gap-0.5">
                                <span className="text-[13.5px] font-medium text-foreground">
                                  {opt.label}
                                </span>
                                <span className="text-[11.5px] text-muted-foreground">
                                  {opt.meta}
                                </span>
                              </span>
                            </Label>
                          ))}
                        </RadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-start gap-2.5">
                <Button
                  className="bg-foreground text-background border-foreground"
                  onClick={() => setLocation("/studio/edit")}
                  data-testid="button-make-ad"
                >
                  Make Ad
                </Button>
                <Button variant="outline" data-testid="button-use-in-brief">
                  Use in Brief
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast({ title: "Generating more", description: "Creating additional variations…" })
                  }
                  data-testid="button-generate-more"
                >
                  Generate more
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reply bar */}
        <div className="flex shrink-0 flex-col gap-2 border-t px-10 pb-4 pt-3.5">
          <div className="flex w-full items-center gap-2.5 rounded-xl border pl-3.5 pr-2.5 py-1">
            <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              placeholder="Type your reply, or ask for changes…"
              className="h-9 flex-1 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
              data-testid="input-reply"
            />
            <button
              type="button"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover-elevate"
              data-testid="button-send-reply"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[10.5px] text-muted-foreground">Tip: Press ⌥ to add context</p>
        </div>
      </div>
    </div>
  );
}
