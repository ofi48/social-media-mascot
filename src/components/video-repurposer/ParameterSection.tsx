import React from 'react';
import { Sliders, Palette, Zap, Scissors, Volume2, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { VideoPresetSettings, RangeValue } from '@/types/video-preset';

interface ParameterSectionProps {
  settings: VideoPresetSettings;
  onSettingsChange: (settings: VideoPresetSettings) => void;
}

export const ParameterSection: React.FC<ParameterSectionProps> = ({
  settings,
  onSettingsChange
}) => {
  const updateRangeValue = (key: keyof VideoPresetSettings, field: keyof RangeValue, value: number | boolean) => {
    const currentRange = settings[key] as RangeValue;
    onSettingsChange({
      ...settings,
      [key]: {
        ...currentRange,
        [field]: value
      }
    });
  };

  const updateSimpleValue = (key: keyof VideoPresetSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const RangeControl: React.FC<{
    label: string;
    range: RangeValue;
    onChange: (field: keyof RangeValue, value: number | boolean) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  }> = ({ label, range, onChange, min = 0, max = 100, step = 0.1, unit = '' }) => (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <Label className="font-medium">{label}</Label>
        <Switch
          checked={range.enabled}
          onCheckedChange={(checked) => onChange('enabled', checked)}
        />
      </div>
      {range.enabled && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Min {unit}</Label>
            <Input
              type="number"
              value={range.min}
              onChange={(e) => onChange('min', parseFloat(e.target.value))}
              min={min}
              max={max}
              step={step}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Max {unit}</Label>
            <Input
              type="number"
              value={range.max}
              onChange={(e) => onChange('max', parseFloat(e.target.value))}
              min={min}
              max={max}
              step={step}
              className="h-8"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sliders className="h-5 w-5" />
          Processing Parameters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {/* Video Quality */}
          <AccordionItem value="quality">
            <AccordionTrigger className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Video Quality
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <RangeControl
                label="Video Bitrate"
                range={settings.videoBitrate}
                onChange={(field, value) => updateRangeValue('videoBitrate', field, value)}
                min={100}
                max={5000}
                step={100}
                unit="kbps"
              />
              <RangeControl
                label="Audio Bitrate"
                range={settings.audioBitrate}
                onChange={(field, value) => updateRangeValue('audioBitrate', field, value)}
                min={64}
                max={512}
                step={32}
                unit="kbps"
              />
              <RangeControl
                label="Frame Rate"
                range={settings.frameRate}
                onChange={(field, value) => updateRangeValue('frameRate', field, value)}
                min={15}
                max={60}
                step={1}
                unit="fps"
              />
            </AccordionContent>
          </AccordionItem>

          {/* Color Adjustments */}
          <AccordionItem value="color">
            <AccordionTrigger className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color Adjustments
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <RangeControl
                label="Saturation"
                range={settings.saturation}
                onChange={(field, value) => updateRangeValue('saturation', field, value)}
                min={0}
                max={2}
                step={0.1}
              />
              <RangeControl
                label="Contrast"
                range={settings.contrast}
                onChange={(field, value) => updateRangeValue('contrast', field, value)}
                min={0}
                max={2}
                step={0.1}
              />
              <RangeControl
                label="Brightness"
                range={settings.brightness}
                onChange={(field, value) => updateRangeValue('brightness', field, value)}
                min={-1}
                max={1}
                step={0.1}
              />
              <RangeControl
                label="Gamma"
                range={settings.gamma}
                onChange={(field, value) => updateRangeValue('gamma', field, value)}
                min={0.1}
                max={3}
                step={0.1}
              />
              <RangeControl
                label="Hue"
                range={settings.hue}
                onChange={(field, value) => updateRangeValue('hue', field, value)}
                min={-180}
                max={180}
                step={1}
                unit="°"
              />
            </AccordionContent>
          </AccordionItem>

          {/* Visual Effects */}
          <AccordionItem value="effects">
            <AccordionTrigger className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Visual Effects
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <RangeControl
                label="Vignette"
                range={settings.vignette}
                onChange={(field, value) => updateRangeValue('vignette', field, value)}
                min={0}
                max={1}
                step={0.1}
              />
              <RangeControl
                label="Noise"
                range={settings.noise}
                onChange={(field, value) => updateRangeValue('noise', field, value)}
                min={0}
                max={50}
                step={1}
              />
              <RangeControl
                label="Blur"
                range={settings.blur}
                onChange={(field, value) => updateRangeValue('blur', field, value)}
                min={0}
                max={10}
                step={0.1}
                unit="px"
              />
              <RangeControl
                label="Sharpness"
                range={settings.sharpness}
                onChange={(field, value) => updateRangeValue('sharpness', field, value)}
                min={0}
                max={5}
                step={0.1}
              />
              <RangeControl
                label="Chromakey"
                range={settings.chromakey}
                onChange={(field, value) => updateRangeValue('chromakey', field, value)}
                min={0}
                max={1}
                step={0.1}
              />
              <RangeControl
                label="Blurred Border"
                range={settings.blurredBorder}
                onChange={(field, value) => updateRangeValue('blurredBorder', field, value)}
                min={0}
                max={20}
                step={1}
                unit="px"
              />
              <RangeControl
                label="Stabilization"
                range={settings.stabilization}
                onChange={(field, value) => updateRangeValue('stabilization', field, value)}
                min={0}
                max={1}
                step={0.1}
              />
              <RangeControl
                label="Motion Blur"
                range={settings.motionBlur}
                onChange={(field, value) => updateRangeValue('motionBlur', field, value)}
                min={0}
                max={20}
                step={1}
              />
              <RangeControl
                label="Color Temperature"
                range={settings.colorTemperature}
                onChange={(field, value) => updateRangeValue('colorTemperature', field, value)}
                min={2000}
                max={8000}
                step={100}
                unit="K"
              />
            </AccordionContent>
          </AccordionItem>

          {/* Transformations */}
          <AccordionItem value="transforms">
            <AccordionTrigger className="flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              Transformations
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <RangeControl
                label="Speed"
                range={settings.speed}
                onChange={(field, value) => updateRangeValue('speed', field, value)}
                min={0.5}
                max={2}
                step={0.1}
                unit="x"
              />
              <RangeControl
                label="Zoom"
                range={settings.zoom}
                onChange={(field, value) => updateRangeValue('zoom', field, value)}
                min={0.8}
                max={1.5}
                step={0.1}
                unit="x"
              />
              <RangeControl
                label="Rotation"
                range={settings.rotation}
                onChange={(field, value) => updateRangeValue('rotation', field, value)}
                min={-10}
                max={10}
                step={1}
                unit="°"
              />
              
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Flip Horizontal</Label>
                  <Switch
                    checked={settings.flipHorizontal}
                    onCheckedChange={(checked) => updateSimpleValue('flipHorizontal', checked)}
                  />
                </div>
              </div>

              <div className="space-y-3 p-4 border rounded-lg">
                <Label className="font-medium">Pixel Size</Label>
                <Select
                  value={settings.pixelSize}
                  onValueChange={(value) => updateSimpleValue('pixelSize', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original</SelectItem>
                    <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                    <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                    <SelectItem value="854x480">854x480 (480p)</SelectItem>
                    <SelectItem value="640x360">640x360 (360p)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Audio */}
          <AccordionItem value="audio">
            <AccordionTrigger className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Audio
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <RangeControl
                label="Volume"
                range={settings.volume}
                onChange={(field, value) => updateRangeValue('volume', field, value)}
                min={0}
                max={2}
                step={0.1}
                unit="x"
              />
              <RangeControl
                label="Audio Fade"
                range={settings.audioFade}
                onChange={(field, value) => updateRangeValue('audioFade', field, value)}
                min={0}
                max={5}
                step={0.1}
                unit="s"
              />
              <RangeControl
                label="Highpass Filter"
                range={settings.highpass}
                onChange={(field, value) => updateRangeValue('highpass', field, value)}
                min={50}
                max={3000}
                step={50}
                unit="Hz"
              />
              <RangeControl
                label="Lowpass Filter"
                range={settings.lowpass}
                onChange={(field, value) => updateRangeValue('lowpass', field, value)}
                min={1000}
                max={22000}
                step={100}
                unit="Hz"
              />
            </AccordionContent>
          </AccordionItem>

          {/* Watermark */}
          <AccordionItem value="watermark">
            <AccordionTrigger className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Watermark
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Enable Watermark</Label>
                  <Switch
                    checked={settings.watermark.enabled}
                    onCheckedChange={(checked) => updateSimpleValue('watermark', {
                      ...settings.watermark,
                      enabled: checked
                    })}
                  />
                </div>
                
                {settings.watermark.enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Size</Label>
                      <Input
                        type="number"
                        value={settings.watermark.size}
                        onChange={(e) => updateSimpleValue('watermark', {
                          ...settings.watermark,
                          size: parseInt(e.target.value)
                        })}
                        min={10}
                        max={200}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Opacity</Label>
                      <Input
                        type="number"
                        value={settings.watermark.opacity}
                        onChange={(e) => updateSimpleValue('watermark', {
                          ...settings.watermark,
                          opacity: parseFloat(e.target.value)
                        })}
                        min={0}
                        max={1}
                        step={0.1}
                        className="h-8"
                      />
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};