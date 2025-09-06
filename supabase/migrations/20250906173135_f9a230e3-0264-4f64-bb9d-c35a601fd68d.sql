-- Create table for tracking video processing jobs
CREATE TABLE public.video_processing_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  original_filename TEXT NOT NULL,
  file_size_mb DECIMAL(10,2),
  settings JSONB,
  num_copies INTEGER DEFAULT 1,
  results JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.video_processing_jobs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read and insert (since no auth is required)
CREATE POLICY "Anyone can view jobs" 
ON public.video_processing_jobs 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create jobs" 
ON public.video_processing_jobs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update jobs" 
ON public.video_processing_jobs 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_video_jobs_updated_at
BEFORE UPDATE ON public.video_processing_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_video_jobs_job_id ON public.video_processing_jobs(job_id);
CREATE INDEX idx_video_jobs_status ON public.video_processing_jobs(status);
CREATE INDEX idx_video_jobs_created_at ON public.video_processing_jobs(created_at DESC);