import { useState, useEffect, useCallback } from 'react';
import { VideoPresetSettings } from '@/types/video-preset';

export interface PresetData {
  id: string;
  name: string;
  settings: VideoPresetSettings;
  createdAt: string;
}

interface UsePresetsReturn {
  presets: PresetData[];
  savePreset: (name: string, settings: VideoPresetSettings) => boolean;
  loadPreset: (presetId: string) => VideoPresetSettings | null;
  deletePreset: (presetId: string) => void;
  exportPresets: () => string;
  importPresets: (jsonData: string) => boolean;
}

export const usePresets = (): UsePresetsReturn => {
  const [presets, setPresets] = useState<PresetData[]>([]);

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('videoPresets');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPresets(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Error loading presets:', error);
      setPresets([]);
    }
  }, []);

  // Save presets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('videoPresets', JSON.stringify(presets));
    } catch (error) {
      console.error('Error saving presets:', error);
    }
  }, [presets]);

  const savePreset = useCallback((name: string, settings: VideoPresetSettings): boolean => {
    if (!name.trim()) return false;
    
    // Check if name already exists
    const existingPreset = presets.find(p => p.name === name.trim());
    if (existingPreset) return false;

    const newPreset: PresetData = {
      id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      settings: { ...settings },
      createdAt: new Date().toISOString()
    };

    setPresets(prev => [...prev, newPreset]);
    return true;
  }, [presets]);

  const loadPreset = useCallback((presetId: string): VideoPresetSettings | null => {
    const preset = presets.find(p => p.id === presetId);
    return preset ? { ...preset.settings } : null;
  }, [presets]);

  const deletePreset = useCallback((presetId: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
  }, []);

  const exportPresets = useCallback((): string => {
    return JSON.stringify(presets, null, 2);
  }, [presets]);

  const importPresets = useCallback((jsonData: string): boolean => {
    try {
      const imported = JSON.parse(jsonData);
      if (!Array.isArray(imported)) return false;

      const validPresets = imported.filter(preset => 
        preset && 
        typeof preset.id === 'string' && 
        typeof preset.name === 'string' && 
        preset.settings
      );

      // Merge with existing presets, avoiding duplicates by name
      setPresets(prev => {
        const existingNames = new Set(prev.map(p => p.name));
        const newPresets = validPresets.filter(p => !existingNames.has(p.name));
        return [...prev, ...newPresets];
      });

      return true;
    } catch (error) {
      console.error('Error importing presets:', error);
      return false;
    }
  }, []);

  return {
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    exportPresets,
    importPresets
  };
};