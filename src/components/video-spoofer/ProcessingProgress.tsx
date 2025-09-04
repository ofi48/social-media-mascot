import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const ProcessingProgress = () => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Analyzing video...");

  useEffect(() => {
    const stages = [
      "Analyzing video...",
      "Extracting metadata...",
      "Applying color adjustments...",
      "Processing visual effects...",
      "Generating variations...",
      "Finalizing output..."
    ];

    let currentStage = 0;
    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += Math.random() * 15 + 5;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        setStage("Processing complete!");
        clearInterval(interval);
        return;
      }

      setProgress(currentProgress);
      
      const stageIndex = Math.floor((currentProgress / 100) * stages.length);
      if (stageIndex !== currentStage && stageIndex < stages.length) {
        currentStage = stageIndex;
        setStage(stages[stageIndex]);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{stage}</span>
          <Badge variant="outline">{Math.round(progress)}%</Badge>
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