import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  Crop,
  Eraser,
  Scissors,
  Sparkles,
  Type,
  Wand2,
} from "lucide-react";
import { MediaPlaceholder } from "@/components/studio/media-placeholder";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Step = "choose" | "modify" | "resize";

const actions: { key: Step | string; label: string; icon: typeof Wand2 }[] = [
  { key: "modify", label: "Modify image", icon: Wand2 },
  { key: "remove-objects", label: "Remove objects", icon: Scissors },
  { key: "remove-text", label: "Remove marketing text & overlays", icon: Type },
  { key: "remove-background", label: "Remove background", icon: Eraser },
  { key: "generate-background", label: "Generate background", icon: Sparkles },
  { key: "resize", label: "Change size", icon: Crop },
];

const examplePrompts = [
  "Replace the background with a soft studio gradient",
  "Make the lipstick a deeper red",
  "Add subtle rim lighting on the left",
];

const sizeOptions = [
  { value: "square", label: "Square", meta: "Instagram Post • 1080 × 1080" },
  { value: "portrait", label: "Portrait", meta: "Instagram Portrait • 1080 × 1350" },
  { value: "story", label: "Story/Reel", meta: "Instagram Story • 1080 × 1920" },
  { value: "landscape", label: "Landscape", meta: "Facebook Cover • 1920 × 1080" },
];

function initialStep(search: string): Step {
  const params = new URLSearchParams(search);
  const step = params.get("step");
  return step === "modify" || step === "resize" ? step : "choose";
}

// Screens "03 Choose an action", "04 Modify image" and "05 Change size" from the
// Figma "Shoots Edit Studio" flow, combined into one page driven by local step state.
export default function EditStudio() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(() => initialStep(search));
  const [prompt, setPrompt] = useState("Remove the hoop earring and warm up the lighting…");
  const [size, setSize] = useState("story");

  const handleAction = (key: string) => {
    if (key === "modify" || key === "resize") {
      setStep(key);
      return;
    }
    toast({
      title: "Not part of this preview",
      description: "This action isn't wired up in the UI preview yet.",
    });
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      <div className="flex h-[52px] shrink-0 items-center justify-between border-b pl-6 pr-5">
        <p className="text-[15px] font-bold text-foreground">Edit Studio</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-xs font-semibold text-muted-foreground hover-elevate rounded-md px-2 py-1"
            onClick={() => setLocation("/studio/shoots")}
            data-testid="button-exit-edit-studio"
          >
            Exit
          </button>
          {step !== "choose" && (
            <Button
              size="sm"
              className="bg-[#4caf69] text-white border-[#4caf69] hover-elevate active-elevate-2"
              onClick={() => setLocation("/studio/shoots")}
              data-testid="button-save-and-exit"
            >
              {step === "modify" ? "Save to New Image & Exit" : "Save As New Image & Exit"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {step === "choose" && (
          <div className="flex w-[360px] shrink-0 flex-col gap-5 border-r p-7">
            <p className="text-xl font-semibold text-foreground">Choose an action</p>
            <div className="flex flex-col gap-1">
              {actions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  className="flex w-full items-center justify-between rounded-md px-2.5 py-3 hover-elevate"
                  onClick={() => handleAction(action.key)}
                  data-testid={`action-${action.key}`}
                >
                  <span className="flex items-center gap-2.5">
                    <action.icon className="h-[17px] w-[17px] text-muted-foreground" />
                    <span className="text-[13.5px] font-medium text-foreground">{action.label}</span>
                  </span>
                  <ChevronRight className="h-[15px] w-[15px] text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "modify" && (
          <div className="flex w-[360px] shrink-0 flex-col gap-4 overflow-y-auto border-r px-[22px] py-5">
            <button
              type="button"
              className="flex items-center gap-0.5 self-start text-[11.5px] font-semibold text-primary"
              onClick={() => setStep("choose")}
              data-testid="button-back-to-actions"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back to Action Selection
            </button>
            <p className="text-lg font-bold text-foreground">Modify image</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Describe how you want to modify your image using AI.
            </p>
            <div className="flex flex-col gap-2">
              <Label className="text-[12.5px] font-semibold text-foreground">
                What would you like to change?
              </Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[80px] resize-none rounded-lg text-[12.5px]"
                data-testid="textarea-modify-prompt"
              />
            </div>
            <p className="text-[11.5px] font-semibold text-muted-foreground">Example prompts</p>
            <div className="flex flex-col gap-2">
              {examplePrompts.map((example) => (
                <button
                  key={example}
                  type="button"
                  className="rounded-lg border bg-muted/40 px-3 py-2.5 text-left text-[11.5px] text-foreground hover-elevate"
                  onClick={() => setPrompt(example)}
                  data-testid={`example-prompt-${example.slice(0, 10).replace(/\s+/g, "-").toLowerCase()}`}
                >
                  {example}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <Button
              className="w-full bg-foreground text-background border-foreground py-3"
              onClick={() =>
                toast({ title: "Modifying image", description: "Applying your prompt…" })
              }
              data-testid="button-modify-image"
            >
              Modify Image
            </Button>
          </div>
        )}

        {step === "resize" && (
          <div className="flex w-[360px] shrink-0 flex-col gap-4 border-r p-7">
            <button
              type="button"
              className="flex items-center gap-0.5 self-start text-[12.5px] text-primary"
              onClick={() => setStep("choose")}
              data-testid="button-back-to-actions"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back to Action Selection
            </button>
            <p className="text-xl font-semibold text-foreground">Change size</p>
            <p className="text-[13px] text-muted-foreground">
              Resize your image to any aspect ratio, and AI will intelligently fill the new
              areas.
            </p>
            <RadioGroup value={size} onValueChange={setSize} className="gap-2.5">
              {sizeOptions.map((opt) => (
                <Label
                  key={opt.value}
                  htmlFor={`resize-${opt.value}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-3 hover-elevate",
                    size === opt.value && "border-primary bg-primary/5",
                  )}
                >
                  <RadioGroupItem
                    value={opt.value}
                    id={`resize-${opt.value}`}
                    data-testid={`radio-resize-${opt.value}`}
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[13.5px] font-medium text-foreground">{opt.label}</span>
                    <span className="text-[11.5px] text-muted-foreground">{opt.meta}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
            <div className="flex-1" />
            <Button
              className="w-full bg-foreground text-background border-foreground py-3"
              onClick={() =>
                toast({ title: "Generating canvas", description: "Expanding your image…" })
              }
              data-testid="button-generate-expanded-canvas"
            >
              Generate Expanded Canvas
            </Button>
          </div>
        )}

        <div className="flex flex-1 items-center justify-center bg-muted/40 p-10">
          {step === "resize" ? (
            <div className="flex h-[480px] w-[340px] items-center justify-center rounded-lg border-[1.5px] border-dashed border-primary">
              <MediaPlaceholder className="h-[360px] w-[260px]" rounded="rounded" />
            </div>
          ) : (
            <MediaPlaceholder className="h-[420px] w-[300px]" rounded="rounded-lg" />
          )}
        </div>
      </div>
    </div>
  );
}
