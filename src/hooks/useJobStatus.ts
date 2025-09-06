import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface JobStatus {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  originalFilename: string;
  fileSizeMB: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  results: Array<{
    name: string;
    url: string;
    processingDetails: any;
  }>;
  errorMessage?: string;
  message: string;
}

export function useJobStatus(jobId: string | null) {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkJobStatus = useCallback(async () => {
    if (!jobId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('check-job-status', {
        body: { jobId }
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if ((data as any)?.error) {
        throw new Error((data as any).error);
      }

      setJobStatus(data as unknown as JobStatus);
    } catch (err) {
      console.error('Error checking job status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check job status');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  // Poll for updates when job is processing
  useEffect(() => {
    if (!jobId) return;

    // Initial check
    checkJobStatus();

    // Set up polling only if job is processing
    const interval = setInterval(() => {
      if (jobStatus?.status === 'processing') {
        checkJobStatus();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [jobId, jobStatus?.status, checkJobStatus]);

  return {
    jobStatus,
    loading,
    error,
    refetch: checkJobStatus
  };
}