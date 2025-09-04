import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Video, X } from "lucide-react";
import { useVideoProcessing } from "./VideoProcessingContext";
import { toast } from "sonner";

interface VideoUploadProps {
  mode: 'single' | 'batch';
  onFilesSelected: (files: File[]) => void;
  maxFiles: number;
}

export const VideoUpload = ({ mode, onFilesSelected, maxFiles }: VideoUploadProps) => {
  const { addToQueue } = useVideoProcessing();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast.error("Please select valid video files");
      return;
    }

    if (acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file types
    const validFiles = acceptedFiles.filter(file => {
      const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/quicktime'];
      return validTypes.includes(file.type) || file.name.toLowerCase().match(/\.(mp4|avi|mov|webm|qt)$/);
    });

    if (validFiles.length !== acceptedFiles.length) {
      toast.error("Some files were rejected. Only video files are supported.");
    }

    if (validFiles.length === 0) {
      return;
    }

    // Check file sizes (max 500MB)
    const oversizedFiles = validFiles.filter(file => file.size > 500 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Some files exceed the 500MB limit");
      return;
    }

    onFilesSelected(validFiles);
    
    if (mode === 'batch') {
      addToQueue(validFiles);
      toast.success(`${validFiles.length} video(s) added to queue`);
    } else {
      toast.success("Video uploaded successfully");
    }
  }, [onFilesSelected, maxFiles, mode, addToQueue]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.webm', '.qt']
    },
    maxFiles,
    maxSize: 500 * 1024 * 1024 // 500MB
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-sm text-primary">Drop the video files here...</p>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop your video files here, or click to browse
            </p>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Choose Video Files
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Supports: MP4, AVI, MOV, WebM (Max 500MB each)
          {mode === 'batch' && ` • Up to ${maxFiles} files`}
        </p>
      </div>

      {acceptedFiles.length > 0 && mode === 'single' && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-sm">{acceptedFiles[0].name}</p>
                <p className="text-xs text-muted-foreground">
                  {(acceptedFiles[0].size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            </div>
            <Badge variant="secondary">Ready</Badge>
          </div>
        </Card>
      )}
    </div>
  );
};