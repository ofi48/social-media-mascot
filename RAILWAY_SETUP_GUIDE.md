# Railway Server-Side Video Processing Setup Guide

This guide explains how to set up Railway for server-side video processing with FFmpeg.

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository with your video processing server code
- Supabase project (already configured)

## Step-by-Step Setup

### 1. Prepare Your Server Code

The `railway-server/` directory contains the Express.js server with FFmpeg processing capabilities:

```
railway-server/
├── server.js          # Main server file with FFmpeg processing
├── package.json       # Dependencies (express, multer, fluent-ffmpeg, etc.)
├── Dockerfile         # Container configuration with FFmpeg
└── README.md          # Server documentation
```

### 2. Deploy to Railway

#### Option A: GitHub Integration (Recommended)

1. **Connect Repository to Railway:**
   - Go to https://railway.app
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `railway-server` folder as the root directory

2. **Configure Environment Variables:**
   ```bash
   PORT=3000
   NODE_ENV=production
   ```

3. **Set Build Configuration:**
   - Railway will automatically detect the Dockerfile
   - Build command: `docker build .`
   - Start command: `npm start`

#### Option B: Railway CLI

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize:**
   ```bash
   railway login
   cd railway-server
   railway init
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

### 3. Configure Dockerfile

The included Dockerfile is optimized for video processing:

```dockerfile
FROM node:18-bullseye

# Install FFmpeg and dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

# Create necessary directories
RUN mkdir -p uploads output

EXPOSE 3000
CMD ["npm", "start"]
```

### 4. Server Features

The Railway server provides:

#### Video Processing Endpoint
- **URL:** `POST /process-video`
- **Max file size:** 100MB
- **Supported formats:** MP4, MOV, AVI, MKV, WebM
- **Parameters:** FFmpeg settings via JSON

#### FFmpeg Capabilities
- **Color adjustments:** Saturation, contrast, brightness, hue, gamma
- **Visual effects:** Blur, sharpness, noise, stabilization
- **Transformations:** Speed, zoom, rotation, flip
- **Audio processing:** Volume, fade, filters
- **Quality control:** Bitrate, frame rate

#### Optimizations
- Memory-efficient processing
- Automatic file cleanup
- Progress tracking
- Error handling
- Timeout protection

### 5. Connect Supabase Edge Function

Update your Supabase edge function to use Railway:

```typescript
// In supabase/functions/process-video/index.ts
const RAILWAY_URL = 'https://your-app.railway.app';

const processVideoOnRailway = async (videoData: FormData) => {
  const response = await fetch(`${RAILWAY_URL}/process-video`, {
    method: 'POST',
    body: videoData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return await response.json();
};
```

### 6. Environment Configuration

#### Railway Environment Variables
```bash
PORT=3000
NODE_ENV=production
MAX_FILE_SIZE=104857600  # 100MB in bytes
CLEANUP_INTERVAL=3600000 # 1 hour in milliseconds
```

#### Supabase Secrets (already configured)
- `RAILWAY_API_URL`: Your Railway app URL
- `SUPABASE_URL`: Your Supabase project URL  
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

### 7. Testing the Setup

#### Health Check
```bash
curl https://your-app.railway.app/health
```

#### Video Processing Test
```bash
curl -X POST \
  -F "video=@test-video.mp4" \
  -F "settings={\"saturation\":{\"min\":0.8,\"max\":1.2,\"enabled\":true}}" \
  -F "numCopies=2" \
  https://your-app.railway.app/process-video
```

### 8. Monitoring and Logs

#### Railway Dashboard
- Monitor resource usage
- View application logs
- Check deployment status
- Manage environment variables

#### Supabase Logs
- Edge function execution logs
- Database operation logs
- Error tracking

### 9. Scaling and Performance

#### Railway Scaling
- **Vertical scaling:** Increase CPU/RAM
- **Horizontal scaling:** Multiple instances
- **Auto-scaling:** Based on load

#### Optimization Tips
- Use Railway's built-in CDN
- Implement file compression
- Cache processed results
- Monitor memory usage

### 10. Cost Optimization

#### Railway Pricing
- Free tier: 512MB RAM, $5 credit
- Pro tier: Scalable resources
- Pay-per-use model

#### Optimization Strategies
- Set resource limits
- Implement file size limits
- Use efficient FFmpeg presets
- Clean up temporary files

### 11. Security Considerations

#### File Upload Security
- File type validation
- Size limits enforcement
- Virus scanning (optional)
- Rate limiting

#### API Security
- Authentication headers
- CORS configuration
- Input sanitization
- Error message filtering

### 12. Troubleshooting

#### Common Issues
1. **FFmpeg not found:** Ensure Dockerfile installs FFmpeg
2. **Memory issues:** Reduce concurrent processing
3. **Timeout errors:** Increase processing limits
4. **File upload fails:** Check size limits

#### Debug Commands
```bash
# Check FFmpeg installation
ffmpeg -version

# Monitor memory usage
top -p $(pgrep node)

# Check disk space
df -h
```

## Integration with Video Spoofer

The Video Spoofer tool automatically uses this Railway setup:

1. **File Upload:** Videos sent to Supabase edge function
2. **Processing:** Edge function forwards to Railway server
3. **FFmpeg Processing:** Railway applies your parameter settings
4. **Results:** Processed videos stored in Supabase Storage
5. **Download:** Direct download links provided

## Next Steps

1. Deploy your Railway server
2. Update Supabase edge function with Railway URL
3. Test the complete pipeline
4. Monitor performance and optimize as needed

For support, check Railway documentation: https://docs.railway.app