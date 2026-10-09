import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, History, Plus, Sparkles, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RECENTS_KEY = "recentMeetings";
const MAX_RECENTS = 4;

interface RecentMeeting {
  code: string;
  isHost: boolean;
  ts: number;
}

function loadRecents(): RecentMeeting[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? (JSON.parse(raw) as RecentMeeting[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(code: string, isHost: boolean) {
  try {
    const existing = loadRecents().filter((m) => m.code !== code);
    const next = [{ code, isHost, ts: Date.now() }, ...existing].slice(0, MAX_RECENTS);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private mode, etc.) — not critical
  }
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [recents, setRecents] = useState<RecentMeeting[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  const handleCreateMeeting = async () => {
    setIsCreating(true);
    try {
      const meetingCode = Math.random().toString(36).substring(2, 11).toUpperCase();
      saveRecent(meetingCode, true);
      setLocation(`/pre-meeting?code=${meetingCode}&isHost=true`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create meeting. Please try again.",
        variant: "destructive",
      });
      setIsCreating(false);
    }
  };

  const goToMeeting = (code: string, isHost: boolean) => {
    saveRecent(code, isHost);
    setLocation(`/pre-meeting?code=${code}&isHost=${isHost}`);
  };

  const handleJoinMeeting = () => {
    if (!joinCode.trim()) {
      toast({
        title: "Missing code",
        description: "Please enter a meeting code to join.",
        variant: "destructive",
      });
      return;
    }
    goToMeeting(joinCode.toUpperCase(), false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && joinCode.trim()) {
      handleJoinMeeting();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-[70%] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-[26rem] w-[26rem] translate-x-1/3 rounded-full bg-chart-3/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-[20rem] w-[20rem] rounded-full bg-chart-2/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl space-y-8">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center space-y-3 text-center"
          >
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
              <Video className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Video Meet</h1>
            <p className="max-w-sm text-base text-muted-foreground">
              Crystal-clear video calls, instantly. No downloads, no sign-up.
            </p>
          </motion.div>

          {/* Main action card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="overflow-hidden rounded-3xl border bg-card shadow-xl shadow-black/5"
          >
            <div className="grid md:grid-cols-2 md:divide-x">
              {/* Start a meeting */}
              <div className="flex flex-col justify-between gap-6 p-8">
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Start an instant meeting</h2>
                  <p className="text-sm text-muted-foreground">
                    Create a new room and share the code with anyone you want to join.
                  </p>
                </div>
                <Button
                  onClick={handleCreateMeeting}
                  disabled={isCreating}
                  size="lg"
                  className="group h-12 w-full rounded-xl text-base"
                  data-testid="button-create-meeting"
                >
                  <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                  {isCreating ? "Creating..." : "New Meeting"}
                </Button>
              </div>

              {/* Join a meeting */}
              <div className="flex flex-col justify-between gap-6 border-t p-8 md:border-t-0">
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <ArrowRight className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Join a meeting</h2>
                  <p className="text-sm text-muted-foreground">
                    Have a code already? Enter it below to hop straight in.
                  </p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="meeting-code" className="sr-only">
                    Meeting code
                  </Label>
                  <Input
                    id="meeting-code"
                    type="text"
                    placeholder="Enter meeting code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    onKeyPress={handleKeyPress}
                    className="h-12 rounded-xl text-center text-lg tracking-wide font-mono uppercase"
                    maxLength={20}
                    data-testid="input-meeting-code"
                  />
                  <Button
                    onClick={handleJoinMeeting}
                    variant="secondary"
                    size="lg"
                    className="h-12 w-full rounded-xl text-base"
                    disabled={!joinCode.trim()}
                    data-testid="button-join-meeting"
                  >
                    Join Meeting
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent meetings */}
          {recents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="space-y-2.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <History className="h-3.5 w-3.5" />
                Recent
              </div>
              <div className="flex flex-wrap gap-2">
                {recents.map((meeting) => (
                  <button
                    key={meeting.code}
                    onClick={() => goToMeeting(meeting.code, meeting.isHost)}
                    className="hover-elevate rounded-full border bg-card px-3.5 py-1.5 font-mono text-xs tracking-wide text-foreground"
                    data-testid={`button-recent-${meeting.code}`}
                  >
                    {meeting.code}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
