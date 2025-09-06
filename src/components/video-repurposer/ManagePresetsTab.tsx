import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Upload, Download, Trash2 } from "lucide-react";
import { useVideoProcessingContext } from "./VideoProcessingProvider";

export function ManagePresetsTab() {
  const [newPresetName, setNewPresetName] = useState("");
  const { settings, updateSettings, presetManager } = useVideoProcessingContext();

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    presetManager.savePreset(newPresetName, settings);
    setNewPresetName("");
  };

  const handleLoadPreset = (presetId: string) => {
    const presetSettings = presetManager.loadPreset(presetId);
    if (presetSettings) {
      updateSettings(presetSettings);
    }
  };

  const getEnabledParametersCount = (presetSettings?: any) => {
    const settingsToCheck = presetSettings || settings;
    let count = 0;
    Object.values(settingsToCheck).forEach((value: any) => {
      if (typeof value === 'object' && value !== null && 'enabled' in value && value.enabled) {
        count++;
      }
    });
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Save Current Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Guardar Configuración Actual</CardTitle>
          <CardDescription>
            Guarda la configuración actual como un preset para uso futuro
            ({getEnabledParametersCount()} parámetros activos)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nombre del preset..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
            />
            <Button onClick={handleSavePreset} disabled={!newPresetName.trim()}>
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Presets Guardados</CardTitle>
          <CardDescription>
            Carga configuraciones previamente guardadas ({presetManager.presets.length} presets)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {presetManager.presets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay presets guardados. Guarda tu primera configuración arriba.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {presetManager.presets.map((preset) => (
                <div key={preset.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{preset.name}</h4>
                      <Badge variant="secondary">
                        {getEnabledParametersCount(preset.settings)} parámetros
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Creado: {new Date(preset.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadPreset(preset.id)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Cargar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => presetManager.deletePreset(preset.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle>Importar/Exportar Presets</CardTitle>
          <CardDescription>
            Exporta tus presets o importa configuraciones desde un archivo JSON
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <Download className="mr-2 h-4 w-4" />
              Exportar Presets
            </Button>
            <Button variant="outline" disabled>
              <Upload className="mr-2 h-4 w-4" />
              Importar Presets
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Funcionalidad próximamente disponible
          </p>
        </CardContent>
      </Card>
    </div>
  );
}