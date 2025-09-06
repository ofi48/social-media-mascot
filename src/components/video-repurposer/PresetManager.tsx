import React, { useState } from 'react';
import { Save, Download, Upload, Trash2, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { VideoPresetSettings } from '@/types/video-preset';
import { usePresets, PresetData } from '@/hooks/usePresets';
import { toast } from 'sonner';

interface PresetManagerProps {
  currentSettings: VideoPresetSettings;
  onLoadPreset: (settings: VideoPresetSettings) => void;
}

export const PresetManager: React.FC<PresetManagerProps> = ({
  currentSettings,
  onLoadPreset
}) => {
  const { presets, savePreset, loadPreset, deletePreset, exportPresets, importPresets } = usePresets();
  const [presetName, setPresetName] = useState('');
  const [importData, setImportData] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    const success = savePreset(presetName.trim(), currentSettings);
    if (success) {
      toast.success(`Preset "${presetName}" saved successfully`);
      setPresetName('');
      setShowSaveDialog(false);
    } else {
      toast.error('A preset with this name already exists');
    }
  };

  const handleLoadPreset = (presetId: string) => {
    const settings = loadPreset(presetId);
    if (settings) {
      onLoadPreset(settings);
      toast.success('Preset loaded successfully');
    } else {
      toast.error('Failed to load preset');
    }
  };

  const handleDeletePreset = (presetId: string, presetName: string) => {
    deletePreset(presetId);
    toast.success(`Preset "${presetName}" deleted`);
  };

  const handleExportPresets = () => {
    const data = exportPresets();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'video-presets.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    toast.success('Presets exported successfully');
  };

  const handleImportPresets = () => {
    if (!importData.trim()) {
      toast.error('Please paste preset data');
      return;
    }

    const success = importPresets(importData);
    if (success) {
      toast.success('Presets imported successfully');
      setImportData('');
      setShowImportDialog(false);
    } else {
      toast.error('Invalid preset data format');
    }
  };

  const getEnabledEffectsCount = (settings: VideoPresetSettings) => {
    let count = 0;
    Object.entries(settings).forEach(([key, value]) => {
      if (value && typeof value === 'object' && 'enabled' in value && value.enabled) {
        count++;
      }
    });
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Save Current Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Current Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                Current settings have {getEnabledEffectsCount(currentSettings)} enabled effects
              </AlertDescription>
            </Alert>
            
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Save as New Preset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Preset</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="preset-name">Preset Name</Label>
                    <Input
                      id="preset-name"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="Enter preset name..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSavePreset}>
                    Save Preset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Saved Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Presets ({presets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {presets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No saved presets</p>
              <p className="text-sm">Save your current settings to create your first preset</p>
            </div>
          ) : (
            <div className="space-y-3">
              {presets.map((preset) => (
                <div key={preset.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{preset.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {getEnabledEffectsCount(preset.settings)} effects
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(preset.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleLoadPreset(preset.id)}
                    >
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePreset(preset.id, preset.name)}
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
          <CardTitle>Import / Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleExportPresets}>
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
            
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Presets</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="import-data">Preset Data (JSON)</Label>
                    <textarea
                      id="import-data"
                      className="w-full h-32 p-3 border rounded-md text-sm font-mono"
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder="Paste exported preset data here..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleImportPresets}>
                    Import
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};