import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useImageProcessing } from "./ImageProcessingContext";

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

const RangeInput: React.FC<RangeInputProps> = ({
  label,
  min,
  max,
  step = 0.1,
  enabled,
  value,
  onChange,
  onEnabledChange,
  unit = ""
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={`${label}-switch`} className="text-sm font-medium">
          {label}
        </Label>
        <Switch
          id={`${label}-switch`}
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>
      
      {enabled && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Min</Label>
              <Input
                type="number"
                min={min}
                max={max}
                step={step}
                value={value.min}
                onChange={(e) => onChange({ ...value, min: parseFloat(e.target.value) })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Max</Label>
              <Input
                type="number"
                min={min}
                max={max}
                step={step}
                value={value.max}
                onChange={(e) => onChange({ ...value, max: parseFloat(e.target.value) })}
                className="h-8"
              />
            </div>
          </div>
          {unit && (
            <p className="text-xs text-muted-foreground">Unit: {unit}</p>
          )}
        </div>
      )}
    </div>
  );
};

export const ImageProcessingParameters = () => {
  const { parameters, updateParameter } = useImageProcessing();

  const updateRangeParameter = (key: string, value: { min: number; max: number; enabled: boolean }) => {
    updateParameter(key, value);
  };

  const getEnabledCount = (category: string) => {
    switch (category) {
      case 'color':
        return [
          parameters.brightness.enabled,
          parameters.contrast.enabled,
          parameters.saturation.enabled,
          parameters.hue.enabled,
          parameters.gamma.enabled
        ].filter(Boolean).length;
      
      case 'effects':
        return [
          parameters.noise.enabled,
          parameters.blur.enabled,
          parameters.sharpen.enabled,
          parameters.vignette.enabled,
          parameters.vintage,
          parameters.edgeEnhancement
        ].filter(Boolean).length;
      
      case 'transform':
        return [
          parameters.rotation.enabled,
          parameters.scale.enabled,
          parameters.flipHorizontal,
          parameters.flipVertical,
          parameters.customSize.enabled,
          parameters.randomCrop.enabled
        ].filter(Boolean).length;
      
      case 'output':
        return [
          parameters.quality.enabled,
          parameters.watermark.enabled
        ].filter(Boolean).length;
      
      default:
        return 0;
    }
  };

  return (
    <Accordion type="multiple" className="w-full" defaultValue={["color", "effects"]}>
      {/* Color Adjustments */}
      <AccordionItem value="color">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <span>Color Adjustments</span>
            <Badge variant="outline">{getEnabledCount('color')} enabled</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <RangeInput
            label="Brightness"
            min={-0.5}
            max={0.5}
            step={0.1}
            enabled={parameters.brightness.enabled}
            value={parameters.brightness}
            onChange={(value) => updateRangeParameter('brightness', { ...value, enabled: parameters.brightness.enabled })}
            onEnabledChange={(enabled) => updateRangeParameter('brightness', { ...parameters.brightness, enabled })}
            unit="adjustment level"
          />
          
          <RangeInput
            label="Contrast"
            min={0.1}
            max={2.0}
            step={0.1}
            enabled={parameters.contrast.enabled}
            value={parameters.contrast}
            onChange={(value) => updateRangeParameter('contrast', { ...value, enabled: parameters.contrast.enabled })}
            onEnabledChange={(enabled) => updateRangeParameter('contrast', { ...parameters.contrast, enabled })}
            unit="multiplier"
          />
          
          <RangeInput
            label="Saturation"
            min={0.0}
            max={2.0}
            step={0.1}
            enabled={parameters.saturation.enabled}
            value={parameters.saturation}
            onChange={(value) => updateRangeParameter('saturation', { ...value, enabled: parameters.saturation.enabled })}
            onEnabledChange={(enabled) => updateRangeParameter('saturation', { ...parameters.saturation, enabled })}
            unit="multiplier"
          />
          
          <RangeInput
            label="Hue Shift"
            min={-180}
            max={180}
            step={5}
            enabled={parameters.hue.enabled}
            value={parameters.hue}
            onChange={(value) => updateRangeParameter('hue', { ...value, enabled: parameters.hue.enabled })}
            onEnabledChange={(enabled) => updateRangeParameter('hue', { ...parameters.hue, enabled })}
            unit="degrees"
          />
          
          <RangeInput
            label="Gamma Correction"
            min={0.5}
            max={2.0}
            step={0.1}
            enabled={parameters.gamma.enabled}
            value={parameters.gamma}
            onChange={(value) => updateRangeParameter('gamma', { ...value, enabled: parameters.gamma.enabled })}
            onEnabledChange={(enabled) => updateRangeParameter('gamma', { ...parameters.gamma, enabled })}
            unit="gamma value"
          />
        </AccordionContent>
      </AccordionItem>

      {/* Visual Effects */}
      <AccordionItem value="effects">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <span>Visual Effects</span>
            <Badge variant="outline">{getEnabledCount('effects')} enabled</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <RangeInput
            label="Noise Injection"
            min={0}
            max={0.2}
            step={0.01}
            enabled={parameters.noise.enabled}
            value={parameters.noise}
            onChange={(value) => updateRangeParameter('noise', { ...value, enabled: parameters.noise.enabled })}
            onEnabledChange={(enabled) => updateRangeParameter('noise', { ...parameters.noise, enabled })}
            unit="intensity"
          />
          
          <RangeInput
            label="Blur Effect"
            min={0}
            max={5}
            step={0.5}
            enabled={parameters.blur.enabled}
            value={parameters.blur}
            onChange={(value) => updateRangeParameter('blur', { ...value, enabled: parameters.blur.enabled })}
            onEnabledChange={(enabled) => updateRangeParameter('blur', { ...parameters.blur, enabled })}
            unit="pixels"
          />
          
          <RangeInput
            label="Sharpen Effect"
            min={0}
            max={2}
            step={0.1}
            enabled={parameters.sharpen.enabled}
            value={parameters.sharpen}
            onChange={(value) => updateRangeParameter('sharpen', { ...value, enabled: parameters.sharpen.enabled })}
            onEnabledChange={(enabled) => updateRangeParameter('sharpen', { ...parameters.sharpen, enabled })}
            unit="intensity"
          />
          
          <RangeInput
            label="Vignette Effect"
            min={0}
            max={1}
            step={0.1}
            enabled={parameters.vignette.enabled}
            value={parameters.vignette}
            onChange={(value) => updateRangeParameter('vignette', { ...value, enabled: parameters.vignette.enabled })}
            onEnabledChange={(enabled) => updateRangeParameter('vignette', { ...parameters.vignette, enabled })}
            unit="intensity"
          />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Vintage Effect</Label>
              <Switch
                checked={parameters.vintage}
                onCheckedChange={(checked) => updateParameter('vintage', checked)}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Edge Enhancement</Label>
              <Switch
                checked={parameters.edgeEnhancement}
                onCheckedChange={(checked) => updateParameter('edgeEnhancement', checked)}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Transformations */}
      <AccordionItem value="transform">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <span>Transformations</span>
            <Badge variant="outline">{getEnabledCount('transform')} enabled</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <RangeInput
            label="Rotation"
            min={-180}
            max={180}
            step={5}
            enabled={parameters.rotation.enabled}
            value={parameters.rotation}
            onChange={(value) => updateRangeParameter('rotation', { ...value, enabled: parameters.rotation.enabled })}
            onEnabledChange={(enabled) => updateRangeParameter('rotation', { ...parameters.rotation, enabled })}
            unit="degrees"
          />
          
          <RangeInput
            label="Scale"
            min={0.5}
            max={2.0}
            step={0.1}
            enabled={parameters.scale.enabled}
            value={parameters.scale}
            onChange={(value) => updateRangeParameter('scale', { ...value, enabled: parameters.scale.enabled })}
            onEnabledChange={(enabled) => updateRangeParameter('scale', { ...parameters.scale, enabled })}
            unit="multiplier"
          />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Flip Horizontal</Label>
              <Switch
                checked={parameters.flipHorizontal}
                onCheckedChange={(checked) => updateParameter('flipHorizontal', checked)}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Flip Vertical</Label>
              <Switch
                checked={parameters.flipVertical}
                onCheckedChange={(checked) => updateParameter('flipVertical', checked)}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Custom Size</Label>
              <Switch
                checked={parameters.customSize.enabled}
                onCheckedChange={(enabled) => updateParameter('customSize', { ...parameters.customSize, enabled })}
              />
            </div>
            
            {parameters.customSize.enabled && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Width</Label>
                  <Input
                    type="number"
                    min={100}
                    max={4000}
                    value={parameters.customSize.width}
                    onChange={(e) => updateParameter('customSize', { 
                      ...parameters.customSize, 
                      width: parseInt(e.target.value) 
                    })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Height</Label>
                  <Input
                    type="number"
                    min={100}
                    max={4000}
                    value={parameters.customSize.height}
                    onChange={(e) => updateParameter('customSize', { 
                      ...parameters.customSize, 
                      height: parseInt(e.target.value) 
                    })}
                    className="h-8"
                  />
                </div>
              </div>
            )}
          </div>
          
          <RangeInput
            label="Random Crop"
            min={0.7}
            max={1.0}
            step={0.05}
            enabled={parameters.randomCrop.enabled}
            value={parameters.randomCrop}
            onChange={(value) => updateRangeParameter('randomCrop', { ...value, enabled: parameters.randomCrop.enabled })}
            onEnabledChange={(enabled) => updateRangeParameter('randomCrop', { ...parameters.randomCrop, enabled })}
            unit="crop ratio"
          />
        </AccordionContent>
      </AccordionItem>

      {/* Output Settings */}
      <AccordionItem value="output">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <span>Output Settings</span>
            <Badge variant="outline">{getEnabledCount('output')} enabled</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Output Format</Label>
            <Select 
              value={parameters.format} 
              onValueChange={(value) => updateParameter('format', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <RangeInput
            label="Quality Variation"
            min={50}
            max={100}
            step={5}
            enabled={parameters.quality.enabled}
            value={parameters.quality}
            onChange={(value) => updateRangeParameter('quality', { ...value, enabled: parameters.quality.enabled })}
            onEnabledChange={(enabled) => updateRangeParameter('quality', { ...parameters.quality, enabled })}
            unit="percentage"
          />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Watermark</Label>
              <Switch
                checked={parameters.watermark.enabled}
                onCheckedChange={(enabled) => updateParameter('watermark', { ...parameters.watermark, enabled })}
              />
            </div>
            
            {parameters.watermark.enabled && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Text</Label>
                  <Input
                    value={parameters.watermark.text}
                    onChange={(e) => updateParameter('watermark', { 
                      ...parameters.watermark, 
                      text: e.target.value 
                    })}
                    className="h-8"
                    placeholder="Watermark text"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Size</Label>
                    <Input
                      type="number"
                      min={10}
                      max={100}
                      value={parameters.watermark.size}
                      onChange={(e) => updateParameter('watermark', { 
                        ...parameters.watermark, 
                        size: parseInt(e.target.value) 
                      })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Opacity</Label>
                    <Input
                      type="number"
                      min={0}
                      max={1}
                      step={0.1}
                      value={parameters.watermark.opacity}
                      onChange={(e) => updateParameter('watermark', { 
                        ...parameters.watermark, 
                        opacity: parseFloat(e.target.value) 
                      })}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};