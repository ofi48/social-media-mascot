import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useVideoSpoofer } from "@/components/video-spoofer/VideoSpooferContext";
import { RotateCcw } from "lucide-react";

export function FFmpegParameters() {
  const { settings, updateSettings, resetSettings } = useVideoSpoofer();

  const updateParameter = (key: string, value: any) => {
    updateSettings({ [key]: value });
  };

  const ParameterSlider = ({ 
    label, 
    parameter, 
    paramKey, 
    step = 0.01, 
    decimals = 2,
    unit = "" 
  }: { 
    label: string; 
    parameter: any; 
    paramKey: string;
    step?: number;
    decimals?: number;
    unit?: string;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Switch
          checked={parameter.enabled}
          onCheckedChange={(enabled) => 
            updateParameter(paramKey, { ...parameter, enabled })
          }
        />
      </div>
      {parameter.enabled && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Min: {parameter.min.toFixed(decimals)}{unit}</span>
            <span>Max: {parameter.max.toFixed(decimals)}{unit}</span>
          </div>
          <div className="px-3">
            <Slider
              value={[parameter.min, parameter.max]}
              onValueChange={([min, max]) => 
                updateParameter(paramKey, { ...parameter, min, max })
              }
              min={getMinLimit(paramKey)}
              max={getMaxLimit(paramKey)}
              step={step}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );

  const getMinLimit = (paramKey: string): number => {
    const limits: Record<string, number> = {
      saturation: 0.1,
      contrast: 0.1,
      brightness: -1.0,
      hue: -180,
      gamma: 0.1,
      blur: 0,
      sharpness: 0,
      noise: 0,
      speed: 0.25,
      zoom: 0.5,
      rotation: -45,
      volume: 0.1,
      audioFade: 0,
      highpass: 20,
      lowpass: 1000,
      videoBitrate: 200,
      frameRate: 10,
      stabilization: 0,
      colorTemperature: 1000,
    };
    return limits[paramKey] || 0;
  };

  const getMaxLimit = (paramKey: string): number => {
    const limits: Record<string, number> = {
      saturation: 3.0,
      contrast: 3.0,
      brightness: 1.0,
      hue: 180,
      gamma: 3.0,
      blur: 10,
      sharpness: 5,
      noise: 1.0,
      speed: 4.0,
      zoom: 2.0,
      rotation: 45,
      volume: 3.0,
      audioFade: 10,
      highpass: 8000,
      lowpass: 20000,
      videoBitrate: 10000,
      frameRate: 60,
      stabilization: 1,
      colorTemperature: 10000,
    };
    return limits[paramKey] || 100;
  };

  const getStep = (paramKey: string): number => {
    const steps: Record<string, number> = {
      hue: 1,
      blur: 0.1,
      sharpness: 0.1,
      rotation: 0.5,
      highpass: 10,
      lowpass: 100,
      videoBitrate: 50,
      frameRate: 1,
      colorTemperature: 100,
    };
    return steps[paramKey] || 0.01;
  };

  const getDecimals = (paramKey: string): number => {
    const decimals: Record<string, number> = {
      hue: 0,
      rotation: 1,
      highpass: 0,
      lowpass: 0,
      videoBitrate: 0,
      frameRate: 0,
      colorTemperature: 0,
    };
    return decimals[paramKey] || 2;
  };

  const getUnit = (paramKey: string): string => {
    const units: Record<string, string> = {
      hue: "°",
      rotation: "°",
      blur: "px",
      sharpness: "x",
      highpass: "Hz",
      lowpass: "Hz",
      videoBitrate: "kbps",
      frameRate: "fps",
      colorTemperature: "K",
      audioFade: "s",
    };
    return units[paramKey] || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">FFmpeg Parameters</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetSettings}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All
        </Button>
      </div>

      <Accordion type="multiple" className="w-full">
        <AccordionItem value="color">
          <AccordionTrigger>Color Adjustments</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <ParameterSlider
              label="Saturation"
              parameter={settings.saturation}
              paramKey="saturation"
            />
            <ParameterSlider
              label="Contrast"
              parameter={settings.contrast}
              paramKey="contrast"
            />
            <ParameterSlider
              label="Brightness"
              parameter={settings.brightness}
              paramKey="brightness"
            />
            <ParameterSlider
              label="Hue"
              parameter={settings.hue}
              paramKey="hue"
              step={getStep('hue')}
              decimals={getDecimals('hue')}
              unit={getUnit('hue')}
            />
            <ParameterSlider
              label="Gamma"
              parameter={settings.gamma}
              paramKey="gamma"
            />
            <ParameterSlider
              label="Color Temperature"
              parameter={settings.colorTemperature}
              paramKey="colorTemperature"
              step={getStep('colorTemperature')}
              decimals={getDecimals('colorTemperature')}
              unit={getUnit('colorTemperature')}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="effects">
          <AccordionTrigger>Visual Effects</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <ParameterSlider
              label="Blur"
              parameter={settings.blur}
              paramKey="blur"
              step={getStep('blur')}
              decimals={getDecimals('blur')}
              unit={getUnit('blur')}
            />
            <ParameterSlider
              label="Sharpness"
              parameter={settings.sharpness}
              paramKey="sharpness"
              step={getStep('sharpness')}
              decimals={getDecimals('sharpness')}
              unit={getUnit('sharpness')}
            />
            <ParameterSlider
              label="Noise"
              parameter={settings.noise}
              paramKey="noise"
            />
            <ParameterSlider
              label="Stabilization"
              parameter={settings.stabilization}
              paramKey="stabilization"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="transform">
          <AccordionTrigger>Transformations</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <ParameterSlider
              label="Speed"
              parameter={settings.speed}
              paramKey="speed"
            />
            <ParameterSlider
              label="Zoom"
              parameter={settings.zoom}
              paramKey="zoom"
            />
            <ParameterSlider
              label="Rotation"
              parameter={settings.rotation}
              paramKey="rotation"
              step={getStep('rotation')}
              decimals={getDecimals('rotation')}
              unit={getUnit('rotation')}
            />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Horizontal Flip</Label>
                <Switch
                  checked={settings.flipHorizontal}
                  onCheckedChange={(flipHorizontal) => 
                    updateParameter('flipHorizontal', flipHorizontal)
                  }
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="audio">
          <AccordionTrigger>Audio Processing</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <ParameterSlider
              label="Volume"
              parameter={settings.volume}
              paramKey="volume"
            />
            <ParameterSlider
              label="Audio Fade"
              parameter={settings.audioFade}
              paramKey="audioFade"
              step={getStep('audioFade')}
              decimals={getDecimals('audioFade')}
              unit={getUnit('audioFade')}
            />
            <ParameterSlider
              label="High-pass Filter"
              parameter={settings.highpass}
              paramKey="highpass"
              step={getStep('highpass')}
              decimals={getDecimals('highpass')}
              unit={getUnit('highpass')}
            />
            <ParameterSlider
              label="Low-pass Filter"
              parameter={settings.lowpass}
              paramKey="lowpass"
              step={getStep('lowpass')}
              decimals={getDecimals('lowpass')}
              unit={getUnit('lowpass')}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="quality">
          <AccordionTrigger>Quality Settings</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <ParameterSlider
              label="Video Bitrate"
              parameter={settings.videoBitrate}
              paramKey="videoBitrate"
              step={getStep('videoBitrate')}
              decimals={getDecimals('videoBitrate')}
              unit={getUnit('videoBitrate')}
            />
            <ParameterSlider
              label="Frame Rate"
              parameter={settings.frameRate}
              paramKey="frameRate"
              step={getStep('frameRate')}
              decimals={getDecimals('frameRate')}
              unit={getUnit('frameRate')}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}