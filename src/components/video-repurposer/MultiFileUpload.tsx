import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Video, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MultiFileUploadProps {
  files: File[];
  onFilesAdded: (files: File[]) => void;
  onFileRemoved: (index: number) => void;
  onClearAll: () => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

export const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  files,
  onFilesAdded,
  onFileRemoved,
  onClearAll,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024 // 100MB
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize) {
        console.warn(`File ${file.name} is too large (${Math.round(file.size / (1024 * 1024))}MB)`);
        return false;
      }
      return file.type.startsWith('video/');
    });

    if (files.length + validFiles.length > maxFiles) {
      const remainingSlots = maxFiles - files.length;
      onFilesAdded(validFiles.slice(0, remainingSlots));
    } else {
      onFilesAdded(validFiles);
    }
  }, [files.length, maxFiles, maxSize, onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm']
    },
    multiple: true,
    maxFiles: maxFiles - files.length
  });

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <Card 
        {...getRootProps()} 
        className={`border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 px-4">
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <div className="text-center">
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop videos here' : 'Upload videos for batch processing'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Drag & drop video files or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Max {maxFiles} files, up to {Math.round(maxSize / (1024 * 1024))}MB each
            </p>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Selected Videos ({files.length})</h3>
            <Button variant="outline" size="sm" onClick={onClearAll}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>

          <div className="grid gap-3">
            {files.map((file, index) => (
              <div 
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Video className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFileRemoved(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};