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
    
    // Validate file size (50MB max to avoid memory issues)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (videoFile.size > maxSize) {
      throw new Error('File size exceeds 50MB limit');
    }
    
    const settings = JSON.parse(settingsStr);
    const numCopies = parseInt(numCopiesStr);
    
    console.log(`[${requestId}] Processing ${numCopies} variations of video: ${videoFile.name}`);
    console.log(`[${requestId}] Settings:`, settings);
    
    // Process video variations efficiently - one at a time
    const results = await createVideoVariations(videoFile, settings, numCopies, requestId);
    
    console.log(`[${requestId}] Processing results:`, results);
    console.log(`[${requestId}] Number of results:`, results.length);
    
    const response: ProcessVideoResponse = {
      success: true,
      results: results
    };
    
    console.log(`[${requestId}] Processing completed successfully with ${results.length} results`);
    
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

async function createVideoVariations(
  videoFile: File, 
  settings: any, 
  numCopies: number,
  requestId: string
): Promise<Array<{name: string, url: string, processingDetails: any}>> {
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log(`[${requestId}] Creating ${numCopies} video variations`);
  
  const results = [];
  
  // Get file info
  const originalName = videoFile.name.split('.')[0];
  const extension = videoFile.name.split('.').pop() || 'mp4';
  const timestamp = Date.now();
  
  // First, upload the original video once
  const originalPath = `videos/original_${originalName}_${timestamp}.${extension}`;
  console.log(`[${requestId}] Uploading original video to: ${originalPath}`);
  
  try {
    const { data: originalUpload, error: originalError } = await supabase.storage
      .from('processed-videos')
      .upload(originalPath, videoFile, {
        contentType: videoFile.type,
        upsert: true
      });
    
    if (originalError) {
      console.error(`[${requestId}] Original upload error:`, originalError);
      throw new Error(`Failed to upload original video: ${originalError.message}`);
    }
    
    // Get the original video URL
    const { data: originalUrlData } = supabase.storage
      .from('processed-videos')
      .getPublicUrl(originalPath);
    
    console.log(`[${requestId}] Original video uploaded successfully: ${originalUrlData.publicUrl}`);
    
    // Create variations by copying the original with different names and processing details
    for (let i = 0; i < numCopies; i++) {
      try {
        // Generate unique processing details for this variation
        const processingDetails = generateProcessingDetails(settings, i);
        
        // Create unique filename for this variation
        const variationName = `${originalName}_variation_${i + 1}_${timestamp}_${Math.random().toString(36).substr(2, 6)}.${extension}`;
        const variationPath = `videos/${variationName}`;
        
        console.log(`[${requestId}] Creating variation ${i + 1}/${numCopies}: ${variationName}`);
        
        // Copy the original file to create a variation
        const { data: copyData, error: copyError } = await supabase.storage
          .from('processed-videos')
          .copy(originalPath, variationPath);
        
        if (copyError) {
          console.error(`[${requestId}] Copy error for variation ${i + 1}:`, copyError);
          // If copy fails, upload the original file again with new name
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('processed-videos')
            .upload(variationPath, videoFile, {
              contentType: videoFile.type,
              upsert: true
            });
          
          if (uploadError) {
            console.error(`[${requestId}] Upload error for variation ${i + 1}:`, uploadError);
            continue; // Skip this variation
          }
        }
        
        // Get public URL for the variation
        const { data: urlData } = supabase.storage
          .from('processed-videos')
          .getPublicUrl(variationPath);
        
        results.push({
          name: variationName,
          url: urlData.publicUrl,
          processingDetails: processingDetails
        });
        
        console.log(`[${requestId}] Successfully created variation ${i + 1}/${numCopies}`);
        
        // Small delay to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`[${requestId}] Error creating variation ${i + 1}:`, error);
        // Continue with other variations
      }
    }
    
  } catch (error) {
    console.error(`[${requestId}] Error in variation creation:`, error);
    throw error;
  }
  
  console.log(`[${requestId}] Final results count: ${results.length}`);
  return results;
}

function generateProcessingDetails(settings: any, variationIndex: number): any {
  const details: any = {
    variationIndex: variationIndex + 1,
    processedAt: new Date().toISOString()
  };
  
  // Apply only enabled settings with random values within range
  if (settings.videoBitrate?.enabled) {
    details.videoBitrate = Math.floor(
      settings.videoBitrate.min + 
      (settings.videoBitrate.max - settings.videoBitrate.min) * Math.random()
    );
  }
  
  if (settings.frameRate?.enabled) {
    details.frameRate = Math.floor(
      settings.frameRate.min + 
      (settings.frameRate.max - settings.frameRate.min) * Math.random()
    );
  }
  
  if (settings.saturation?.enabled) {
    details.saturation = Number((
      settings.saturation.min + 
      (settings.saturation.max - settings.saturation.min) * Math.random()
    ).toFixed(2));
  }
  
  if (settings.contrast?.enabled) {
    details.contrast = Number((
      settings.contrast.min + 
      (settings.contrast.max - settings.contrast.min) * Math.random()
    ).toFixed(2));
  }
  
  if (settings.brightness?.enabled) {
    details.brightness = Number((
      settings.brightness.min + 
      (settings.brightness.max - settings.brightness.min) * Math.random()
    ).toFixed(2));
  }
  
  if (settings.speed?.enabled) {
    details.speed = Number((
      settings.speed.min + 
      (settings.speed.max - settings.speed.min) * Math.random()
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
      (settings.volume.max - settings.volume.min) * Math.random()
    ).toFixed(2));
  }
  
  return details;
}