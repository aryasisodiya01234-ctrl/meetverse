import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import PreMeeting from "@/pages/pre-meeting";
import Meeting from "@/pages/meeting";
import NotFound from "@/pages/not-found";
import ShootsResult from "@/pages/studio/shoots-result";
import EditStudio from "@/pages/studio/edit-studio";
import VideoEditor from "@/pages/studio/video-editor";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pre-meeting" component={PreMeeting} />
      <Route path="/meeting" component={Meeting} />
      <Route path="/studio/shoots" component={ShootsResult} />
      <Route path="/studio/edit" component={EditStudio} />
      <Route path="/studio/video" component={VideoEditor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
