import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import VideoRepurposerPage from "./pages/VideoRepurposer";
import VideoSimilarityDetector from "./pages/VideoSimilarityDetector";
import ImageSimilarityDetector from "./pages/ImageSimilarityDetector";
import ImageSpoofer from "./pages/ImageSpoofer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/video-repurposer" replace />} />
            <Route path="/video-repurposer" element={<VideoRepurposerPage />} />
            <Route path="/video-spoofer" element={<Navigate to="/video-repurposer" replace />} />
            <Route path="/video-similarity" element={<VideoSimilarityDetector />} />
            <Route path="/image-similarity" element={<ImageSimilarityDetector />} />
            <Route path="/image-spoofer" element={<ImageSpoofer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
