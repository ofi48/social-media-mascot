import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from "@/components/ui/card";
import { Upload, Video, X } from 'lucide-react';
import { validateAndShowErrors } from '@/utils/videoValidation';

interface VideoUploadProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  maxSize?: number;
}

export function VideoUpload({ 
  onFilesSelected, 
  multiple = false, 
  disabled = false,
  maxSize = 100 * 1024 * 1024 // 100MB default
}: VideoUploadProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles = await validateAndShowErrors(acceptedFiles, maxSize);
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [onFilesSelected, maxSize]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.wmv', '.flv', '.m4v']
    },
    multiple,
    disabled,
    maxSize
  });

  const getBorderColor = () => {
    if (disabled) return 'border-muted';
    if (isDragReject) return 'border-destructive';
    if (isDragActive) return 'border-primary';
    return 'border-border';
  };

  const getBackgroundColor = () => {
    if (disabled) return 'bg-muted/50';
    if (isDragActive) return 'bg-primary/5';
    return 'bg-background';
  };

  return (
    <Card className={`border-2 border-dashed transition-colors ${getBorderColor()} ${getBackgroundColor()}`}>
      <div
        {...getRootProps()}
        className={`p-8 text-center cursor-pointer transition-all hover:bg-muted/50 ${
          disabled ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {isDragActive ? (
            <>
              <Upload className="mx-auto h-12 w-12 text-primary animate-bounce" />
              <p className="text-lg font-medium text-primary">Drop videos here</p>
            </>
          ) : (
            <>
              <Video className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium text-foreground">
                  {multiple ? 'Upload videos' : 'Upload a video'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag and drop {multiple ? 'video files' : 'a video file'} here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports MP4, MOV, AVI, MKV, WebM • Max {(maxSize / (1024 * 1024)).toFixed(0)}MB per file
                </p>
              </div>
            </>
          )}
          
          {isDragReject && (
            <div className="text-destructive">
              <X className="mx-auto h-8 w-8" />
              <p className="text-sm mt-2">Invalid file type or size</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}