import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ProcessVideoRequest {
  settings: any;
  numCopies: number;
}

interface ProcessVideoResponse {
  success: boolean;
  results?: Array<{
    name: string;
    url: string;
    processingDetails: any;
  }>;
  error?: string;
}

serve(async (req) => {
  const requestId = crypto.randomUUID();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log(`[${requestId}] Processing video request started`);
    
    // Parse multipart form data
    const formData = await req.formData();
    const videoFile = formData.get('video') as File;
    const settingsStr = formData.get('settings') as string;
    const numCopiesStr = formData.get('numCopies') as string;
    
    if (!videoFile || !settingsStr || !numCopiesStr) {
      throw new Error('Missing required fields: video, settings, or numCopies');
    }
    
    // Validate file type
    if (!videoFile.type.startsWith('video/')) {
      throw new Error('Invalid file type. Only video files are allowed.');
    }
    
    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (videoFile.size > maxSize) {
      throw new Error('File size exceeds 100MB limit');
    }
    
    const settings = JSON.parse(settingsStr);
    const numCopies = parseInt(numCopiesStr);
    
    console.log(`[${requestId}] Processing ${numCopies} variations of video: ${videoFile.name}`);
    
    // For now, simulate processing and return mock results
    // In production, this would call your FFmpeg processing service
    const results = await simulateVideoProcessing(videoFile, settings, numCopies, requestId);
    
    const response: ProcessVideoResponse = {
      success: true,
      results: results
    };
    
    console.log(`[${requestId}] Processing completed successfully`);
    
    return new Response(
      JSON.stringify(response),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
        },
      },
    )
    
  } catch (error) {
    console.error(`[${requestId}] Processing failed:`, error);
    
    const response: ProcessVideoResponse = {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
    
    return new Response(
      JSON.stringify(response),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
        },
      },
    )
  }
})

async function simulateVideoProcessing(
  videoFile: File, 
  settings: any, 
  numCopies: number,
  requestId: string
): Promise<Array<{name: string, url: string, processingDetails: any}>> {
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log(`[${requestId}] Starting processing of ${numCopies} variations`);
  
  const results = [];
  const videoBuffer = await videoFile.arrayBuffer();
  
  for (let i = 0; i < numCopies; i++) {
    try {
      // Generate mock processing details
      const processingDetails = generateMockProcessingDetails(settings, i);
      
      // Create a filename for the processed video
      const originalName = videoFile.name.split('.')[0];
      const extension = videoFile.name.split('.').pop() || 'mp4';
      const processedFileName = `${originalName}_variation_${i + 1}_${requestId}.${extension}`;
      const filePath = `videos/${processedFileName}`;
      
      console.log(`[${requestId}] Processing variation ${i + 1}/${numCopies}: ${processedFileName}`);
      
      // For now, we'll save the original video as the "processed" version
      // In production, this is where you'd apply FFmpeg transformations
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('processed-videos')
        .upload(filePath, videoBuffer, {
          contentType: videoFile.type,
          upsert: true
        });
      
      if (uploadError) {
        console.error(`[${requestId}] Upload error for variation ${i + 1}:`, uploadError);
        throw new Error(`Failed to upload variation ${i + 1}: ${uploadError.message}`);
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('processed-videos')
        .getPublicUrl(filePath);
      
      results.push({
        name: processedFileName,
        url: urlData.publicUrl,
        processingDetails: processingDetails,
        filePath: filePath
      });
      
      console.log(`[${requestId}] Successfully processed variation ${i + 1}/${numCopies}`);
      
    } catch (error) {
      console.error(`[${requestId}] Error processing variation ${i + 1}:`, error);
      // Continue with other variations even if one fails
    }
  }
  
  return results;
}

function generateMockProcessingDetails(settings: any, variationIndex: number): any {
  const details: any = {};
  
  // Apply only enabled and functional settings
  if (settings.videoBitrate?.enabled) {
    details.videoBitrate = Math.floor(
      settings.videoBitrate.min + 
      (settings.videoBitrate.max - settings.videoBitrate.min) * 
      Math.random()
    );
  }
  
  if (settings.frameRate?.enabled) {
    details.frameRate = Math.floor(
      settings.frameRate.min + 
      (settings.frameRate.max - settings.frameRate.min) * 
      Math.random()
    );
  }
  
  if (settings.saturation?.enabled) {
    details.saturation = Number((
      settings.saturation.min + 
      (settings.saturation.max - settings.saturation.min) * 
      Math.random()
    ).toFixed(2));
  }
  
  if (settings.contrast?.enabled) {
    details.contrast = Number((
      settings.contrast.min + 
      (settings.contrast.max - settings.contrast.min) * 
      Math.random()
    ).toFixed(2));
  }
  
  if (settings.brightness?.enabled) {
    details.brightness = Number((
      settings.brightness.min + 
      (settings.brightness.max - settings.brightness.min) * 
      Math.random()
    ).toFixed(2));
  }
  
  if (settings.speed?.enabled) {
    details.speed = Number((
      settings.speed.min + 
      (settings.speed.max - settings.speed.min) * 
      Math.random()
    ).toFixed(2));
  }
  
  if (settings.flipHorizontal?.enabled) {
    details.flipHorizontal = Math.random() > 0.5;
  }
  
  if (settings.pixelSize && settings.pixelSize !== "original") {
    details.pixelSize = settings.pixelSize;
  }
  
  if (settings.volume?.enabled) {
    details.volume = Number((
      settings.volume.min + 
      (settings.volume.max - settings.volume.min) * 
      Math.random()
    ).toFixed(2));
  }
  
  // Add timestamp for tracking
  details.processedAt = new Date().toISOString();
  details.variationIndex = variationIndex;
  
  return details;
}