import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SimilarityMetrics {
  perceptualHash: number;
  dHash: number;
  aHash: number;
  pHash: number;
  colorHistogram: number;
  brightness: number;
  texture: number;
  keypoints: number;
  embedding: number;
}

interface SimilarityResult {
  overall_similarity: number;
  details: SimilarityMetrics;
  processingTime: number;
  timestamp: Date;
  file1Info: { name: string; size: number; type: string };
  file2Info: { name: string; size: number; type: string };
}

interface ImageSimilarityContextType {
  file1: File | null;
  file2: File | null;
  setFile1: (file: File | null) => void;
  setFile2: (file: File | null) => void;
  isAnalyzing: boolean;
  progress: number;
  currentResult: SimilarityResult | null;
  analyzeImages: () => Promise<void>;
  clearResults: () => void;
  results: SimilarityResult[];
}

const ImageSimilarityContext = createContext<ImageSimilarityContextType | undefined>(undefined);

export const ImageSimilarityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentResult, setCurrentResult] = useState<SimilarityResult | null>(null);
  const [results, setResults] = useState<SimilarityResult[]>([]);

  // Helper function to load image
  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Helper function to get image data
  const getImageData = (img: HTMLImageElement): ImageData => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  // 1. Perceptual Hashing (aHash, dHash, pHash)
  const calculatePerceptualHashes = (imageData: ImageData) => {
    const { data, width, height } = imageData;
    
    // Convert to grayscale and resize to 8x8 for simplicity
    const size = 8;
    const resized = new Array(size * size);
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const srcX = Math.floor(x * width / size);
        const srcY = Math.floor(y * height / size);
        const srcIndex = (srcY * width + srcX) * 4;
        
        // Convert to grayscale
        const gray = Math.round(
          0.299 * data[srcIndex] + 
          0.587 * data[srcIndex + 1] + 
          0.114 * data[srcIndex + 2]
        );
        resized[y * size + x] = gray;
      }
    }

    // aHash (Average Hash)
    const avg = resized.reduce((sum, val) => sum + val, 0) / resized.length;
    let aHash = '';
    for (let i = 0; i < resized.length; i++) {
      aHash += resized[i] > avg ? '1' : '0';
    }

    // dHash (Difference Hash)
    let dHash = '';
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size - 1; x++) {
        const left = resized[y * size + x];
        const right = resized[y * size + x + 1];
        dHash += left > right ? '1' : '0';
      }
    }

    // Simplified pHash (DCT-based would be more complex)
    let pHash = aHash; // Using aHash as simplified pHash for now

    return { aHash, dHash, pHash };
  };

  // Calculate Hamming distance between two binary strings
  const hammingDistance = (str1: string, str2: string): number => {
    if (str1.length !== str2.length) return 100;
    let distance = 0;
    for (let i = 0; i < str1.length; i++) {
      if (str1[i] !== str2[i]) distance++;
    }
    return Math.max(0, 100 - (distance / str1.length) * 100);
  };

  // 2. Color Histogram Analysis
  const calculateColorHistogram = (imageData: ImageData): number[] => {
    const { data } = imageData;
    const histogram = new Array(256).fill(0);
    
    for (let i = 0; i < data.length; i += 4) {
      // Convert RGB to luminance
      const luminance = Math.round(
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      );
      histogram[luminance]++;
    }
    
    return histogram;
  };

  const compareHistograms = (hist1: number[], hist2: number[]): number => {
    // Normalize histograms
    const sum1 = hist1.reduce((a, b) => a + b, 0);
    const sum2 = hist2.reduce((a, b) => a + b, 0);
    
    const norm1 = hist1.map(v => v / sum1);
    const norm2 = hist2.map(v => v / sum2);
    
    // Calculate correlation
    let correlation = 0;
    for (let i = 0; i < norm1.length; i++) {
      correlation += Math.min(norm1[i], norm2[i]);
    }
    
    return correlation * 100;
  };

  // 3. Brightness Analysis
  const calculateBrightness = (imageData: ImageData): number => {
    const { data } = imageData;
    let totalBrightness = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      totalBrightness += brightness;
    }
    
    return totalBrightness / (data.length / 4);
  };

  // 4. Texture Analysis (simplified LBP)
  const calculateTexture = (imageData: ImageData): number => {
    const { data, width, height } = imageData;
    let textureValue = 0;
    let count = 0;
    
    // Simplified texture analysis using local variance
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const centerIndex = (y * width + x) * 4;
        const center = (data[centerIndex] + data[centerIndex + 1] + data[centerIndex + 2]) / 3;
        
        let variance = 0;
        // Check 8 neighbors
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const neighborIndex = ((y + dy) * width + (x + dx)) * 4;
            const neighbor = (data[neighborIndex] + data[neighborIndex + 1] + data[neighborIndex + 2]) / 3;
            variance += Math.abs(center - neighbor);
          }
        }
        textureValue += variance;
        count++;
      }
    }
    
    return count > 0 ? textureValue / count : 0;
  };

  // 5. Keypoint Detection (simplified corner detection)
  const calculateKeypoints = (imageData: ImageData): number => {
    const { data, width, height } = imageData;
    let corners = 0;
    
    // Simplified Harris corner detection
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        const centerIndex = (y * width + x) * 4;
        const center = (data[centerIndex] + data[centerIndex + 1] + data[centerIndex + 2]) / 3;
        
        let gradientX = 0, gradientY = 0;
        
        // Calculate gradients
        const leftIndex = (y * width + (x - 1)) * 4;
        const rightIndex = (y * width + (x + 1)) * 4;
        const topIndex = ((y - 1) * width + x) * 4;
        const bottomIndex = ((y + 1) * width + x) * 4;
        
        const left = (data[leftIndex] + data[leftIndex + 1] + data[leftIndex + 2]) / 3;
        const right = (data[rightIndex] + data[rightIndex + 1] + data[rightIndex + 2]) / 3;
        const top = (data[topIndex] + data[topIndex + 1] + data[topIndex + 2]) / 3;
        const bottom = (data[bottomIndex] + data[bottomIndex + 1] + data[bottomIndex + 2]) / 3;
        
        gradientX = right - left;
        gradientY = bottom - top;
        
        const magnitude = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
        if (magnitude > 50) { // Threshold for corner detection
          corners++;
        }
      }
    }
    
    return corners;
  };

  // 6. Embedding-based similarity (simplified feature extraction)
  const calculateEmbedding = (imageData: ImageData): number[] => {
    const { data, width, height } = imageData;
    const features = [];
    
    // Extract simple features: color moments, edge density, etc.
    let rSum = 0, gSum = 0, bSum = 0;
    let rVariance = 0, gVariance = 0, bVariance = 0;
    let edgeCount = 0;
    
    const pixelCount = data.length / 4;
    
    // First pass: calculate means
    for (let i = 0; i < data.length; i += 4) {
      rSum += data[i];
      gSum += data[i + 1];
      bSum += data[i + 2];
    }
    
    const rMean = rSum / pixelCount;
    const gMean = gSum / pixelCount;
    const bMean = bSum / pixelCount;
    
    // Second pass: calculate variance and edge detection
    for (let i = 0; i < data.length; i += 4) {
      rVariance += Math.pow(data[i] - rMean, 2);
      gVariance += Math.pow(data[i + 1] - gMean, 2);
      bVariance += Math.pow(data[i + 2] - bMean, 2);
      
      // Simple edge detection
      const x = (i / 4) % width;
      const y = Math.floor((i / 4) / width);
      
      if (x > 0 && y > 0) {
        const currentGray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const leftIndex = (y * width + (x - 1)) * 4;
        const topIndex = ((y - 1) * width + x) * 4;
        
        const leftGray = (data[leftIndex] + data[leftIndex + 1] + data[leftIndex + 2]) / 3;
        const topGray = (data[topIndex] + data[topIndex + 1] + data[topIndex + 2]) / 3;
        
        if (Math.abs(currentGray - leftGray) > 30 || Math.abs(currentGray - topGray) > 30) {
          edgeCount++;
        }
      }
    }
    
    features.push(rMean, gMean, bMean);
    features.push(rVariance / pixelCount, gVariance / pixelCount, bVariance / pixelCount);
    features.push(edgeCount / pixelCount * 1000); // Normalize edge density
    
    return features;
  };

  // Calculate cosine similarity between two feature vectors
  const cosineSimilarity = (vec1: number[], vec2: number[]): number => {
    if (vec1.length !== vec2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator === 0 ? 0 : (dotProduct / denominator) * 100;
  };

  const analyzeImages = async () => {
    if (!file1 || !file2) return;

    setIsAnalyzing(true);
    setProgress(0);
    
    try {
      const startTime = Date.now();
      
      // Load images
      setProgress(10);
      const img1 = await loadImage(file1);
      const img2 = await loadImage(file2);
      
      setProgress(20);
      const imageData1 = getImageData(img1);
      const imageData2 = getImageData(img2);
      
      // 1. Perceptual Hashing
      setProgress(30);
      const hashes1 = calculatePerceptualHashes(imageData1);
      const hashes2 = calculatePerceptualHashes(imageData2);
      
      const aHashSimilarity = hammingDistance(hashes1.aHash, hashes2.aHash);
      const dHashSimilarity = hammingDistance(hashes1.dHash, hashes2.dHash);
      const pHashSimilarity = hammingDistance(hashes1.pHash, hashes2.pHash);
      const perceptualHash = (aHashSimilarity + dHashSimilarity + pHashSimilarity) / 3;
      
      // 2. Color Histogram
      setProgress(50);
      const hist1 = calculateColorHistogram(imageData1);
      const hist2 = calculateColorHistogram(imageData2);
      const colorHistogram = compareHistograms(hist1, hist2);
      
      // 3. Brightness
      setProgress(60);
      const brightness1 = calculateBrightness(imageData1);
      const brightness2 = calculateBrightness(imageData2);
      const brightnessDiff = Math.abs(brightness1 - brightness2);
      const brightness = Math.max(0, 100 - (brightnessDiff / 255) * 100);
      
      // 4. Texture
      setProgress(70);
      const texture1 = calculateTexture(imageData1);
      const texture2 = calculateTexture(imageData2);
      const textureDiff = Math.abs(texture1 - texture2);
      const texture = Math.max(0, 100 - (textureDiff / 100));
      
      // 5. Keypoints
      setProgress(80);
      const keypoints1 = calculateKeypoints(imageData1);
      const keypoints2 = calculateKeypoints(imageData2);
      const keypointsDiff = Math.abs(keypoints1 - keypoints2);
      const maxKeypoints = Math.max(keypoints1, keypoints2, 1);
      const keypoints = Math.max(0, 100 - (keypointsDiff / maxKeypoints) * 100);
      
      // 6. Embedding
      setProgress(90);
      const embedding1 = calculateEmbedding(imageData1);
      const embedding2 = calculateEmbedding(imageData2);
      const embedding = cosineSimilarity(embedding1, embedding2);
      
      setProgress(95);
      
      const metrics: SimilarityMetrics = {
        perceptualHash,
        dHash: dHashSimilarity,
        aHash: aHashSimilarity,
        pHash: pHashSimilarity,
        colorHistogram,
        brightness,
        texture,
        keypoints,
        embedding
      };
      
      // Calculate weighted overall similarity
      const weights = {
        perceptualHash: 0.25,
        colorHistogram: 0.20,
        brightness: 0.15,
        texture: 0.15,
        keypoints: 0.10,
        embedding: 0.15
      };
      
      const overall_similarity = 
        metrics.perceptualHash * weights.perceptualHash +
        metrics.colorHistogram * weights.colorHistogram +
        metrics.brightness * weights.brightness +
        metrics.texture * weights.texture +
        metrics.keypoints * weights.keypoints +
        metrics.embedding * weights.embedding;
      
      const processingTime = Date.now() - startTime;
      
      const result: SimilarityResult = {
        overall_similarity: Math.round(overall_similarity * 100) / 100,
        details: metrics,
        processingTime,
        timestamp: new Date(),
        file1Info: { name: file1.name, size: file1.size, type: file1.type },
        file2Info: { name: file2.name, size: file2.size, type: file2.type }
      };
      
      setCurrentResult(result);
      setResults(prev => [...prev, result]);
      setProgress(100);
      
      // Clean up object URLs
      URL.revokeObjectURL(img1.src);
      URL.revokeObjectURL(img2.src);
      
    } catch (error) {
      console.error('Error analyzing images:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearResults = () => {
    setCurrentResult(null);
    setProgress(0);
  };

  return (
    <ImageSimilarityContext.Provider value={{
      file1,
      file2,
      setFile1,
      setFile2,
      isAnalyzing,
      progress,
      currentResult,
      analyzeImages,
      clearResults,
      results
    }}>
      {children}
    </ImageSimilarityContext.Provider>
  );
};

export const useImageSimilarity = () => {
  const context = useContext(ImageSimilarityContext);
  if (context === undefined) {
    throw new Error('useImageSimilarity must be used within an ImageSimilarityProvider');
  }
  return context;
};