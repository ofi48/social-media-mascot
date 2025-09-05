import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart3, CheckCircle, AlertTriangle, Clock, Image } from "lucide-react";
import { useImageSimilarity } from './ImageSimilarityContext';

const ResultsSection = () => {
  const { currentResult, progress, isAnalyzing } = useImageSimilarity();

  const getSimilarityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSimilarityLevel = (score: number) => {
    if (score >= 90) return 'Nearly Identical';
    if (score >= 80) return 'Very Similar';
    if (score >= 60) return 'Similar';
    if (score >= 40) return 'Somewhat Similar';
    if (score >= 20) return 'Slightly Similar';
    return 'Very Different';
  };

  const formatFileInfo = (fileInfo: { name: string; size: number; type: string }) => (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
      <Image className="w-8 h-8 text-primary" />
      <div>
        <p className="font-medium">{fileInfo.name}</p>
        <p className="text-sm text-muted-foreground">
          {fileInfo.type} • {(fileInfo.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
    </div>
  );

  if (!currentResult && !isAnalyzing) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Analysis Results</h3>
            <p>Upload two images and run the analysis to see results here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Analyzing Images...</h3>
            <p className="text-muted-foreground mb-4">
              Running multi-layered similarity analysis
            </p>
            <div className="max-w-md mx-auto">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
            </div>
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
            <CheckCircle className="w-5 h-5 text-green-600" />
            Overall Similarity Score
          </CardTitle>
          <CardDescription>
            Comprehensive analysis result across all methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getSimilarityColor(currentResult!.overall_similarity)}`}>
              {currentResult!.overall_similarity.toFixed(1)}%
            </div>
            <div className="text-lg text-muted-foreground mt-2">
              {getSimilarityLevel(currentResult!.overall_similarity)}
            </div>
          </div>
          
          <Progress value={currentResult!.overall_similarity} className="h-3" />
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <h4 className="font-medium mb-2">Image 1</h4>
              {formatFileInfo(currentResult!.file1Info)}
            </div>
            <div>
              <h4 className="font-medium mb-2">Image 2</h4>
              {formatFileInfo(currentResult!.file2Info)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
          <CardDescription>
            Breakdown of similarity metrics from each analysis method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* Perceptual Hash Metrics */}
            <AccordionItem value="perceptual-hash">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Perceptual Hash Analysis
                  <Badge variant="outline">
                    {currentResult!.details.perceptualHash.toFixed(1)}%
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Multiple hash algorithms detect structural similarities regardless of minor variations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Average Hash (aHash)</span>
                        <span className="text-sm font-medium">
                          {currentResult!.details.aHash.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={currentResult!.details.aHash} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Difference Hash (dHash)</span>
                        <span className="text-sm font-medium">
                          {currentResult!.details.dHash.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={currentResult!.details.dHash} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Perceptual Hash (pHash)</span>
                        <span className="text-sm font-medium">
                          {currentResult!.details.pHash.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={currentResult!.details.pHash} className="h-2" />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Color & Brightness Analysis */}
            <AccordionItem value="color-analysis">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-blue-500 rounded"></div>
                  Color & Brightness Analysis
                  <Badge variant="outline">
                    {((currentResult!.details.colorHistogram + currentResult!.details.brightness) / 2).toFixed(1)}%
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Comparison of color distributions and overall brightness levels.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Color Histogram</span>
                        <span className="text-sm font-medium">
                          {currentResult!.details.colorHistogram.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={currentResult!.details.colorHistogram} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Brightness Similarity</span>
                        <span className="text-sm font-medium">
                          {currentResult!.details.brightness.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={currentResult!.details.brightness} className="h-2" />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Texture & Structure Analysis */}
            <AccordionItem value="texture-analysis">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-gray-300 to-gray-600 rounded"></div>
                  Texture & Structure Analysis
                  <Badge variant="outline">
                    {((currentResult!.details.texture + currentResult!.details.keypoints) / 2).toFixed(1)}%
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Analysis of texture patterns and structural keypoints in both images.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Texture Similarity</span>
                        <span className="text-sm font-medium">
                          {currentResult!.details.texture.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={currentResult!.details.texture} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Keypoint Matching</span>
                        <span className="text-sm font-medium">
                          {currentResult!.details.keypoints.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={currentResult!.details.keypoints} className="h-2" />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* AI-Based Analysis */}
            <AccordionItem value="ai-analysis">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  AI-Based Embedding Analysis
                  <Badge variant="outline">
                    {currentResult!.details.embedding.toFixed(1)}%
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Deep feature extraction and semantic similarity using AI-based embeddings.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Embedding Similarity</span>
                      <span className="text-sm font-medium">
                        {currentResult!.details.embedding.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={currentResult!.details.embedding} className="h-2" />
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                    This method extracts high-level features and compares semantic content, 
                    providing robust similarity detection even with significant transformations.
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Technical Details */}
            <AccordionItem value="technical">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Technical Details
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Processing Time:</span>
                    <span className="ml-2 font-medium">{currentResult!.processingTime}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Analysis Type:</span>
                    <span className="ml-2 font-medium">Multi-layered</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span className="ml-2 font-medium">
                      {currentResult!.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Methods Used:</span>
                    <span className="ml-2 font-medium">6 Algorithms</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                  <h4 className="font-medium mb-2">Processing Notes:</h4>
                  <ul className="space-y-1">
                    <li>• Perceptual hashing detects structural similarities</li>
                    <li>• Color histogram analysis compares color distributions</li>
                    <li>• Texture analysis examines local patterns and edge density</li>
                    <li>• Keypoint detection identifies structural features</li>
                    <li>• Embedding similarity provides semantic comparison</li>
                    <li>• Final score is a weighted average of all methods</li>
                  </ul>
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