import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');
    
    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'jobId parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get job status from database
    const { data: job, error } = await supabase
      .from('video_processing_jobs')
      .select('*')
      .eq('job_id', jobId)
      .single();

    if (error || !job) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare response based on job status
    const response = {
      jobId: job.job_id,
      status: job.status,
      originalFilename: job.original_filename,
      fileSizeMB: job.file_size_mb,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      completedAt: job.completed_at,
      results: job.results || [],
      errorMessage: job.error_message,
      message: job.status === 'processing' 
        ? 'Job is still being processed...' 
        : job.status === 'completed' 
          ? `Processing completed with ${(job.results as any[])?.length || 0} results`
          : 'Processing failed'
    };

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
    console.error('Error checking job status:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to check job status' }),
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