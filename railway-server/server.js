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

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
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

// Main video processing endpoint
app.post('/process-video', upload.single('video'), async (req, res) => {
  const requestId = req.body.requestId || Date.now().toString();
  
  try {
    console.log(`[${requestId}] Processing video request started`);
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No video file provided' 
      });
    }
    
    const settings = JSON.parse(req.body.settings || '{}');
    const numCopies = parseInt(req.body.numCopies || '1');
    
    console.log(`[${requestId}] Processing ${numCopies} variations`);
    console.log(`[${requestId}] File size: ${(req.file.size / (1024 * 1024)).toFixed(2)}MB`);
    
    // Save uploaded file
    const timestamp = Date.now();
    const originalExt = path.extname(req.file.originalname) || '.mp4';
    const inputPath = path.join(uploadsDir, `input_${requestId}_${timestamp}${originalExt}`);
    
    fs.writeFileSync(inputPath, req.file.buffer);
    console.log(`[${requestId}] Input file saved: ${inputPath}`);
    
    // Process video variations
    const results = await processVideoVariations(inputPath, settings, numCopies, requestId);
    
    // Clean up input file
    try {
      fs.unlinkSync(inputPath);
      console.log(`[${requestId}] Cleaned up input file`);
    } catch (error) {
      console.warn(`[${requestId}] Failed to clean up input file:`, error.message);
    }
    
    res.json({
      success: true,
      results: results,
      processedAt: new Date().toISOString()
    });
    
    console.log(`[${requestId}] Processing completed successfully with ${results.length} results`);
    
  } catch (error) {
    console.error(`[${requestId}] Processing failed:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Video processing failed'
    });
  }
});

async function processVideoVariations(inputPath, settings, numCopies, requestId) {
  const results = [];
  const timestamp = Date.now();
  
  for (let i = 0; i < numCopies; i++) {
    try {
      console.log(`[${requestId}] Processing variation ${i + 1}/${numCopies}`);
      
      // Generate processing parameters for this variation
      const params = generateProcessingParameters(settings, i);
      
      // Create output path
      const outputFileName = `variation_${i + 1}_${timestamp}.mp4`;
      const outputPath = path.join(outputDir, outputFileName);
      
      // Process video with FFmpeg
      await processWithFFmpeg(inputPath, outputPath, params, requestId);
      
      // Create result object
      const result = {
        name: outputFileName,
        url: `/download/${outputFileName}`, // Will be served by this server
        processingDetails: params
      };
      
      results.push(result);
      console.log(`[${requestId}] Variation ${i + 1} completed: ${outputFileName}`);
      
    } catch (error) {
      console.error(`[${requestId}] Failed to process variation ${i + 1}:`, error);
      // Continue with other variations
    }
  }
  
  return results;
}

function processWithFFmpeg(inputPath, outputPath, params, requestId) {
  return new Promise((resolve, reject) => {
    console.log(`[${requestId}] FFmpeg processing with params:`, params);
    
    let command = ffmpeg(inputPath);
    
    // Apply video filters based on parameters
    const filters = [];
    
    // Color adjustments
    if (params.saturation !== undefined || params.contrast !== undefined || params.brightness !== undefined) {
      const saturation = params.saturation || 1.0;
      const contrast = params.contrast || 1.0;
      const brightness = params.brightness || 0.0;
      filters.push(`eq=saturation=${saturation}:contrast=${contrast}:brightness=${brightness}`);
    }
    
    // Speed adjustment
    if (params.speed && params.speed !== 1.0) {
      filters.push(`setpts=${1/params.speed}*PTS`);
    }
    
    // Zoom/Scale
    if (params.zoom && params.zoom !== 1.0) {
      filters.push(`scale=iw*${params.zoom}:ih*${params.zoom}`);
    }
    
    // Rotation
    if (params.rotation && params.rotation !== 0) {
      const radians = params.rotation * Math.PI / 180;
      filters.push(`rotate=${radians}:fillcolor=black`);
    }
    
    // Horizontal flip
    if (params.flipHorizontal) {
      filters.push('hflip');
    }
    
    // Apply filters
    if (filters.length > 0) {
      command = command.videoFilter(filters.join(','));
    }
    
    // Audio volume
    if (params.volume && params.volume !== 1.0) {
      command = command.audioFilter(`volume=${params.volume}`);
    }
    
    // Video bitrate
    if (params.videoBitrate) {
      command = command.videoBitrate(params.videoBitrate);
    }
    
    // Frame rate
    if (params.frameRate) {
      command = command.fps(params.frameRate);
    }
    
    // Output settings
    command
      .output(outputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .format('mp4')
      .on('start', (commandLine) => {
        console.log(`[${requestId}] FFmpeg command: ${commandLine}`);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`[${requestId}] Processing: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log(`[${requestId}] FFmpeg processing completed`);
        resolve();
      })
      .on('error', (error) => {
        console.error(`[${requestId}] FFmpeg error:`, error);
        reject(error);
      })
      .run();
  });
}

function generateProcessingParameters(settings, variationIndex) {
  const params = {
    variationIndex: variationIndex + 1,
    processedAt: new Date().toISOString()
  };
  
  // Generate random values within specified ranges for enabled settings
  if (settings.videoBitrate?.enabled) {
    params.videoBitrate = Math.floor(
      settings.videoBitrate.min + 
      (settings.videoBitrate.max - settings.videoBitrate.min) * Math.random()
    );
  }
  
  if (settings.frameRate?.enabled) {
    params.frameRate = Math.floor(
      settings.frameRate.min + 
      (settings.frameRate.max - settings.frameRate.min) * Math.random()
    );
  }
  
  if (settings.saturation?.enabled) {
    params.saturation = Number((
      settings.saturation.min + 
      (settings.saturation.max - settings.saturation.min) * Math.random()
    ).toFixed(2));
  }
  
  if (settings.contrast?.enabled) {
    params.contrast = Number((
      settings.contrast.min + 
      (settings.contrast.max - settings.contrast.min) * Math.random()
    ).toFixed(2));
  }
  
  if (settings.brightness?.enabled) {
    params.brightness = Number((
      settings.brightness.min + 
      (settings.brightness.max - settings.brightness.min) * Math.random()
    ).toFixed(2));
  }
  
  if (settings.speed?.enabled) {
    params.speed = Number((
      settings.speed.min + 
      (settings.speed.max - settings.speed.min) * Math.random()
    ).toFixed(2));
  }
  
  if (settings.zoom?.enabled) {
    params.zoom = Number((
      settings.zoom.min + 
      (settings.zoom.max - settings.zoom.min) * Math.random()
    ).toFixed(2));
  }
  
  if (settings.rotation?.enabled) {
    params.rotation = Number((
      settings.rotation.min + 
      (settings.rotation.max - settings.rotation.min) * Math.random()
    ).toFixed(2));
  }
  
  if (settings.flipHorizontal) {
    params.flipHorizontal = Math.random() > 0.5;
  }
  
  if (settings.volume?.enabled) {
    params.volume = Number((
      settings.volume.min + 
      (settings.volume.max - settings.volume.min) * Math.random()
    ).toFixed(2));
  }
  
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