import { useState, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { toast } from 'sonner';

interface PreprocessingOptions {
  trimStart?: number; // seconds to trim from start (0-1s if enabled)
  trimEnd?: number;   // seconds to trim from end (0-1s if enabled)
}

export interface PreprocessingProgress {
  progress: number;
  stage: 'loading' | 'preprocessing' | 'complete';
  message: string;
}

export const useFFmpegPreprocessing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);

  const loadFFmpeg = useCallback(async (): Promise<FFmpeg> => {
    if (ffmpeg) return ffmpeg;

    const ffmpegInstance = new FFmpeg();
    
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      await ffmpegInstance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      setFFmpeg(ffmpegInstance);
      return ffmpegInstance;
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      throw new Error('Failed to initialize video preprocessor');
    }
  }, [ffmpeg]);

  const preprocessVideo = useCallback(async (
    file: File, 
    options: PreprocessingOptions = {},
    onProgress?: (progress: PreprocessingProgress) => void
  ): Promise<File> => {
    setIsLoading(true);
    
    try {
      onProgress?.({ progress: 10, stage: 'loading', message: 'Loading FFmpeg...' });
      
      const ffmpegInstance = await loadFFmpeg();
      
      onProgress?.({ progress: 20, stage: 'loading', message: 'Preparing video file...' });
      
      // Write input file
      const inputName = 'input.mp4';
      const outputName = 'output.mp4';
      
      await ffmpegInstance.writeFile(inputName, await fetchFile(file));
      
      onProgress?.({ progress: 30, stage: 'preprocessing', message: 'Compressing video...' });
      
      // Build FFmpeg command
      const args = [
        '-i', inputName,
        '-vf', 'scale=w=1920:h=1080:force_original_aspect_ratio=decrease',
        '-b:v', '3500k',
        '-b:a', '128k',
        '-preset', 'fast'
      ];
      
      // Add trim if specified
      if (options.trimStart && options.trimStart > 0) {
        args.splice(2, 0, '-ss', options.trimStart.toString());
      }
      
      if (options.trimEnd && options.trimEnd > 0) {
        args.splice(-1, 0, '-t', (await getVideoDuration(file) - options.trimEnd).toString());
      }
      
      args.push(outputName);
      
      // Set up progress tracking
      ffmpegInstance.on('progress', ({ progress }: { progress: number }) => {
        const adjustedProgress = 30 + (progress * 60); // 30-90%
        onProgress?.({ 
          progress: adjustedProgress, 
          stage: 'preprocessing', 
          message: `Processing video... ${Math.round(adjustedProgress)}%` 
        });
      });
      
      // Execute FFmpeg command
      await ffmpegInstance.exec(args);
      
      onProgress?.({ progress: 95, stage: 'complete', message: 'Finalizing...' });
      
      // Read output file
      const outputData = await ffmpegInstance.readFile(outputName);
      const outputBlob = new Blob([outputData], { type: 'video/mp4' });
      
      // Create new File object
      const processedFile = new File(
        [outputBlob], 
        file.name.replace(/\.[^/.]+$/, '_compressed.mp4'), 
        { type: 'video/mp4' }
      );
      
      // Clean up
      await ffmpegInstance.deleteFile(inputName);
      await ffmpegInstance.deleteFile(outputName);
      
      onProgress?.({ progress: 100, stage: 'complete', message: 'Preprocessing complete!' });
      
      return processedFile;
      
    } catch (error) {
      console.error('FFmpeg preprocessing error:', error);
      throw new Error(`Preprocessing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [loadFFmpeg]);

  return {
    preprocessVideo,
    isLoading,
    loadFFmpeg
  };
};

// Helper function to get video duration
const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = URL.createObjectURL(file);
  });
};