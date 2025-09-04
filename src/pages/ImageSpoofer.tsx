import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image, Download, Palette, Filter } from "lucide-react";

const ImageSpoofer = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Image Spoofer</h1>
          <p className="text-muted-foreground mt-1">
            Create unique variations of your images while maintaining visual appeal
          </p>
        </div>
        <Button variant="hero">
          <Filter className="mr-2 h-4 w-4" />
          Batch Process
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Images
            </CardTitle>
            <CardDescription>
              Upload your images to start creating variations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your images here, or click to browse
              </p>
              <Button variant="outline">
                Choose Images
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Supports: JPG, PNG, GIF, WebP (Max 50MB each)
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
              Download your processed image variations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center text-muted-foreground py-8">
                <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No images uploaded yet</p>
                <p className="text-xs">Upload images to see variations here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Color Adjustments
            </CardTitle>
            <CardDescription>Fine-tune colors and lighting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Brightness</label>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contrast</label>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Saturation</label>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hue Shift</label>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-1/4"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-secondary" />
              Filters & Effects
            </CardTitle>
            <CardDescription>Apply subtle modifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">Noise Injection</span>
                <span className="text-primary text-sm">✓</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">Blur/Sharpen</span>
                <span className="text-muted-foreground text-sm">○</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">Edge Enhancement</span>
                <span className="text-primary text-sm">✓</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">Vintage Effect</span>
                <span className="text-muted-foreground text-sm">○</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">Crop & Resize</span>
                <span className="text-primary text-sm">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Output Settings</CardTitle>
            <CardDescription>Configure export options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Output Format</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs">JPG</Button>
                  <Button variant="default" size="sm" className="text-xs">PNG</Button>
                  <Button variant="outline" size="sm" className="text-xs">WebP</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quality</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs">High</Button>
                  <Button variant="default" size="sm" className="text-xs">Optimal</Button>
                  <Button variant="outline" size="sm" className="text-xs">Compressed</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Variations</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs">3x</Button>
                  <Button variant="default" size="sm" className="text-xs">5x</Button>
                  <Button variant="outline" size="sm" className="text-xs">10x</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImageSpoofer;