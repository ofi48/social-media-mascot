import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';

export type ProcessingStage = 
  | 'validation'
  | 'preprocessing'
  | 'uploading'
  | 'processing'
  | 'complete'
  | 'error';

interface ProcessingStageIndicatorProps {
  stage: ProcessingStage;
  progress: number;
  message: string;
  fileName?: string;
}

export function ProcessingStageIndicator({
  stage,
  progress,
  message,
  fileName
}: ProcessingStageIndicatorProps) {
  const getStageIcon = () => {
    switch (stage) {
      case 'validation':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'preprocessing':
        return <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />;
      case 'uploading':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />;
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStageColor = () => {
    switch (stage) {
      case 'validation':
        return 'text-blue-600';
      case 'preprocessing':
        return 'text-orange-600';
      case 'uploading':
        return 'text-blue-600';
      case 'processing':
        return 'text-purple-600';
      case 'complete':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressColor = () => {
    switch (stage) {
      case 'preprocessing':
        return 'bg-orange-500';
      case 'uploading':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-purple-500';
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {getStageIcon()}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium ${getStageColor()}`}>
                  {fileName && `${fileName} - `}{message}
                </h4>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>
          
          <Progress 
            value={progress} 
            className="h-2"
          />
          
          <div className="text-xs text-muted-foreground">
            {stage === 'validation' && 'Checking file size and duration...'}
            {stage === 'preprocessing' && 'Compressing video for optimal processing...'}
            {stage === 'uploading' && 'Uploading to server...'}
            {stage === 'processing' && 'Processing video on Railway server...'}
            {stage === 'complete' && 'Processing completed successfully!'}
            {stage === 'error' && 'An error occurred during processing.'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}