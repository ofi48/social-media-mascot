import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Search, BarChart3, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const SimilarityDetector = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Similarity Detector</h1>
          <p className="text-muted-foreground mt-1">
            Analyze content similarity before posting to avoid plagiarism detection
          </p>
        </div>
        <Button variant="premium">
          <BarChart3 className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Content for Analysis
            </CardTitle>
            <CardDescription>
              Upload videos or images to check similarity against existing content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Drop your files here to start similarity analysis
              </p>
              <Button variant="outline">
                Choose Files
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Supports: MP4, AVI, MOV, JPG, PNG, GIF (Max 500MB each)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-secondary" />
              Similarity Score
            </CardTitle>
            <CardDescription>
              Real-time similarity analysis results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-muted-foreground">--</div>
              <p className="text-sm text-muted-foreground">Upload content to see similarity score</p>
              <Progress value={0} className="w-full" />
              <p className="text-xs text-muted-foreground">0% similarity detected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Detailed breakdown of similarity findings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center text-muted-foreground py-6">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No analysis results yet</p>
                <p className="text-xs">Upload content to see detailed analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Coverage</CardTitle>
            <CardDescription>
              Platforms included in similarity check
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium">YouTube</span>
                <span className="text-primary text-sm">✓ Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium">Instagram</span>
                <span className="text-primary text-sm">✓ Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium">TikTok</span>
                <span className="text-primary text-sm">✓ Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium">Facebook</span>
                <span className="text-primary text-sm">✓ Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium">Twitter/X</span>
                <span className="text-primary text-sm">✓ Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimilarityDetector;