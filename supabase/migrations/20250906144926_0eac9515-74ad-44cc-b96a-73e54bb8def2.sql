-- Create storage bucket for processed videos
INSERT INTO storage.buckets (id, name, public) VALUES ('processed-videos', 'processed-videos', true);

-- Create RLS policies for processed videos bucket
CREATE POLICY "Allow public access to processed videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'processed-videos');

CREATE POLICY "Allow uploads to processed videos bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'processed-videos');

CREATE POLICY "Allow updates to processed videos bucket" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'processed-videos');

CREATE POLICY "Allow deletes from processed videos bucket" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'processed-videos');