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
    console.log(`[${requestId}] Processing video request started - Railway optimized version`);
    
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
    
    // Validate file size (50MB max to align with Supabase Free tier)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (videoFile.size > maxSize) {
      throw new Error(`File size exceeds 50MB limit. Please compress your video first. Current size: ${(videoFile.size / (1024 * 1024)).toFixed(2)}MB`);
    }
    
    const settings = JSON.parse(settingsStr);
    const numCopies = parseInt(numCopiesStr);
    
    console.log(`[${requestId}] Sending ${numCopies} variations to Railway for processing: ${videoFile.name}`);
    console.log(`[${requestId}] File size: ${(videoFile.size / (1024 * 1024)).toFixed(2)}MB`);
    console.log(`[${requestId}] Settings:`, settings);
    
    // Send to Railway for processing
    const results = await processVideoOnRailway(videoFile, settings, numCopies, requestId);
    
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

async function processVideoOnRailway(
  videoFile: File, 
  settings: any, 
  numCopies: number,
  requestId: string
): Promise<Array<{name: string, url: string, processingDetails: any}>> {
  
  console.log(`[${requestId}] Sending video to Railway for processing`);
  
  try {
    // Create FormData for Railway request
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('settings', JSON.stringify(settings));
    formData.append('numCopies', numCopies.toString());
    formData.append('requestId', requestId);
    
    // Send to Railway processing server
    const railwayUrl = 'https://social-media-mascot-production.up.railway.app/process-video';
    
    console.log(`[${requestId}] Sending request to Railway: ${railwayUrl}`);
    
    // Enhanced timeout and retry logic for Railway request
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Railway processing timeout (3 minutes)')), 180000)
    );

    const response = await Promise.race([
      fetch(railwayUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      }),
      timeoutPromise
    ]) as Response;
    
    console.log(`[${requestId}] Railway response status: ${response.status}`);
    console.log(`[${requestId}] Railway response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] Railway error response:`, errorText);
      console.error(`[${requestId}] Response headers:`, Object.fromEntries(response.headers.entries()));
      
      // Enhanced error messages for common Railway failures
      if (response.status === 502) {
        throw new Error('Video processing server is temporarily unavailable. Please try with a smaller file.');
      } else if (response.status === 413) {
        throw new Error('Video file is too large for processing. Please compress it first.');
      } else if (response.status >= 500) {
        throw new Error('Video processing server error. Please try again with a smaller or shorter video.');
      }
      
      throw new Error(`Railway processing failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`[${requestId}] Railway processing result:`, result);
    
    if (!result.success) {
      throw new Error(result.error || 'Railway processing failed');
    }
    
    // Upload processed videos to Supabase Storage and return public URLs
    const finalResults = await uploadProcessedVideos(result.results, requestId);
    
    console.log(`[${requestId}] Final processed results count: ${finalResults.length}`);
    return finalResults;
    
  } catch (error) {
    console.error(`[${requestId}] Error in Railway processing:`, error);
    throw error;
  }
}

async function uploadProcessedVideos(
  railwayResults: any[], 
  requestId: string
): Promise<Array<{name: string, url: string, processingDetails: any}>> {
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const uploadedResults = [];
  
  for (let i = 0; i < railwayResults.length; i++) {
    const result = railwayResults[i];
    
    try {
      console.log(`[${requestId}] Uploading processed video ${i + 1}/${railwayResults.length}: ${result.name}`);
      
      // Download the processed video from Railway
      const videoUrl = result.url.startsWith('/') 
        ? `https://social-media-mascot-production.up.railway.app${result.url}`
        : result.url;
      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        console.error(`[${requestId}] Failed to download processed video ${result.name}`);
        continue;
      }
      
      const videoBlob = await videoResponse.blob();
      const timestamp = Date.now();
      const storagePath = `processed/${result.name}_${timestamp}.mp4`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('processed-videos')
        .upload(storagePath, videoBlob, {
          contentType: 'video/mp4',
          upsert: true
        });
      
      if (uploadError) {
        console.error(`[${requestId}] Failed to upload to Supabase:`, uploadError);
        continue;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('processed-videos')
        .getPublicUrl(storagePath);
      
      if (!urlData.publicUrl) {
        console.error(`[${requestId}] Failed to get public URL for ${result.name}`);
        continue;
      }
      
      uploadedResults.push({
        name: result.name,
        url: urlData.publicUrl,
        processingDetails: result.processingDetails || {}
      });
      
      console.log(`[${requestId}] Successfully uploaded ${result.name} to Supabase`);
      
    } catch (error) {
      console.error(`[${requestId}] Error uploading video ${result.name}:`, error);
    }
  }
  
  return uploadedResults;
}