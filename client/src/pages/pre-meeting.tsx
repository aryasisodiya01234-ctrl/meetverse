import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, VideoOff, Mic, MicOff, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PreMeeting() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const params = new URLSearchParams(window.location.search);
  const meetingCode = params.get("code") || "";
  const isHost = params.get("isHost") === "true";
  
  const [name, setName] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMic, setSelectedMic] = useState<string>("");

  useEffect(() => {
    const initDevices = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        const deviceList = await navigator.mediaDevices.enumerateDevices();
        setDevices(deviceList);
        
        const videoDevice = deviceList.find(d => d.kind === "videoinput");
        const audioDevice = deviceList.find(d => d.kind === "audioinput");
        
        if (videoDevice) setSelectedCamera(videoDevice.deviceId);
        if (audioDevice) setSelectedMic(audioDevice.deviceId);
      } catch (error) {
        toast({
          title: "Camera/Microphone access denied",
          description: "Please allow access to your camera and microphone to join the meeting.",
          variant: "destructive",
        });
      }
    };

    initDevices();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleJoinMeeting = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to join the meeting.",
        variant: "destructive",
      });
      return;
    }
    
    setLocation(`/meeting?code=${meetingCode}&name=${encodeURIComponent(name)}&isHost=${isHost}&muted=${isMuted}&videoOff=${isVideoOff}`);
  };

  const cameras = devices.filter(d => d.kind === "videoinput");
  const microphones = devices.filter(d => d.kind === "audioinput");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Ready to join?</CardTitle>
          <CardDescription>
            Meeting code: <span className="font-mono font-semibold text-foreground">{meetingCode}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isVideoOff ? "hidden" : ""}`}
              data-testid="video-preview"
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <VideoOff className="w-12 h-12" />
                  <p className="text-sm">Camera is off</p>
                </div>
              </div>
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <Button
                size="icon"
                variant={isMuted ? "destructive" : "secondary"}
                onClick={toggleMute}
                className="rounded-full w-12 h-12"
                data-testid="button-toggle-mic"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button
                size="icon"
                variant={isVideoOff ? "destructive" : "secondary"}
                onClick={toggleVideo}
                className="rounded-full w-12 h-12"
                data-testid="button-toggle-camera"
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleJoinMeeting()}
                data-testid="input-participant-name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="camera" className="text-xs flex items-center gap-2">
                  <Settings className="w-3 h-3" />
                  Camera
                </Label>
                <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                  <SelectTrigger id="camera" data-testid="select-camera">
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {cameras.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${cameras.indexOf(device) + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="microphone" className="text-xs flex items-center gap-2">
                  <Settings className="w-3 h-3" />
                  Microphone
                </Label>
                <Select value={selectedMic} onValueChange={setSelectedMic}>
                  <SelectTrigger id="microphone" data-testid="select-microphone">
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    {microphones.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${microphones.indexOf(device) + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleJoinMeeting}
            className="w-full h-12"
            data-testid="button-join-now"
          >
            Join Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
