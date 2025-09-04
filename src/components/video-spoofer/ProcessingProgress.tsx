import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useVideoProcessing } from "./VideoProcessingContext";

export const ProcessingProgress = () => {
  const { processingProgress } = useVideoProcessing();

  const stageFor = (p: number) => {
    if (p < 10) return "Analyzing video...";
    if (p < 30) return "Extracting metadata...";
    if (p < 50) return "Applying color adjustments...";
    if (p < 70) return "Processing visual effects...";
    if (p < 90) return "Generating variations...";
    if (p < 100) return "Finalizing output...";
    return "Finishing...";
  };

  const progress = Math.max(1, Math.min(99, processingProgress));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{stageFor(processingProgress)}</span>
          <Badge variant="outline">{processingProgress}%</Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <div>• Video analysis and parameter validation</div>
        <div>• Applying randomized transformations</div>
        <div>• Generating unique variations</div>
        <div>• Optimizing output quality</div>
      </div>
    </div>
  );
};