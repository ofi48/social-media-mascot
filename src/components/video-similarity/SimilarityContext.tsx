import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SimilarityMetrics {
  perceptualHash: number;
  ssim: number;
  brightnesseDifference: number;
  colorHistogram: number;
  repeatedFrames?: number;
  temporalSimilarity?: number;
}

export interface SimilarityResult {
  id: string;
  file1: File;
  file2: File;
  overallSimilarity: number;
  metrics: SimilarityMetrics;
  isIdentical: boolean;
  processingTime: number;
  timestamp: Date;
}

interface SimilarityContextType {
  // File management
  file1: File | null;
  file2: File | null;
  setFile1: (file: File | null) => void;
  setFile2: (file: File | null) => void;
  
  // Analysis state
  isAnalyzing: boolean;
  progress: number;
  currentResult: SimilarityResult | null;
  
  // Analysis functions
  analyzeFiles: () => Promise<void>;
  clearResults: () => void;
  
  // Results history
  results: SimilarityResult[];
}

const SimilarityContext = createContext<SimilarityContextType | undefined>(undefined);

export const SimilarityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentResult, setCurrentResult] = useState<SimilarityResult | null>(null);
  const [results, setResults] = useState<SimilarityResult[]>([]);

  const binaryIdentityCheck = async (file1: File, file2: File): Promise<boolean> => {
    if (file1.size !== file2.size) return false;
    
    const buffer1 = await file1.arrayBuffer();
    const buffer2 = await file2.arrayBuffer();
    
    const view1 = new Uint8Array(buffer1);
    const view2 = new Uint8Array(buffer2);
    
    return view1.every((byte, index) => byte === view2[index]);
  };

  const calculatePerceptualHash = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 8;
      canvas.height = 8;
      
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 8, 8);
          const imageData = ctx.getImageData(0, 0, 8, 8);
          const grayscale = [];
          
          for (let i = 0; i < imageData.data.length; i += 4) {
            const gray = Math.round(0.299 * imageData.data[i] + 0.587 * imageData.data[i + 1] + 0.114 * imageData.data[i + 2]);
            grayscale.push(gray);
          }
          
          const average = grayscale.reduce((a, b) => a + b) / grayscale.length;
          const hash = grayscale.map(pixel => pixel > average ? '1' : '0').join('');
          resolve(hash);
        };
        img.src = URL.createObjectURL(file);
      } else {
        // For videos, create hash from first frame
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        
        video.onloadeddata = () => {
          video.currentTime = 1; // Get frame at 1 second
        };
        
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, 8, 8);
          const imageData = ctx.getImageData(0, 0, 8, 8);
          const grayscale = [];
          
          for (let i = 0; i < imageData.data.length; i += 4) {
            const gray = Math.round(0.299 * imageData.data[i] + 0.587 * imageData.data[i + 1] + 0.114 * imageData.data[i + 2]);
            grayscale.push(gray);
          }
          
          const average = grayscale.reduce((a, b) => a + b) / grayscale.length;
          const hash = grayscale.map(pixel => pixel > average ? '1' : '0').join('');
          resolve(hash);
        };
        
        video.src = URL.createObjectURL(file);
      }
    });
  };

  const hammingDistance = (hash1: string, hash2: string): number => {
    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) distance++;
    }
    return 1 - (distance / hash1.length);
  };

  const calculateSSIM = async (file1: File, file2: File): Promise<number> => {
    return new Promise((resolve) => {
      const canvas1 = document.createElement('canvas');
      const canvas2 = document.createElement('canvas');
      const ctx1 = canvas1.getContext('2d')!;
      const ctx2 = canvas2.getContext('2d')!;
      
      canvas1.width = canvas2.width = 256;
      canvas1.height = canvas2.height = 256;
      
      let loaded = 0;
      const checkComplete = () => {
        loaded++;
        if (loaded === 2) {
          const imageData1 = ctx1.getImageData(0, 0, 256, 256);
          const imageData2 = ctx2.getImageData(0, 0, 256, 256);
          
          // Simplified SSIM calculation
          let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
          const N = imageData1.data.length / 4;
          
          for (let i = 0; i < imageData1.data.length; i += 4) {
            const x = (imageData1.data[i] + imageData1.data[i + 1] + imageData1.data[i + 2]) / 3;
            const y = (imageData2.data[i] + imageData2.data[i + 1] + imageData2.data[i + 2]) / 3;
            
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
            sumY2 += y * y;
          }
          
          const meanX = sumX / N;
          const meanY = sumY / N;
          const varX = (sumX2 / N) - (meanX * meanX);
          const varY = (sumY2 / N) - (meanY * meanY);
          const covarXY = (sumXY / N) - (meanX * meanY);
          
          const c1 = 0.01 * 255 * 0.01 * 255;
          const c2 = 0.03 * 255 * 0.03 * 255;
          
          const ssim = ((2 * meanX * meanY + c1) * (2 * covarXY + c2)) /
                      ((meanX * meanX + meanY * meanY + c1) * (varX + varY + c2));
          
          resolve(Math.max(0, Math.min(1, ssim)));
        }
      };
      
      if (file1.type.startsWith('image/')) {
        const img1 = new Image();
        img1.onload = () => {
          ctx1.drawImage(img1, 0, 0, 256, 256);
          checkComplete();
        };
        img1.src = URL.createObjectURL(file1);
      } else {
        const video1 = document.createElement('video');
        video1.crossOrigin = 'anonymous';
        video1.muted = true;
        video1.onloadeddata = () => video1.currentTime = 1;
        video1.onseeked = () => {
          ctx1.drawImage(video1, 0, 0, 256, 256);
          checkComplete();
        };
        video1.src = URL.createObjectURL(file1);
      }
      
      if (file2.type.startsWith('image/')) {
        const img2 = new Image();
        img2.onload = () => {
          ctx2.drawImage(img2, 0, 0, 256, 256);
          checkComplete();
        };
        img2.src = URL.createObjectURL(file2);
      } else {
        const video2 = document.createElement('video');
        video2.crossOrigin = 'anonymous';
        video2.muted = true;
        video2.onloadeddata = () => video2.currentTime = 1;
        video2.onseeked = () => {
          ctx2.drawImage(video2, 0, 0, 256, 256);
          checkComplete();
        };
        video2.src = URL.createObjectURL(file2);
      }
    });
  };

  const calculateBrightnessDifference = async (file1: File, file2: File): Promise<number> => {
    const getBrightness = (file: File): Promise<number> => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = canvas.height = 100;
        
        if (file.type.startsWith('image/')) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, 100, 100);
            const imageData = ctx.getImageData(0, 0, 100, 100);
            let totalBrightness = 0;
            
            for (let i = 0; i < imageData.data.length; i += 4) {
              totalBrightness += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
            }
            
            resolve(totalBrightness / (imageData.data.length / 4));
          };
          img.src = URL.createObjectURL(file);
        } else {
          const video = document.createElement('video');
          video.crossOrigin = 'anonymous';
          video.muted = true;
          video.onloadeddata = () => video.currentTime = 1;
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, 100, 100);
            const imageData = ctx.getImageData(0, 0, 100, 100);
            let totalBrightness = 0;
            
            for (let i = 0; i < imageData.data.length; i += 4) {
              totalBrightness += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
            }
            
            resolve(totalBrightness / (imageData.data.length / 4));
          };
          video.src = URL.createObjectURL(file);
        }
      });
    };
    
    const [brightness1, brightness2] = await Promise.all([
      getBrightness(file1),
      getBrightness(file2)
    ]);
    
    const difference = Math.abs(brightness1 - brightness2);
    return 1 - (difference / 255); // Normalize to 0-1 range
  };

  const calculateColorHistogram = async (file1: File, file2: File): Promise<number> => {
    const getHistogram = (file: File): Promise<number[]> => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = canvas.height = 100;
        
        const processImage = () => {
          const imageData = ctx.getImageData(0, 0, 100, 100);
          const histogram = new Array(256).fill(0);
          
          for (let i = 0; i < imageData.data.length; i += 4) {
            const gray = Math.round(0.299 * imageData.data[i] + 0.587 * imageData.data[i + 1] + 0.114 * imageData.data[i + 2]);
            histogram[gray]++;
          }
          
          // Normalize histogram
          const total = histogram.reduce((a, b) => a + b);
          resolve(histogram.map(count => count / total));
        };
        
        if (file.type.startsWith('image/')) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, 100, 100);
            processImage();
          };
          img.src = URL.createObjectURL(file);
        } else {
          const video = document.createElement('video');
          video.crossOrigin = 'anonymous';
          video.muted = true;
          video.onloadeddata = () => video.currentTime = 1;
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, 100, 100);
            processImage();
          };
          video.src = URL.createObjectURL(file);
        }
      });
    };
    
    const [hist1, hist2] = await Promise.all([
      getHistogram(file1),
      getHistogram(file2)
    ]);
    
    // Calculate correlation coefficient
    let correlation = 0;
    for (let i = 0; i < 256; i++) {
      correlation += Math.sqrt(hist1[i] * hist2[i]);
    }
    
    return correlation;
  };

  const analyzeFiles = async () => {
    if (!file1 || !file2) return;
    
    setIsAnalyzing(true);
    setProgress(0);
    const startTime = Date.now();
    
    try {
      // Step 1: Binary identity check
      setProgress(10);
      const isIdentical = await binaryIdentityCheck(file1, file2);
      
      if (isIdentical) {
        const result: SimilarityResult = {
          id: Math.random().toString(36).substr(2, 9),
          file1,
          file2,
          overallSimilarity: 100,
          metrics: {
            perceptualHash: 100,
            ssim: 100,
            brightnesseDifference: 100,
            colorHistogram: 100,
          },
          isIdentical: true,
          processingTime: Date.now() - startTime,
          timestamp: new Date()
        };
        
        setCurrentResult(result);
        setResults(prev => [result, ...prev]);
        setProgress(100);
        return;
      }
      
      // Step 2: Type validation
      const isImage1 = file1.type.startsWith('image/');
      const isImage2 = file2.type.startsWith('image/');
      const isVideo1 = file1.type.startsWith('video/');
      const isVideo2 = file2.type.startsWith('video/');
      
      if ((isImage1 && !isImage2) || (isVideo1 && !isVideo2)) {
        throw new Error('Files must be of the same media type (both images or both videos)');
      }
      
      // Step 3: Calculate similarity metrics
      setProgress(30);
      const [hash1, hash2] = await Promise.all([
        calculatePerceptualHash(file1),
        calculatePerceptualHash(file2)
      ]);
      const perceptualHash = hammingDistance(hash1, hash2) * 100;
      
      setProgress(50);
      const ssim = (await calculateSSIM(file1, file2)) * 100;
      
      setProgress(70);
      const brightnesseDifference = (await calculateBrightnessDifference(file1, file2)) * 100;
      
      setProgress(90);
      const colorHistogram = (await calculateColorHistogram(file1, file2)) * 100;
      
      // Calculate weighted overall similarity
      let overallSimilarity;
      if (isImage1 && isImage2) {
        overallSimilarity = (
          perceptualHash * 0.30 +
          ssim * 0.35 +
          brightnesseDifference * 0.15 +
          colorHistogram * 0.20
        );
      } else {
        // For videos, include additional metrics (simplified for demo)
        const repeatedFrames = Math.random() * 100; // Mock value
        const temporalSimilarity = Math.random() * 100; // Mock value
        
        overallSimilarity = (
          perceptualHash * 0.20 +
          ssim * 0.25 +
          brightnesseDifference * 0.10 +
          colorHistogram * 0.20 +
          repeatedFrames * 0.15 +
          temporalSimilarity * 0.10
        );
      }
      
      const result: SimilarityResult = {
        id: Math.random().toString(36).substr(2, 9),
        file1,
        file2,
        overallSimilarity: Math.round(overallSimilarity * 100) / 100,
        metrics: {
          perceptualHash: Math.round(perceptualHash * 100) / 100,
          ssim: Math.round(ssim * 100) / 100,
          brightnesseDifference: Math.round(brightnesseDifference * 100) / 100,
          colorHistogram: Math.round(colorHistogram * 100) / 100,
          ...(isVideo1 && isVideo2 && {
            repeatedFrames: Math.round(Math.random() * 100 * 100) / 100,
            temporalSimilarity: Math.round(Math.random() * 100 * 100) / 100,
          })
        },
        isIdentical: false,
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
      
      setCurrentResult(result);
      setResults(prev => [result, ...prev]);
      setProgress(100);
      
    } catch (error) {
      console.error('Analysis error:', error);
      // Handle error appropriately
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearResults = () => {
    setCurrentResult(null);
    setProgress(0);
  };

  return (
    <SimilarityContext.Provider value={{
      file1,
      file2,
      setFile1,
      setFile2,
      isAnalyzing,
      progress,
      currentResult,
      analyzeFiles,
      clearResults,
      results
    }}>
      {children}
    </SimilarityContext.Provider>
  );
};

export const useSimilarity = () => {
  const context = useContext(SimilarityContext);
  if (context === undefined) {
    throw new Error('useSimilarity must be used within a SimilarityProvider');
  }
  return context;
};