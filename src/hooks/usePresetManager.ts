import { useState, useCallback, useEffect } from 'react';
import { VideoPresetSettings, DEFAULT_PRESET } from '@/types/video-preset';
import { safeLog } from '@/utils/videoProcessing';
import { toast } from 'sonner';

interface PresetData {
  id: string;
  name: string;
  settings: VideoPresetSettings;
  createdAt: string;
}

interface UsePresetManagerReturn {
  presets: PresetData[];
  savePreset: (name: string, settings: VideoPresetSettings) => void;
  loadPreset: (presetId: string) => VideoPresetSettings | null;
  deletePreset: (presetId: string) => void;
  exportPresets: () => string;
  importPresets: (jsonData: string) => boolean;
}

const STORAGE_KEY = 'video-repurposer-presets';

export function usePresetManager(): UsePresetManagerReturn {
  const [presets, setPresets] = useState<PresetData[]>([]);

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedPresets = JSON.parse(stored);
        setPresets(parsedPresets);
        safeLog('Loaded presets from localStorage', { count: parsedPresets.length });
      }
    } catch (error) {
      safeLog('Failed to load presets from localStorage', error);
      toast.error('Failed to load saved presets');
    }
  }, []);

  // Save presets to localStorage whenever presets change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch (error) {
      safeLog('Failed to save presets to localStorage', error);
      toast.error('Failed to save presets');
    }
  }, [presets]);

  const savePreset = useCallback((name: string, settings: VideoPresetSettings) => {
    if (!name.trim()) {
      toast.error('Preset name cannot be empty');
      return;
    }

    // Check for duplicate names
    const exists = presets.some(preset => preset.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast.error('A preset with this name already exists');
      return;
    }

    const newPreset: PresetData = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      settings: { ...settings },
      createdAt: new Date().toISOString()
    };

    setPresets(prev => [...prev, newPreset]);
    safeLog('Saved new preset', { name, id: newPreset.id });
    toast.success(`Preset "${name}" saved successfully`);
  }, [presets]);

  const loadPreset = useCallback((presetId: string): VideoPresetSettings | null => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) {
      toast.error('Preset not found');
      return null;
    }

    safeLog('Loaded preset', { name: preset.name, id: presetId });
    toast.success(`Loaded preset "${preset.name}"`);
    return { ...preset.settings };
  }, [presets]);

  const deletePreset = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) {
      toast.error('Preset not found');
      return;
    }

    setPresets(prev => prev.filter(p => p.id !== presetId));
    safeLog('Deleted preset', { name: preset.name, id: presetId });
    toast.success(`Deleted preset "${preset.name}"`);
  }, [presets]);

  const exportPresets = useCallback((): string => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      presets: presets
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    safeLog('Exported presets', { count: presets.length });
    return jsonData;
  }, [presets]);

  const importPresets = useCallback((jsonData: string): boolean => {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.presets || !Array.isArray(importData.presets)) {
        throw new Error('Invalid preset file format');
      }

      const validPresets = importData.presets.filter((preset: any) => 
        preset.id && preset.name && preset.settings && preset.createdAt
      );

      if (validPresets.length === 0) {
        throw new Error('No valid presets found in file');
      }

      // Merge with existing presets, avoiding duplicates by name
      const existingNames = new Set(presets.map(p => p.name.toLowerCase()));
      const newPresets = validPresets.filter((preset: PresetData) => 
        !existingNames.has(preset.name.toLowerCase())
      );

      if (newPresets.length === 0) {
        toast.warning('All presets in the file already exist');
        return false;
      }

      setPresets(prev => [...prev, ...newPresets]);
      safeLog('Imported presets', { 
        total: validPresets.length, 
        new: newPresets.length 
      });
      
      toast.success(`Imported ${newPresets.length} new preset${newPresets.length > 1 ? 's' : ''}`);
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid file format';
      safeLog('Failed to import presets', error);
      toast.error(`Import failed: ${errorMessage}`);
      return false;
    }
  }, [presets]);

  return {
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    exportPresets,
    importPresets
  };
}