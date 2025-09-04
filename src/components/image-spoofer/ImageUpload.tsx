import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image, FileImage } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  mode: 'single' | 'batch';
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  mode, 
  onFilesSelected, 
  maxFiles = 10 
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      toast.error(`Some files were rejected. Please check file types and sizes.`);
    }

    if (acceptedFiles.length > 0) {
      const newFiles = mode === 'single' ? [acceptedFiles[0]] : acceptedFiles;
      setUploadedFiles(newFiles);
      onFilesSelected(newFiles);
      toast.success(`${newFiles.length} image${newFiles.length > 1 ? 's' : ''} uploaded successfully`);
    }
  }, [mode, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp']
    },
    maxFiles: mode === 'single' ? 1 : maxFiles,
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: mode === 'batch'
  });

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          {isDragActive 
            ? 'Drop the images here' 
            : `Drag & drop image${mode === 'batch' ? 's' : ''} here, or click to browse`
          }
        </p>
        <Button variant="outline" size="sm">
          Choose Image{mode === 'batch' ? 's' : ''}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Supports: JPEG, PNG, GIF, WebP, BMP (Max 50MB each)
          {mode === 'batch' && ` • Up to ${maxFiles} images`}
        </p>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Uploaded Images ({uploadedFiles.length})
            </h4>
            <Badge variant="secondary">
              {formatFileSize(uploadedFiles.reduce((sum, file) => sum + file.size, 0))}
            </Badge>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {file.type.startsWith('image/') ? (
                      <FileImage className="h-8 w-8 text-primary" />
                    ) : (
                      <Image className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{file.type}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};