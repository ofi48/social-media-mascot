import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, Download, Trash2, Plus } from "lucide-react";
import { useVideoProcessing } from "./VideoProcessingContext";
import { toast } from "sonner";

export const ManagePresetsTab = () => {
  const { presets, savePreset, loadPreset, deletePreset, parameters } = useVideoProcessing();
  const [newPresetName, setNewPresetName] = useState("");

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast.error("Please enter a preset name");
      return;
    }

    if (presets.some(p => p.name.toLowerCase() === newPresetName.toLowerCase())) {
      toast.error("A preset with this name already exists");
      return;
    }

    savePreset(newPresetName);
    setNewPresetName("");
    toast.success("Preset saved successfully!");
  };

  const handleLoadPreset = (preset: any) => {
    loadPreset(preset);
    toast.success(`Preset "${preset.name}" loaded successfully!`);
  };

  const handleDeletePreset = (id: string, name: string) => {
    deletePreset(id);
    toast.success(`Preset "${name}" deleted successfully!`);
  };

  const getEnabledParametersCount = (params: any) => {
    return Object.values(params).filter(param => 
      typeof param === 'object' && param && 'enabled' in param && param.enabled
    ).length + (params.flipHorizontal ? 1 : 0) + (params.usMetadata ? 1 : 0) + 
    (params.randomPixelSize ? 1 : 0) + (params.watermark?.enabled ? 1 : 0);
  };

  return (
    <div className="space-y-6">
      {/* Save Current Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Current Configuration
          </CardTitle>
          <CardDescription>
            Save your current processing parameters as a preset for quick access later
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter preset name..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
              className="flex-1"
            />
            <Button onClick={handleSavePreset} disabled={!newPresetName.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Save Preset
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Current Configuration:</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {getEnabledParametersCount(parameters)} parameters enabled
              </Badge>
              <Badge variant="secondary">
                {parameters.watermark.enabled ? 'Watermark enabled' : 'No watermark'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Saved Presets
            </span>
            <Badge variant="outline">{presets.length} presets</Badge>
          </CardTitle>
          <CardDescription>
            Load previously saved configurations or delete unused presets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {presets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Save className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No saved presets yet</p>
              <p className="text-sm">Save your first preset above to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {presets.map((preset) => (
                <Card key={preset.id} className="relative">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{preset.name}</CardTitle>
                    <CardDescription className="text-xs">
                      Created {preset.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getEnabledParametersCount(preset.parameters)} enabled
                        </Badge>
                        {preset.parameters.watermark?.enabled && (
                          <Badge variant="secondary" className="text-xs">
                            Watermark
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handleLoadPreset(preset)}
                          className="flex-1"
                        >
                          <Download className="mr-2 h-3 w-3" />
                          Load
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeletePreset(preset.id, preset.name)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preset Export/Import (Future Feature) */}
      <Card>
        <CardHeader>
          <CardTitle>Import/Export Presets</CardTitle>
          <CardDescription>
            Share presets with others or backup your configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" disabled>
              Export All Presets
            </Button>
            <Button variant="outline" disabled>
              Import Presets
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Coming soon: Export presets as JSON files and import from other users
          </p>
        </CardContent>
      </Card>
    </div>
  );
};