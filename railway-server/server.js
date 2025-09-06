const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '500mb' }));

// Configure multer for file uploads - use disk storage to save memory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // Reduced to 100MB to avoid memory issues
});

// Ensure directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Optimized video processing endpoint with better error handling
app.post('/process-video', upload.single('video'), async (req, res) => {
  const requestId = req.body.requestId || Date.now().toString();
  const startTime = Date.now();
  
  try {
    console.log(`[${requestId}] ⚡ Video processing started`);
    console.log(`[${requestId}] 📊 Initial memory:`, formatMemoryUsage(process.memoryUsage()));
    
    // Quick validation
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No video file provided' 
      });
    }
    
    const settings = JSON.parse(req.body.settings || '{}');
    const numCopies = Math.min(parseInt(req.body.numCopies || '1'), 5); // Limit to 5 variations max
    
    console.log(`[${requestId}] 🎥 File: ${req.file.originalname} (${(req.file.size / (1024 * 1024)).toFixed(2)}MB)`);
    console.log(`[${requestId}] 🔄 Generating ${numCopies} variations`);
    
    // Set response timeout to prevent hanging
    res.setTimeout(270000, () => { // 4.5 minutes
      console.error(`[${requestId}] ⏰ Response timeout reached`);
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          error: 'Video processing timeout. Try with a smaller file.'
        });
      }
    });
    
    // Send immediate acknowledgment
    res.setHeader('Content-Type', 'application/json');
    
    const inputPath = req.file.path;
    console.log(`[${requestId}] 📁 Processing file at: ${inputPath}`);
    
    // Optimized processing with memory monitoring
    const results = await processVideoWithMonitoring(inputPath, settings, numCopies, requestId);
    
    // Clean up immediately
    cleanupFile(inputPath, requestId);
    
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (!res.headersSent) {
      res.json({
        success: true,
        results: results,
        processedAt: new Date().toISOString(),
        processingTimeSeconds: processingTime,
        memoryUsage: formatMemoryUsage(process.memoryUsage())
      });
      
      console.log(`[${requestId}] ✅ Completed in ${processingTime}s with ${results.length} results`);
    }
    
  } catch (error) {
    console.error(`[${requestId}] ❌ Processing failed:`, error.message);
    console.error(`[${requestId}] 📊 Error memory:`, formatMemoryUsage(process.memoryUsage()));
    
    // Emergency cleanup
    if (req.file?.path) {
      cleanupFile(req.file.path, requestId);
    }
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message || 'Video processing failed',
        processingTimeSeconds: ((Date.now() - startTime) / 1000).toFixed(2)
      });
    }
  }
});

// Helper function for memory formatting
function formatMemoryUsage(memUsage) {
  return {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
  };
}

// Helper function for safe file cleanup
function cleanupFile(filePath, requestId) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[${requestId}] 🗑️ Cleaned up: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.warn(`[${requestId}] ⚠️ Cleanup failed: ${error.message}`);
  }
}

// Optimized video processing with memory monitoring
async function processVideoWithMonitoring(inputPath, settings, numCopies, requestId) {
  const results = [];
  const timestamp = Date.now();
  
  console.log(`[${requestId}] 🚀 Starting optimized video processing`);
  
  for (let i = 0; i < numCopies; i++) {
    const variationStart = Date.now();
    
    try {
      console.log(`[${requestId}] 🔄 Variation ${i + 1}/${numCopies} started`);
      
      // Generate optimized parameters
      const params = generateOptimizedParameters(settings, i);
      
      // Create output path with better naming
      const outputFileName = `processed_${timestamp}_v${i + 1}.mp4`;
      const outputPath = path.join(outputDir, outputFileName);
      
      // Process with improved FFmpeg settings
      await processWithOptimizedFFmpeg(inputPath, outputPath, params, requestId);
      
      // Verify output file exists and has reasonable size
      if (!fs.existsSync(outputPath)) {
        throw new Error(`Output file not created: ${outputFileName}`);
      }
      
      const outputStats = fs.statSync(outputPath);
      const outputSizeMB = (outputStats.size / (1024 * 1024)).toFixed(2);
      
      const result = {
        name: outputFileName,
        url: `/download/${outputFileName}`,
        processingDetails: {
          ...params,
          outputSizeMB: outputSizeMB,
          processingTimeMs: Date.now() - variationStart
        }
      };
      
      results.push(result);
      
      const variationTime = ((Date.now() - variationStart) / 1000).toFixed(1);
      console.log(`[${requestId}] ✅ Variation ${i + 1} completed in ${variationTime}s (${outputSizeMB}MB)`);
      
      // Force garbage collection between variations
      if (global.gc && i < numCopies - 1) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, 200)); // Brief pause
      }
      
    } catch (error) {
      console.error(`[${requestId}] ❌ Variation ${i + 1} failed:`, error.message);
      
      // Create a placeholder result for failed variations
      results.push({
        name: `failed_${timestamp}_v${i + 1}.mp4`,
        url: null,
        processingDetails: {
          error: error.message,
          variationIndex: i + 1
        }
      });
    }
  }
  
  console.log(`[${requestId}] 🏁 Processing completed: ${results.filter(r => r.url).length}/${numCopies} successful`);
  return results.filter(r => r.url); // Return only successful results
}

// Optimized FFmpeg processing with better error handling
function processWithOptimizedFFmpeg(inputPath, outputPath, params, requestId) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.error(`[${requestId}] ⏰ FFmpeg timeout for ${path.basename(outputPath)}`);
      reject(new Error('FFmpeg processing timeout'));
    }, 120000); // 2 minute timeout per variation

    console.log(`[${requestId}] 🎬 FFmpeg starting with optimized params`);
    
    let command = ffmpeg(inputPath);
    
    // Build filter chain efficiently
    const videoFilters = [];
    const audioFilters = [];
    
    // Color adjustments (combined into single eq filter)
    const colorParams = [];
    if (params.saturation !== undefined && params.saturation !== 1.0) {
      colorParams.push(`saturation=${params.saturation}`);
    }
    if (params.contrast !== undefined && params.contrast !== 1.0) {
      colorParams.push(`contrast=${params.contrast}`);
    }
    if (params.brightness !== undefined && params.brightness !== 0.0) {
      colorParams.push(`brightness=${params.brightness}`);
    }
    if (colorParams.length > 0) {
      videoFilters.push(`eq=${colorParams.join(':')}`);
    }
    
    // Speed adjustment with audio sync
    if (params.speed && params.speed !== 1.0) {
      videoFilters.push(`setpts=${(1/params.speed).toFixed(3)}*PTS`);
      audioFilters.push(`atempo=${params.speed}`);
    }
    
    // Zoom/Scale optimization
    if (params.zoom && params.zoom !== 1.0) {
      const scale = params.zoom.toFixed(3);
      videoFilters.push(`scale=iw*${scale}:ih*${scale}:flags=bilinear`);
    }
    
    // Rotation
    if (params.rotation && params.rotation !== 0) {
      const radians = (params.rotation * Math.PI / 180).toFixed(4);
      videoFilters.push(`rotate=${radians}:fillcolor=black:bilinear=0`);
    }
    
    // Horizontal flip
    if (params.flipHorizontal) {
      videoFilters.push('hflip');
    }
    
    // Apply filters efficiently
    if (videoFilters.length > 0) {
      command = command.videoFilter(videoFilters.join(','));
    }
    
    // Audio volume and filters
    if (params.volume && params.volume !== 1.0) {
      audioFilters.push(`volume=${params.volume}`);
    }
    
    if (audioFilters.length > 0) {
      command = command.audioFilter(audioFilters.join(','));
    }
    
    // Optimized output settings for Railway's environment
    command
      .output(outputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .addOption('-preset', 'veryfast') // Balanced speed vs quality
      .addOption('-crf', '24') // Slightly lower quality for speed
      .addOption('-maxrate', '1500k') // Conservative bitrate
      .addOption('-bufsize', '3000k') // Smaller buffer
      .addOption('-movflags', '+faststart') // Web optimization
      .addOption('-pix_fmt', 'yuv420p') // Compatibility
      .addOption('-threads', '2') // Limit threads for memory
      .format('mp4')
      .on('start', (commandLine) => {
        console.log(`[${requestId}] 🎬 FFmpeg: ${commandLine.substring(0, 100)}...`);
      })
      .on('progress', (progress) => {
        if (progress.percent && progress.percent % 10 === 0) {
          console.log(`[${requestId}] 📈 Progress: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        clearTimeout(timeout);
        console.log(`[${requestId}] ✅ FFmpeg completed: ${path.basename(outputPath)}`);
        resolve();
      })
      .on('error', (error) => {
        clearTimeout(timeout);
        console.error(`[${requestId}] ❌ FFmpeg error: ${error.message}`);
        
        // Clean up partial file
        if (fs.existsSync(outputPath)) {
          try {
            fs.unlinkSync(outputPath);
            console.log(`[${requestId}] 🗑️ Cleaned up partial file`);
          } catch (e) {
            console.warn(`[${requestId}] ⚠️ Failed to clean partial file: ${e.message}`);
          }
        }
        
        reject(error);
      })
      .run();
  });
}

// Optimized parameter generation with validation
function generateOptimizedParameters(settings, variationIndex) {
  const params = {
    variationIndex: variationIndex + 1,
    processedAt: new Date().toISOString(),
    seed: Math.random() // For reproducible variations
  };
  
  // Helper function for safe random generation
  const safeRandom = (setting, decimals = 2) => {
    if (!setting?.enabled || setting.min === undefined || setting.max === undefined) {
      return undefined;
    }
    const value = setting.min + (setting.max - setting.min) * Math.random();
    return Number(value.toFixed(decimals));
  };
  
  // Video quality parameters (conservative for stability)
  if (settings.videoBitrate?.enabled) {
    params.videoBitrate = Math.floor(safeRandom(settings.videoBitrate, 0));
    // Clamp to reasonable values for Railway
    params.videoBitrate = Math.max(500, Math.min(params.videoBitrate, 3000));
  }
  
  if (settings.frameRate?.enabled) {
    params.frameRate = Math.floor(safeRandom(settings.frameRate, 0));
    params.frameRate = Math.max(15, Math.min(params.frameRate, 30));
  }
  
  // Color adjustments (subtle for better results)
  params.saturation = safeRandom(settings.saturation, 3);
  if (params.saturation !== undefined) {
    params.saturation = Math.max(0.5, Math.min(params.saturation, 1.5));
  }
  
  params.contrast = safeRandom(settings.contrast, 3);
  if (params.contrast !== undefined) {
    params.contrast = Math.max(0.7, Math.min(params.contrast, 1.3));
  }
  
  params.brightness = safeRandom(settings.brightness, 3);
  if (params.brightness !== undefined) {
    params.brightness = Math.max(-0.2, Math.min(params.brightness, 0.2));
  }
  
  // Speed adjustments (small changes for stability)
  params.speed = safeRandom(settings.speed, 3);
  if (params.speed !== undefined) {
    params.speed = Math.max(0.8, Math.min(params.speed, 1.2));
  }
  
  // Zoom (minimal to avoid quality loss)
  params.zoom = safeRandom(settings.zoom, 3);
  if (params.zoom !== undefined) {
    params.zoom = Math.max(0.95, Math.min(params.zoom, 1.1));
  }
  
  // Rotation (small angles)
  params.rotation = safeRandom(settings.rotation, 2);
  if (params.rotation !== undefined) {
    params.rotation = Math.max(-5, Math.min(params.rotation, 5));
  }
  
  // Random flip (if enabled)
  if (settings.flipHorizontal === true) {
    params.flipHorizontal = Math.random() > 0.5;
  }
  
  // Volume (conservative)
  params.volume = safeRandom(settings.volume, 3);
  if (params.volume !== undefined) {
    params.volume = Math.max(0.7, Math.min(params.volume, 1.3));
  }
  
  console.log(`[Variation ${params.variationIndex}] Generated params:`, 
    Object.entries(params)
      .filter(([k, v]) => v !== undefined && k !== 'processedAt')
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ') || 'No changes');
  
  return params;
}

// Serve processed videos for download
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(outputDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Clean up old files periodically (every hour)
setInterval(() => {
  const now = Date.now();
  const maxAge = 2 * 60 * 60 * 1000; // 2 hours
  
  [uploadsDir, outputDir].forEach(dir => {
    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up old file: ${file}`);
        }
      });
    } catch (error) {
      console.warn('Error during cleanup:', error.message);
    }
  });
}, 60 * 60 * 1000); // Run every hour

app.listen(PORT, () => {
  console.log(`Video processing server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});