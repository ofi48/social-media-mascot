import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useVideoProcessingContext } from "./VideoProcessingProvider";
import { RangeValue, SimpleValue } from "@/types/video-preset";

export function VideoProcessingPanel() {
  const { settings, updateSettings, resetSettings } = useVideoProcessingContext();

  const updateRangeValue = (key: string, field: 'min' | 'max' | 'enabled', value: number | boolean) => {
    const currentValue = settings[key as keyof typeof settings] as RangeValue;
    updateSettings({
      [key]: {
        ...currentValue,
        [field]: value
      }
    });
  };

  const updateSimpleValue = (key: string, field: 'value' | 'enabled', value: number | boolean) => {
    const currentValue = settings[key as keyof typeof settings] as SimpleValue;
    updateSettings({
      [key]: {
        ...currentValue,
        [field]: value
      }
    });
  };

  const getEnabledParametersCount = () => {
    let count = 0;
    Object.entries(settings).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && 'enabled' in value && value.enabled) {
        count++;
      }
    });
    return count;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Parámetros de Procesamiento</CardTitle>
            <CardDescription>
              Configura los efectos y transformaciones para generar variaciones únicas
              ({getEnabledParametersCount()} parámetros activos)
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={resetSettings}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restablecer
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="quality" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="quality">Calidad</TabsTrigger>
            <TabsTrigger value="color">Color</TabsTrigger>
            <TabsTrigger value="effects">Efectos</TabsTrigger>
            <TabsTrigger value="transform">Transformar</TabsTrigger>
            <TabsTrigger value="special">Especial</TabsTrigger>
          </TabsList>
          
          {/* Quality Tab */}
          <TabsContent value="quality" className="space-y-6">
            <div className="grid gap-6">
              {/* Video Bitrate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="videoBitrate">Video Bitrate (kbps)</Label>
                  <Switch
                    checked={settings.videoBitrate.enabled}
                    onCheckedChange={(checked) => updateRangeValue('videoBitrate', 'enabled', checked)}
                  />
                </div>
                {settings.videoBitrate.enabled && (
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Mínimo</Label>
                        <Slider
                          value={[settings.videoBitrate.min]}
                          onValueChange={([value]) => updateRangeValue('videoBitrate', 'min', value)}
                          min={200}
                          max={8000}
                          step={100}
                          className="mt-1"
                        />
                        <span className="text-xs text-muted-foreground">{settings.videoBitrate.min} kbps</span>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Máximo</Label>
                        <Slider
                          value={[settings.videoBitrate.max]}
                          onValueChange={([value]) => updateRangeValue('videoBitrate', 'max', value)}
                          min={200}
                          max={8000}
                          step={100}
                          className="mt-1"
                        />
                        <span className="text-xs text-muted-foreground">{settings.videoBitrate.max} kbps</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Audio Bitrate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="audioBitrate">Audio Bitrate (kbps)</Label>
                  <Switch
                    checked={settings.audioBitrate.enabled}
                    onCheckedChange={(checked) => updateRangeValue('audioBitrate', 'enabled', checked)}
                  />
                </div>
                {settings.audioBitrate.enabled && (
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Mínimo</Label>
                        <Slider
                          value={[settings.audioBitrate.min]}
                          onValueChange={([value]) => updateRangeValue('audioBitrate', 'min', value)}
                          min={64}
                          max={320}
                          step={32}
                          className="mt-1"
                        />
                        <span className="text-xs text-muted-foreground">{settings.audioBitrate.min} kbps</span>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Máximo</Label>
                        <Slider
                          value={[settings.audioBitrate.max]}
                          onValueChange={([value]) => updateRangeValue('audioBitrate', 'max', value)}
                          min={64}
                          max={320}
                          step={32}
                          className="mt-1"
                        />
                        <span className="text-xs text-muted-foreground">{settings.audioBitrate.max} kbps</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Frame Rate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="frameRate">Frame Rate (fps)</Label>
                  <Switch
                    checked={settings.frameRate.enabled}
                    onCheckedChange={(checked) => updateRangeValue('frameRate', 'enabled', checked)}
                  />
                </div>
                {settings.frameRate.enabled && (
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Mínimo</Label>
                        <Slider
                          value={[settings.frameRate.min]}
                          onValueChange={([value]) => updateRangeValue('frameRate', 'min', value)}
                          min={15}
                          max={60}
                          step={1}
                          className="mt-1"
                        />
                        <span className="text-xs text-muted-foreground">{settings.frameRate.min} fps</span>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Máximo</Label>
                        <Slider
                          value={[settings.frameRate.max]}
                          onValueChange={([value]) => updateRangeValue('frameRate', 'max', value)}
                          min={15}
                          max={60}
                          step={1}
                          className="mt-1"
                        />
                        <span className="text-xs text-muted-foreground">{settings.frameRate.max} fps</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Color Tab */}
          <TabsContent value="color" className="space-y-6">
            <div className="grid gap-6">
              {/* Saturation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Saturación</Label>
                  <Switch
                    checked={settings.saturation.enabled}
                    onCheckedChange={(checked) => updateRangeValue('saturation', 'enabled', checked)}
                  />
                </div>
                {settings.saturation.enabled && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Mínimo</Label>
                      <Slider
                        value={[settings.saturation.min]}
                        onValueChange={([value]) => updateRangeValue('saturation', 'min', value)}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.saturation.min.toFixed(1)}</span>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Máximo</Label>
                      <Slider
                        value={[settings.saturation.max]}
                        onValueChange={([value]) => updateRangeValue('saturation', 'max', value)}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.saturation.max.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Contrast */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Contraste</Label>
                  <Switch
                    checked={settings.contrast.enabled}
                    onCheckedChange={(checked) => updateRangeValue('contrast', 'enabled', checked)}
                  />
                </div>
                {settings.contrast.enabled && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Mínimo</Label>
                      <Slider
                        value={[settings.contrast.min]}
                        onValueChange={([value]) => updateRangeValue('contrast', 'min', value)}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.contrast.min.toFixed(1)}</span>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Máximo</Label>
                      <Slider
                        value={[settings.contrast.max]}
                        onValueChange={([value]) => updateRangeValue('contrast', 'max', value)}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.contrast.max.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Brightness */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Brillo</Label>
                  <Switch
                    checked={settings.brightness.enabled}
                    onCheckedChange={(checked) => updateRangeValue('brightness', 'enabled', checked)}
                  />
                </div>
                {settings.brightness.enabled && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Mínimo</Label>
                      <Slider
                        value={[settings.brightness.min]}
                        onValueChange={([value]) => updateRangeValue('brightness', 'min', value)}
                        min={-0.3}
                        max={0.3}
                        step={0.05}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.brightness.min.toFixed(2)}</span>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Máximo</Label>
                      <Slider
                        value={[settings.brightness.max]}
                        onValueChange={([value]) => updateRangeValue('brightness', 'max', value)}
                        min={-0.3}
                        max={0.3}
                        step={0.05}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.brightness.max.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Gamma */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Gamma</Label>
                  <Switch
                    checked={settings.gamma.enabled}
                    onCheckedChange={(checked) => updateRangeValue('gamma', 'enabled', checked)}
                  />
                </div>
                {settings.gamma.enabled && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Mínimo</Label>
                      <Slider
                        value={[settings.gamma.min]}
                        onValueChange={([value]) => updateRangeValue('gamma', 'min', value)}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.gamma.min.toFixed(1)}</span>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Máximo</Label>
                      <Slider
                        value={[settings.gamma.max]}
                        onValueChange={([value]) => updateRangeValue('gamma', 'max', value)}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.gamma.max.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-6">
            <div className="grid gap-6">
              {/* Vignette */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Viñeta</Label>
                  <Switch
                    checked={settings.vignette.enabled}
                    onCheckedChange={(checked) => updateSimpleValue('vignette', 'enabled', checked)}
                  />
                </div>
                {settings.vignette.enabled && (
                  <div>
                    <Slider
                      value={[settings.vignette.value]}
                      onValueChange={([value]) => updateSimpleValue('vignette', 'value', value)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="mt-1"
                    />
                    <span className="text-xs text-muted-foreground">Intensidad: {settings.vignette.value.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Noise */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Ruido</Label>
                  <Switch
                    checked={settings.noise.enabled}
                    onCheckedChange={(checked) => updateSimpleValue('noise', 'enabled', checked)}
                  />
                </div>
                {settings.noise.enabled && (
                  <div>
                    <Slider
                      value={[settings.noise.value]}
                      onValueChange={([value]) => updateSimpleValue('noise', 'value', value)}
                      min={0}
                      max={0.1}
                      step={0.01}
                      className="mt-1"
                    />
                    <span className="text-xs text-muted-foreground">Intensidad: {settings.noise.value.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Waveform Shift */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Desplazamiento de Onda</Label>
                  <Switch
                    checked={settings.waveformShift.enabled}
                    onCheckedChange={(checked) => updateSimpleValue('waveformShift', 'enabled', checked)}
                  />
                </div>
                {settings.waveformShift.enabled && (
                  <div>
                    <Slider
                      value={[settings.waveformShift.value]}
                      onValueChange={([value]) => updateSimpleValue('waveformShift', 'value', value)}
                      min={0}
                      max={0.5}
                      step={0.05}
                      className="mt-1"
                    />
                    <span className="text-xs text-muted-foreground">Intensidad: {settings.waveformShift.value.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Pixel Shift */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Desplazamiento de Píxeles</Label>
                  <Switch
                    checked={settings.pixelShift.enabled}
                    onCheckedChange={(checked) => updateSimpleValue('pixelShift', 'enabled', checked)}
                  />
                </div>
                {settings.pixelShift.enabled && (
                  <div>
                    <Slider
                      value={[settings.pixelShift.value]}
                      onValueChange={([value]) => updateSimpleValue('pixelShift', 'value', value)}
                      min={0}
                      max={5}
                      step={1}
                      className="mt-1"
                    />
                    <span className="text-xs text-muted-foreground">Píxeles: {settings.pixelShift.value}</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Transform Tab */}
          <TabsContent value="transform" className="space-y-6">
            <div className="grid gap-6">
              {/* Speed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Velocidad</Label>
                  <Switch
                    checked={settings.speed.enabled}
                    onCheckedChange={(checked) => updateRangeValue('speed', 'enabled', checked)}
                  />
                </div>
                {settings.speed.enabled && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Mínimo</Label>
                      <Slider
                        value={[settings.speed.min]}
                        onValueChange={([value]) => updateRangeValue('speed', 'min', value)}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.speed.min.toFixed(1)}x</span>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Máximo</Label>
                      <Slider
                        value={[settings.speed.max]}
                        onValueChange={([value]) => updateRangeValue('speed', 'max', value)}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.speed.max.toFixed(1)}x</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Zoom */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Zoom</Label>
                  <Switch
                    checked={settings.zoom.enabled}
                    onCheckedChange={(checked) => updateRangeValue('zoom', 'enabled', checked)}
                  />
                </div>
                {settings.zoom.enabled && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Mínimo</Label>
                      <Slider
                        value={[settings.zoom.min]}
                        onValueChange={([value]) => updateRangeValue('zoom', 'min', value)}
                        min={0.8}
                        max={1.5}
                        step={0.05}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.zoom.min.toFixed(2)}x</span>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Máximo</Label>
                      <Slider
                        value={[settings.zoom.max]}
                        onValueChange={([value]) => updateRangeValue('zoom', 'max', value)}
                        min={0.8}
                        max={1.5}
                        step={0.05}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.zoom.max.toFixed(2)}x</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Rotation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Rotación (grados)</Label>
                  <Switch
                    checked={settings.rotation.enabled}
                    onCheckedChange={(checked) => updateRangeValue('rotation', 'enabled', checked)}
                  />
                </div>
                {settings.rotation.enabled && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Mínimo</Label>
                      <Slider
                        value={[settings.rotation.min]}
                        onValueChange={([value]) => updateRangeValue('rotation', 'min', value)}
                        min={-10}
                        max={10}
                        step={1}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.rotation.min}°</span>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Máximo</Label>
                      <Slider
                        value={[settings.rotation.max]}
                        onValueChange={([value]) => updateRangeValue('rotation', 'max', value)}
                        min={-10}
                        max={10}
                        step={1}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.rotation.max}°</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Flip Horizontal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Voltear Horizontalmente</Label>
                  <Switch
                    checked={settings.flipHorizontal.enabled}
                    onCheckedChange={(checked) => updateSimpleValue('flipHorizontal', 'enabled', checked)}
                  />
                </div>
              </div>

              {/* Pixel Size */}
              <div className="space-y-3">
                <Label>Tamaño de Video</Label>
                <Select
                  value={settings.pixelSize}
                  onValueChange={(value) => updateSettings({ pixelSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original</SelectItem>
                    <SelectItem value="1280x720">HD (1280x720)</SelectItem>
                    <SelectItem value="1920x1080">Full HD (1920x1080)</SelectItem>
                    <SelectItem value="854x480">SD (854x480)</SelectItem>
                    <SelectItem value="1366x768">WXGA (1366x768)</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.randomPixelSize}
                    onCheckedChange={(checked) => updateSettings({ randomPixelSize: checked })}
                  />
                  <Label className="text-sm">Tamaño aleatorio por variación</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Special Tab */}
          <TabsContent value="special" className="space-y-6">
            <div className="grid gap-6">
              {/* Trim Start */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Recorte Inicial (segundos)</Label>
                  <Switch
                    checked={settings.trimStart.enabled}
                    onCheckedChange={(checked) => updateRangeValue('trimStart', 'enabled', checked)}
                  />
                </div>
                {settings.trimStart.enabled && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Mínimo</Label>
                      <Slider
                        value={[settings.trimStart.min]}
                        onValueChange={([value]) => updateRangeValue('trimStart', 'min', value)}
                        min={0}
                        max={30}
                        step={1}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.trimStart.min}s</span>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Máximo</Label>
                      <Slider
                        value={[settings.trimStart.max]}
                        onValueChange={([value]) => updateRangeValue('trimStart', 'max', value)}
                        min={0}
                        max={30}
                        step={1}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.trimStart.max}s</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Trim End */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Recorte Final (segundos)</Label>
                  <Switch
                    checked={settings.trimEnd.enabled}
                    onCheckedChange={(checked) => updateRangeValue('trimEnd', 'enabled', checked)}
                  />
                </div>
                {settings.trimEnd.enabled && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Mínimo</Label>
                      <Slider
                        value={[settings.trimEnd.min]}
                        onValueChange={([value]) => updateRangeValue('trimEnd', 'min', value)}
                        min={0}
                        max={30}
                        step={1}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.trimEnd.min}s</span>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Máximo</Label>
                      <Slider
                        value={[settings.trimEnd.max]}
                        onValueChange={([value]) => updateRangeValue('trimEnd', 'max', value)}
                        min={0}
                        max={30}
                        step={1}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.trimEnd.max}s</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Blurred Border */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Borde Difuminado (píxeles)</Label>
                  <Switch
                    checked={settings.blurredBorder.enabled}
                    onCheckedChange={(checked) => updateRangeValue('blurredBorder', 'enabled', checked)}
                  />
                </div>
                {settings.blurredBorder.enabled && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Mínimo</Label>
                      <Slider
                        value={[settings.blurredBorder.min]}
                        onValueChange={([value]) => updateRangeValue('blurredBorder', 'min', value)}
                        min={5}
                        max={50}
                        step={5}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.blurredBorder.min}px</span>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Máximo</Label>
                      <Slider
                        value={[settings.blurredBorder.max]}
                        onValueChange={([value]) => updateRangeValue('blurredBorder', 'max', value)}
                        min={5}
                        max={50}
                        step={5}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.blurredBorder.max}px</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Volume */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Volumen</Label>
                  <Switch
                    checked={settings.volume.enabled}
                    onCheckedChange={(checked) => updateRangeValue('volume', 'enabled', checked)}
                  />
                </div>
                {settings.volume.enabled && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Mínimo</Label>
                      <Slider
                        value={[settings.volume.min]}
                        onValueChange={([value]) => updateRangeValue('volume', 'min', value)}
                        min={0.1}
                        max={2.0}
                        step={0.1}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.volume.min.toFixed(1)}x</span>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Máximo</Label>
                      <Slider
                        value={[settings.volume.max]}
                        onValueChange={([value]) => updateRangeValue('volume', 'max', value)}
                        min={0.1}
                        max={2.0}
                        step={0.1}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">{settings.volume.max.toFixed(1)}x</span>
                    </div>
                  </div>
                )}
              </div>

              {/* US Metadata */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Usar Metadatos US</Label>
                  <Switch
                    checked={settings.usMetadata}
                    onCheckedChange={(checked) => updateSettings({ usMetadata: checked })}
                  />
                </div>
              </div>

              {/* Watermark */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Marca de Agua</Label>
                  <Switch
                    checked={settings.watermark.enabled}
                    onCheckedChange={(checked) => 
                      updateSettings({ 
                        watermark: { 
                          ...settings.watermark, 
                          enabled: checked 
                        } 
                      })
                    }
                  />
                </div>
                {settings.watermark.enabled && (
                  <div className="space-y-4">
                    {/* Watermark Size */}
                    <div>
                      <Label className="text-sm">Tamaño (%)</Label>
                      <div className="flex gap-4 mt-2">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Mínimo</Label>
                          <Slider
                            value={[settings.watermark.size.min]}
                            onValueChange={([value]) => 
                              updateSettings({
                                watermark: {
                                  ...settings.watermark,
                                  size: { ...settings.watermark.size, min: value }
                                }
                              })
                            }
                            min={2}
                            max={20}
                            step={1}
                            className="mt-1"
                          />
                          <span className="text-xs text-muted-foreground">{settings.watermark.size.min}%</span>
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Máximo</Label>
                          <Slider
                            value={[settings.watermark.size.max]}
                            onValueChange={([value]) => 
                              updateSettings({
                                watermark: {
                                  ...settings.watermark,
                                  size: { ...settings.watermark.size, max: value }
                                }
                              })
                            }
                            min={2}
                            max={20}
                            step={1}
                            className="mt-1"
                          />
                          <span className="text-xs text-muted-foreground">{settings.watermark.size.max}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Watermark Opacity */}
                    <div>
                      <Label className="text-sm">Opacidad</Label>
                      <div className="flex gap-4 mt-2">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Mínimo</Label>
                          <Slider
                            value={[settings.watermark.opacity.min]}
                            onValueChange={([value]) => 
                              updateSettings({
                                watermark: {
                                  ...settings.watermark,
                                  opacity: { ...settings.watermark.opacity, min: value }
                                }
                              })
                            }
                            min={0.1}
                            max={1.0}
                            step={0.1}
                            className="mt-1"
                          />
                          <span className="text-xs text-muted-foreground">{settings.watermark.opacity.min.toFixed(1)}</span>
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Máximo</Label>
                          <Slider
                            value={[settings.watermark.opacity.max]}
                            onValueChange={([value]) => 
                              updateSettings({
                                watermark: {
                                  ...settings.watermark,
                                  opacity: { ...settings.watermark.opacity, max: value }
                                }
                              })
                            }
                            min={0.1}
                            max={1.0}
                            step={0.1}
                            className="mt-1"
                          />
                          <span className="text-xs text-muted-foreground">{settings.watermark.opacity.max.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}