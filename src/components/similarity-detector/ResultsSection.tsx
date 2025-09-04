import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart3, CheckCircle, AlertTriangle, Clock, File, Image, Video } from "lucide-react";
import { useSimilarity } from './SimilarityContext';

const ResultsSection = () => {
  const { currentResult, progress, isAnalyzing } = useSimilarity();

  const getSimilarityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSimilarityLevel = (score: number) => {
    if (score >= 80) return 'Nearly Identical';
    if (score >= 60) return 'Very Similar';
    if (score >= 30) return 'Somewhat Similar';
    return 'Significantly Different';
  };

  const formatFileInfo = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const Icon = isImage ? Image : Video;
    return (
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="truncate">{file.name}</span>
      </div>
    );
  };

  if (!currentResult && !isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analysis Results
          </CardTitle>
          <CardDescription>
            Upload two files and start analysis to see detailed similarity metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No analysis results yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload two files to compare their visual similarity
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
            Analyzing Files...
          </CardTitle>
          <CardDescription>
            Processing visual similarity metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">
              {progress}% complete
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Similarity Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentResult.isIdentical ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <BarChart3 className="h-5 w-5 text-primary" />
            )}
            Overall Similarity Score
          </CardTitle>
          <CardDescription>
            Composite similarity based on multiple visual analysis algorithms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`text-6xl font-bold ${getSimilarityColor(currentResult.overallSimilarity)}`}>
              {currentResult.overallSimilarity}%
            </div>
            <Badge variant={currentResult.overallSimilarity >= 60 ? 'default' : 'secondary'} className="text-sm">
              {getSimilarityLevel(currentResult.overallSimilarity)}
            </Badge>
            <Progress 
              value={currentResult.overallSimilarity} 
              className="w-full max-w-md mx-auto" 
            />
            {currentResult.isIdentical && (
              <p className="text-green-600 font-medium">Files are binary identical</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">File 1</CardTitle>
          </CardHeader>
          <CardContent>
            {formatFileInfo(currentResult.file1)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">File 2</CardTitle>
          </CardHeader>
          <CardContent>
            {formatFileInfo(currentResult.file2)}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
          <CardDescription>
            Breakdown of individual similarity metrics and technical details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* Visual Similarity Metrics */}
            <AccordionItem value="visual-metrics">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Visual Similarity Metrics
                  <Badge variant="outline">{Object.keys(currentResult.metrics).length} metrics</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Perceptual Hash Similarity</span>
                      <span className="text-sm text-muted-foreground">{currentResult.metrics.perceptualHash}%</span>
                    </div>
                    <Progress value={currentResult.metrics.perceptualHash} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Measures visual pattern similarity using compact hash representations
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Structural Similarity (SSIM)</span>
                      <span className="text-sm text-muted-foreground">{currentResult.metrics.ssim}%</span>
                    </div>
                    <Progress value={currentResult.metrics.ssim} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Analyzes luminance, contrast, and structure preservation
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Brightness Consistency</span>
                      <span className="text-sm text-muted-foreground">{currentResult.metrics.brightnesseDifference}%</span>
                    </div>
                    <Progress value={currentResult.metrics.brightnesseDifference} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Measures overall brightness and exposure similarity
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Color Histogram Similarity</span>
                      <span className="text-sm text-muted-foreground">{currentResult.metrics.colorHistogram}%</span>
                    </div>
                    <Progress value={currentResult.metrics.colorHistogram} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Compares color distribution patterns and palette usage
                    </p>
                  </div>

                  {currentResult.metrics.repeatedFrames !== undefined && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Repeated Frame Analysis</span>
                        <span className="text-sm text-muted-foreground">{currentResult.metrics.repeatedFrames}%</span>
                      </div>
                      <Progress value={currentResult.metrics.repeatedFrames} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Identifies duplicate frames and static content
                      </p>
                    </div>
                  )}

                  {currentResult.metrics.temporalSimilarity !== undefined && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Temporal Similarity</span>
                        <span className="text-sm text-muted-foreground">{currentResult.metrics.temporalSimilarity}%</span>
                      </div>
                      <Progress value={currentResult.metrics.temporalSimilarity} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Analyzes frame-to-frame changes and motion patterns
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Technical Details */}
            <AccordionItem value="technical-details">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Technical Details
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Processing Time:</span>
                      <p className="text-muted-foreground">{currentResult.processingTime}ms</p>
                    </div>
                    <div>
                      <span className="font-medium">Analysis Type:</span>
                      <p className="text-muted-foreground">
                        {currentResult.file1.type.startsWith('image/') ? 'Image Analysis' : 'Video Analysis'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Binary Identity:</span>
                      <p className="text-muted-foreground">
                        {currentResult.isIdentical ? 'Identical' : 'Different'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Timestamp:</span>
                      <p className="text-muted-foreground">
                        {currentResult.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Processing Notes */}
            <AccordionItem value="processing-notes">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  Processing Notes
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    • Perceptual hash analysis uses 8x8 pixel reduction for pattern recognition
                  </p>
                  <p>
                    • SSIM calculation considers luminance, contrast, and structural information
                  </p>
                  <p>
                    • Color histogram analysis uses 256-bin grayscale distribution
                  </p>
                  <p>
                    • All metrics are normalized to 0-100% scale for consistency
                  </p>
                  {currentResult.file1.type.startsWith('video/') && (
                    <>
                      <p>
                        • Video analysis samples frames at 1-second intervals
                      </p>
                      <p>
                        • Temporal analysis measures frame-to-frame visual changes
                      </p>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsSection;