import React, { createContext, useContext, useState } from 'react';
import { VideoPresetSettings, DEFAULT_PRESET } from '@/types/video-preset';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';
import { useVideoQueue } from '@/hooks/useVideoQueue';
import { usePresetManager } from '@/hooks/usePresetManager';

interface VideoProcessingContextType {
  // Settings
  settings: VideoPresetSettings;
  updateSettings: (newSettings: Partial<VideoPresetSettings>) => void;
  resetSettings: () => void;
  
  // Single video processing
  singleProcessing: ReturnType<typeof useVideoProcessing>;
  
  // Batch processing
  batchProcessing: ReturnType<typeof useVideoQueue>;
  
  // Preset management
  presetManager: ReturnType<typeof usePresetManager>;
  
  // UI state
  processingMode: 'single' | 'batch';
  setProcessingMode: (mode: 'single' | 'batch') => void;
}

const VideoProcessingContext = createContext<VideoProcessingContextType | undefined>(undefined);

export function VideoProcessingProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<VideoPresetSettings>(DEFAULT_PRESET);
  const [processingMode, setProcessingMode] = useState<'single' | 'batch'>('single');
  
  // Initialize hooks
  const singleProcessing = useVideoProcessing();
  const batchProcessing = useVideoQueue();
  const presetManager = usePresetManager();

  const updateSettings = (newSettings: Partial<VideoPresetSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_PRESET);
  };

  const value: VideoProcessingContextType = {
    settings,
    updateSettings,
    resetSettings,
    singleProcessing,
    batchProcessing,
    presetManager,
    processingMode,
    setProcessingMode
  };

  return (
    <VideoProcessingContext.Provider value={value}>
      {children}
    </VideoProcessingContext.Provider>
  );
}

export function useVideoProcessingContext() {
  const context = useContext(VideoProcessingContext);
  if (context === undefined) {
    throw new Error('useVideoProcessingContext must be used within a VideoProcessingProvider');
  }
  return context;
}