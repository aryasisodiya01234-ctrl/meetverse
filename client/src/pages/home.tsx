import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Video, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateMeeting = async () => {
    setIsCreating(true);
    try {
      const meetingCode = Math.random().toString(36).substring(2, 11).toUpperCase();
      setLocation(`/pre-meeting?code=${meetingCode}&isHost=true`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
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
    setLocation(`/pre-meeting?code=${joinCode.toUpperCase()}&isHost=false`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && joinCode.trim()) {
      handleJoinMeeting();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Video className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-foreground">Video Meet</h1>
          <p className="text-muted-foreground">Professional video conferencing for everyone</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Get Started</CardTitle>
            <CardDescription>Create a new meeting or join an existing one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Button 
                onClick={handleCreateMeeting} 
                disabled={isCreating}
                className="w-full h-12"
                data-testid="button-create-meeting"
              >
                <Plus className="w-5 h-5 mr-2" />
                {isCreating ? "Creating..." : "New Meeting"}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-code" className="text-sm font-medium">
                  Join with code
                </Label>
                <Input
                  id="meeting-code"
                  type="text"
                  placeholder="Enter meeting code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  className="text-center text-lg tracking-wide font-mono uppercase"
                  maxLength={20}
                  data-testid="input-meeting-code"
                />
              </div>
              <Button 
                onClick={handleJoinMeeting}
                variant="outline"
                className="w-full h-12"
                disabled={!joinCode.trim()}
                data-testid="button-join-meeting"
              >
                Join Meeting
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/studio/shoots" className="underline hover:text-foreground" data-testid="link-studio-preview">
            Preview: Ad Studio UI
          </Link>
        </p>
      </div>
    </div>
  );
}
