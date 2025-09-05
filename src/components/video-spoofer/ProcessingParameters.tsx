import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useVideoProcessing } from "./VideoProcessingContext";

interface RangeInputProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  enabled: boolean;
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
  onEnabledChange: (enabled: boolean) => void;
  unit?: string;
}

const RangeInput = ({ 
  label, 
  min, 
  max, 
  step = 0.1, 
  enabled, 
  value, 
  onChange, 
  onEnabledChange,
  unit = ""
}: RangeInputProps) => {
  return (
    <div className="space-y-3 p-4 border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>
      
      {enabled && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Min</Label>
              <Input
                type="number"
                value={value.min}
                onChange={(e) => onChange({ ...value, min: Number(e.target.value) })}
                min={min}
                max={value.max}
                step={step}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Max</Label>
              <Input
                type="number"
                value={value.max}
                onChange={(e) => onChange({ ...value, max: Number(e.target.value) })}
                min={value.min}
                max={max}
                step={step}
                className="h-8"
              />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Range: {value.min}{unit} - {value.max}{unit}
          </div>
        </div>
      )}
    </div>
  );
};

export const ProcessingParameters = () => {
  const { parameters, updateParameter, exportConfiguration, importConfiguration } = useVideoProcessing();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateRangeParameter = (key: string, value: { min: number; max: number; enabled: boolean }) => {
    updateParameter(key, value);
  };

  const handleExportConfig = () => {
    exportConfiguration();
    toast.success("Configuration exported successfully!");
  };

  const handleImportConfig = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await importConfiguration(file);
        toast.success("Configuration imported successfully!");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to import configuration");
      }
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Configuration Export/Import */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportConfig}>
              <Download className="mr-2 h-4 w-4" />
              Export Configuration
            </Button>
            <Button variant="outline" onClick={handleImportConfig}>
              <Upload className="mr-2 h-4 w-4" />
              Import Configuration
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Save your processing parameters to a file or load a previously saved configuration.
          </p>
        </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={["quality", "color", "effects"]} className="w-full">
        {/* Video Quality Controls */}
        <AccordionItem value="quality">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              Video Quality Controls
              <Badge variant="outline" className="text-xs">
                {[parameters.videoBitrate.enabled].filter(Boolean).length} enabled
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <RangeInput
                label="Video Bitrate"
                min={1000}
                max={15000}
                step={100}
                enabled={parameters.videoBitrate.enabled}
                value={{ min: parameters.videoBitrate.min, max: parameters.videoBitrate.max }}
                onChange={(value) => updateRangeParameter('videoBitrate', { ...value, enabled: parameters.videoBitrate.enabled })}
                onEnabledChange={(enabled) => updateRangeParameter('videoBitrate', { ...parameters.videoBitrate, enabled })}
                unit=" kbps"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Color Adjustment Engine */}
        <AccordionItem value="color">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              Color Adjustment Engine
              <Badge variant="outline" className="text-xs">
                {[parameters.saturation.enabled, parameters.contrast.enabled, parameters.brightness.enabled, parameters.gamma.enabled].filter(Boolean).length} enabled
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RangeInput
                label="Saturation"
                min={0.5}
                max={1.5}
                step={0.1}
                enabled={parameters.saturation.enabled}
                value={{ min: parameters.saturation.min, max: parameters.saturation.max }}
                onChange={(value) => updateRangeParameter('saturation', { ...value, enabled: parameters.saturation.enabled })}
                onEnabledChange={(enabled) => updateRangeParameter('saturation', { ...parameters.saturation, enabled })}
                unit="x"
              />
              <RangeInput
                label="Contrast"
                min={0.5}
                max={1.5}
                step={0.1}
                enabled={parameters.contrast.enabled}
                value={{ min: parameters.contrast.min, max: parameters.contrast.max }}
                onChange={(value) => updateRangeParameter('contrast', { ...value, enabled: parameters.contrast.enabled })}
                onEnabledChange={(enabled) => updateRangeParameter('contrast', { ...parameters.contrast, enabled })}
                unit="x"
              />
              <RangeInput
                label="Brightness"
                min={-0.3}
                max={0.3}
                step={0.1}
                enabled={parameters.brightness.enabled}
                value={{ min: parameters.brightness.min, max: parameters.brightness.max }}
                onChange={(value) => updateRangeParameter('brightness', { ...value, enabled: parameters.brightness.enabled })}
                onEnabledChange={(enabled) => updateRangeParameter('brightness', { ...parameters.brightness, enabled })}
              />
              <RangeInput
                label="Gamma"
                min={0.7}
                max={1.3}
                step={0.1}
                enabled={parameters.gamma.enabled}
                value={{ min: parameters.gamma.min, max: parameters.gamma.max }}
                onChange={(value) => updateRangeParameter('gamma', { ...value, enabled: parameters.gamma.enabled })}
                onEnabledChange={(enabled) => updateRangeParameter('gamma', { ...parameters.gamma, enabled })}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Visual Effects Processing */}
        <AccordionItem value="effects">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              Visual Effects & Transformations
              <Badge variant="outline" className="text-xs">
                {[
                  parameters.vignette.enabled, 
                  parameters.noise.enabled, 
                  parameters.pixelShift.enabled,
                  parameters.speed.enabled,
                  parameters.zoom.enabled,
                  parameters.rotation.enabled,
                  parameters.flipHorizontal
                ].filter(Boolean).length} enabled
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <RangeInput
                label="Vignette"
                min={0}
                max={0.8}
                step={0.1}
                enabled={parameters.vignette.enabled}
                value={{ min: parameters.vignette.min, max: parameters.vignette.max }}
                onChange={(value) => updateRangeParameter('vignette', { ...value, enabled: parameters.vignette.enabled })}
                onEnabledChange={(enabled) => updateRangeParameter('vignette', { ...parameters.vignette, enabled })}
              />
              <RangeInput
                label="Noise"
                min={0}
                max={0.1}
                step={0.01}
                enabled={parameters.noise.enabled}
                value={{ min: parameters.noise.min, max: parameters.noise.max }}
                onChange={(value) => updateRangeParameter('noise', { ...value, enabled: parameters.noise.enabled })}
                onEnabledChange={(enabled) => updateRangeParameter('noise', { ...parameters.noise, enabled })}
              />
              <RangeInput
                label="Pixel Shift"
                min={0}
                max={5}
                step={1}
                enabled={parameters.pixelShift.enabled}
                value={{ min: parameters.pixelShift.min, max: parameters.pixelShift.max }}
                onChange={(value) => updateRangeParameter('pixelShift', { ...value, enabled: parameters.pixelShift.enabled })}
                onEnabledChange={(enabled) => updateRangeParameter('pixelShift', { ...parameters.pixelShift, enabled })}
                unit=" px"
              />
              <RangeInput
                label="Speed"
                min={0.5}
                max={2.0}
                step={0.1}
                enabled={parameters.speed.enabled}
                value={{ min: parameters.speed.min, max: parameters.speed.max }}
                onChange={(value) => updateRangeParameter('speed', { ...value, enabled: parameters.speed.enabled })}
                onEnabledChange={(enabled) => updateRangeParameter('speed', { ...parameters.speed, enabled })}
                unit="x"
              />
              <RangeInput
                label="Zoom"
                min={0.9}
                max={1.2}
                step={0.1}
                enabled={parameters.zoom.enabled}
                value={{ min: parameters.zoom.min, max: parameters.zoom.max }}
                onChange={(value) => updateRangeParameter('zoom', { ...value, enabled: parameters.zoom.enabled })}
                onEnabledChange={(enabled) => updateRangeParameter('zoom', { ...parameters.zoom, enabled })}
                unit="x"
              />
              <RangeInput
                label="Rotation"
                min={-10}
                max={10}
                step={1}
                enabled={parameters.rotation.enabled}
                value={{ min: parameters.rotation.min, max: parameters.rotation.max }}
                onChange={(value) => updateRangeParameter('rotation', { ...value, enabled: parameters.rotation.enabled })}
                onEnabledChange={(enabled) => updateRangeParameter('rotation', { ...parameters.rotation, enabled })}
                unit="°"
              />
              
              {/* Simple Toggle Options */}
              <div className="space-y-3 p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Flip Horizontal</Label>
                  <Switch 
                    checked={parameters.flipHorizontal} 
                    onCheckedChange={(checked) => updateParameter('flipHorizontal', checked)} 
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Additional Options */}
        <AccordionItem value="additional">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              Additional Options
              <Badge variant="outline" className="text-xs">
                {[
                  parameters.trimStart.enabled,
                  parameters.trimEnd.enabled,
                  parameters.blurredBorder.enabled,
                  parameters.watermark.enabled,
                  parameters.usMetadata,
                  parameters.randomPixelSize
                ].filter(Boolean).length} enabled
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <RangeInput
                label="Trim Start"
                min={0}
                max={10}
                step={1}
                enabled={parameters.trimStart.enabled}
                value={{ min: parameters.trimStart.min, max: parameters.trimStart.max }}
                onChange={(value) => updateRangeParameter('trimStart', { ...value, enabled: parameters.trimStart.enabled })}
                onEnabledChange={(enabled) => updateRangeParameter('trimStart', { ...parameters.trimStart, enabled })}
                unit="s"
              />
              <RangeInput
                label="Trim End"
                min={0}
                max={10}
                step={1}
                enabled={parameters.trimEnd.enabled}
                value={{ min: parameters.trimEnd.min, max: parameters.trimEnd.max }}
                onChange={(value) => updateRangeParameter('trimEnd', { ...value, enabled: parameters.trimEnd.enabled })}
                onEnabledChange={(enabled) => updateRangeParameter('trimEnd', { ...parameters.trimEnd, enabled })}
                unit="s"
              />
              <RangeInput
                label="Blurred Border"
                min={0}
                max={100}
                step={5}
                enabled={parameters.blurredBorder.enabled}
                value={{ min: parameters.blurredBorder.min, max: parameters.blurredBorder.max }}
                onChange={(value) => updateRangeParameter('blurredBorder', { ...value, enabled: parameters.blurredBorder.enabled })}
                onEnabledChange={(enabled) => updateRangeParameter('blurredBorder', { ...parameters.blurredBorder, enabled })}
                unit="px"
              />
              
              {/* Toggle Options */}
              <div className="space-y-3 p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">US Metadata</Label>
                  <Switch 
                    checked={parameters.usMetadata} 
                    onCheckedChange={(checked) => updateParameter('usMetadata', checked)} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Random 9:16 Size</Label>
                  <Switch 
                    checked={parameters.randomPixelSize} 
                    onCheckedChange={(checked) => updateParameter('randomPixelSize', checked)} 
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};