import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Video, Download, Settings } from "lucide-react";

const VideoSpoofer = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Video Spoofer</h1>
          <p className="text-muted-foreground mt-1">
            Transform your videos with subtle modifications to bypass plagiarism detection
          </p>
        </div>
        <Button variant="hero">
          <Settings className="mr-2 h-4 w-4" />
          Advanced Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Video
            </CardTitle>
            <CardDescription>
              Upload your video file to start creating variations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your video file here, or click to browse
              </p>
              <Button variant="outline">
                Choose Video File
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Supports: MP4, AVI, MOV, WMV (Max 500MB)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-secondary" />
              Generated Variations
            </CardTitle>
            <CardDescription>
              Download your processed video variations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center text-muted-foreground py-8">
                <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No videos uploaded yet</p>
                <p className="text-xs">Upload a video to see variations here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spoofing Options</CardTitle>
          <CardDescription>
            Configure how your video will be modified to create unique variations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Metadata Modification</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Title modification</span>
                  <span className="text-primary">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Creation date</span>
                  <span className="text-primary">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Author info</span>
                  <span className="text-primary">Enabled</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Visual Adjustments</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Color grading</span>
                  <span className="text-secondary">Subtle</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Frame rate</span>
                  <span className="text-secondary">Preserve</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Compression</span>
                  <span className="text-secondary">Optimized</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Audio Processing</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Pitch adjustment</span>
                  <span className="text-accent">Minimal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Noise injection</span>
                  <span className="text-accent">Disabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Format conversion</span>
                  <span className="text-accent">Auto</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoSpoofer;