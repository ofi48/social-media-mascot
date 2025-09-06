import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessVideoTab } from "./ProcessVideoTab";
import { PresetManager } from "./PresetManager";
import { ResultsTab } from "./ResultsTab";
import { VideoPreview } from "./VideoPreview";
import { VideoProcessingProvider } from "./VideoProcessingProvider";
import { useVideoProcessing } from "@/hooks/useVideoProcessing";
import { useVideoQueue } from "@/hooks/useVideoQueue";
import { VideoPresetSettings, DEFAULT_PRESET } from "@/types/video-preset";
import { toast } from 'sonner';

export const VideoRepurposer = () => {
  const [activeTab, setActiveTab] = useState("process");
  const [settings, setSettings] = useState<VideoPresetSettings>(DEFAULT_PRESET);
  const [queueFiles, setQueueFiles] = useState<File[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");

  // Single video processing
  const {
    uploadedFile,
    uploadedFileUrl,
    isProcessing,
    progress,
    results,
    handleFileSelect,
    processVideo,
    resetResults
  } = useVideoProcessing();

  // Batch processing
  const {
    queue,
    isProcessing: isBatchProcessing,
    currentItem,
    addVideosToQueue,
    removeFromQueue,
    clearQueue,
    retryJob,
    processBatch
  } = useVideoQueue();

  // Combine all results for the Results tab
  const allResults = [
    ...results,
    ...queue.filter(job => job.status === 'completed').flatMap(job => job.results || [])
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleFilesAdded = (files: File[]) => {
    setQueueFiles(prev => [...prev, ...files]);
  };

  const handleFileRemoved = (index: number) => {
    setQueueFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearFiles = () => {
    setQueueFiles([]);
  };

  const handleStartBatch = (files: File[], batchSettings: VideoPresetSettings, copies: number) => {
    addVideosToQueue(files, batchSettings, copies);
    setQueueFiles([]); // Clear the file list after adding to queue
    processBatch();
  };

  const handlePreview = (name: string, url: string) => {
    setPreviewFileName(name);
    setPreviewUrl(url);
    setShowPreview(true);
  };

  const handleDownload = async (name: string, url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(downloadUrl);
      toast.success(`Downloaded ${name}`);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  return (
    <VideoProcessingProvider>
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl font-bold text-foreground">Video Repurposer</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Transform your videos into multiple unique variations with advanced processing effects. 
              Perfect for content creators, marketers, and social media managers.
            </p>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="process" className="flex items-center gap-2">
                Process Video
              </TabsTrigger>
              <TabsTrigger value="presets" className="flex items-center gap-2">
                Manage Presets
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2">
                Results
                {allResults.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                    {allResults.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="process" className="mt-6">
              <ProcessVideoTab />
            </TabsContent>
            
            <TabsContent value="presets" className="mt-6">
              <PresetManager
                currentSettings={settings}
                onLoadPreset={setSettings}
              />
            </TabsContent>
            
            <TabsContent value="results" className="mt-6">
              <ResultsTab
                results={allResults}
                batchResults={queue.filter(job => job.status === 'completed')}
                onPreview={handlePreview}
                onDownload={handleDownload}
                onClearResults={() => {
                  resetResults();
                  clearQueue();
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Video Preview Modal */}
      {showPreview && (
        <VideoPreview
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          videoUrl={previewUrl}
          fileName={previewFileName}
          onDownload={() => handleDownload(previewFileName, previewUrl)}
        />
      )}
      </div>
    </VideoProcessingProvider>
  );
};

export default VideoRepurposer;