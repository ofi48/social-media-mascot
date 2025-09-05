import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, X, Image, Video } from "lucide-react";
import { useSimilarity } from './SimilarityContext';

const FileUploadSection = () => {
  const { file1, file2, setFile1, setFile2, analyzeFiles, isAnalyzing } = useSimilarity();

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
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov']
    },
    maxFiles: 1,
    disabled: isAnalyzing
  });

  const { getRootProps: getRootProps2, getInputProps: getInputProps2, isDragActive: isDragActive2 } = useDropzone({
    onDrop: onDrop2,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov']
    },
    maxFiles: 1,
    disabled: isAnalyzing
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    return file.type.startsWith('image/') ? Image : Video;
  };

  const canAnalyze = file1 && file2 && !isAnalyzing;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File 1 Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              First File
            </CardTitle>
            <CardDescription>
              Upload the first file for comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            {file1 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  {React.createElement(getFileIcon(file1), { className: "h-8 w-8 text-primary" })}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file1.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file1.size)}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setFile1(null)}
                    disabled={isAnalyzing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                {...getRootProps1()} 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive1 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getInputProps1()} />
                <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  {isDragActive1 ? 'Drop the file here' : 'Drop file here or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Images: JPG, PNG, GIF, WebP • Videos: MP4, WebM, MOV
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File 2 Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Second File
            </CardTitle>
            <CardDescription>
              Upload the second file for comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            {file2 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  {React.createElement(getFileIcon(file2), { className: "h-8 w-8 text-primary" })}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file2.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file2.size)}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setFile2(null)}
                    disabled={isAnalyzing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                {...getRootProps2()} 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive2 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getInputProps2()} />
                <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  {isDragActive2 ? 'Drop the file here' : 'Drop file here or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Images: JPG, PNG, GIF, WebP • Videos: MP4, WebM, MOV
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Button */}
      <div className="flex justify-center">
        <Button 
          onClick={analyzeFiles}
          disabled={!canAnalyze}
          size="lg"
          className="px-8"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              Analyzing Files...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Analyze Similarity
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FileUploadSection;