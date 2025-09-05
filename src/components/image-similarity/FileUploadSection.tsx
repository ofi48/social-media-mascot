import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Image } from "lucide-react";
import { useImageSimilarity } from './ImageSimilarityContext';

const FileUploadSection = () => {
  const { file1, file2, setFile1, setFile2, analyzeImages, isAnalyzing } = useImageSimilarity();

  const onDrop1 = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile1(acceptedFiles[0]);
    }
  }, [setFile1]);

  const onDrop2 = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile2(acceptedFiles[0]);
    }
  }, [setFile2]);

  const { getRootProps: getRootProps1, getInputProps: getInputProps1, isDragActive: isDragActive1 } = useDropzone({
    onDrop: onDrop1,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

  const { getRootProps: getRootProps2, getInputProps: getInputProps2, isDragActive: isDragActive2 } = useDropzone({
    onDrop: onDrop2,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File 1 Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Image 1
            </CardTitle>
            <CardDescription>
              Upload the first image for comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            {file1 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Image className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium">{file1.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file1.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile1(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="w-full h-32 rounded-lg overflow-hidden border">
                  <img
                    src={URL.createObjectURL(file1)}
                    alt="Preview 1"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div
                {...getRootProps1()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive1
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps1()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {isDragActive1 ? 'Drop image here' : 'Upload Image 1'}
                </p>
                <p className="text-muted-foreground text-sm">
                  Drag and drop an image, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports: JPEG, PNG, GIF, BMP, WebP
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File 2 Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Image 2
            </CardTitle>
            <CardDescription>
              Upload the second image for comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            {file2 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Image className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium">{file2.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file2.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile2(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="w-full h-32 rounded-lg overflow-hidden border">
                  <img
                    src={URL.createObjectURL(file2)}
                    alt="Preview 2"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div
                {...getRootProps2()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive2
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps2()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {isDragActive2 ? 'Drop image here' : 'Upload Image 2'}
                </p>
                <p className="text-muted-foreground text-sm">
                  Drag and drop an image, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports: JPEG, PNG, GIF, BMP, WebP
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analyze Button */}
      <div className="flex justify-center">
        <Button
          onClick={analyzeImages}
          disabled={!file1 || !file2 || isAnalyzing}
          size="lg"
          className="min-w-48"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            'Analyze Similarity'
          )}
        </Button>
      </div>
    </div>
  );
};

export default FileUploadSection;