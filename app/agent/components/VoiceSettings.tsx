import { useState, useEffect } from 'react';
import { X, ChevronRight, Volume2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceStore } from '../store/voiceStore';

export const VoiceSettings: React.FC = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const voiceSettings = useVoiceStore((state) => state.voiceSettings);
  const isOpen = useVoiceStore((state) => state.isSettingsOpen);
  const updateVoiceSettings = useVoiceStore((state) => state.updateVoiceSettings);
  const setIsSettingsOpen = useVoiceStore((state) => state.setIsSettingsOpen);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Set default voice if none selected
      if (!voiceSettings.selectedVoice && availableVoices.length > 0) {
        updateVoiceSettings({ selectedVoice: availableVoices[0] });
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [voiceSettings.selectedVoice, updateVoiceSettings]);

  const filteredVoices = voices.filter(voice => 
    voice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voice.lang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSettingsUpdate = (settings: Partial<typeof voiceSettings>) => {
    updateVoiceSettings(settings);
    window.speechSynthesis.cancel(); // Stop any ongoing speech
  };

  const testVoice = (voice: SpeechSynthesisVoice) => {
    const utterance = new SpeechSynthesisUtterance("Hello, this is a test.");
    utterance.voice = voice;
    utterance.pitch = voiceSettings.pitch;
    utterance.rate = voiceSettings.rate;
    utterance.volume = voiceSettings.volume;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div 
      className={cn(
        "fixed inset-y-0 right-0 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Voice Settings</h2>
          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Voice</label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-medium text-sm">{voiceSettings.selectedVoice?.name || 'Default'}</div>
                  <div className="text-xs text-gray-500">{voiceSettings.selectedVoice?.lang || 'System default'}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pitch</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.pitch}
                  onChange={(e) => handleSettingsUpdate({
                    pitch: parseFloat(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="text-sm text-gray-500 mt-1">{voiceSettings.pitch.toFixed(1)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.rate}
                  onChange={(e) => handleSettingsUpdate({
                    rate: parseFloat(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="text-sm text-gray-500 mt-1">{voiceSettings.rate.toFixed(1)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceSettings.volume}
                  onChange={(e) => handleSettingsUpdate({
                    volume: parseFloat(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="text-sm text-gray-500 mt-1">{voiceSettings.volume.toFixed(1)}</div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium">Available Voices</label>
              <input
                type="text"
                placeholder="Search voices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
              
              <div className="space-y-2">
                {filteredVoices.map((voice) => {
                  const isSelected = voiceSettings.selectedVoice?.name === voice.name;
                  return (
                    <div 
                      key={voice.name}
                      className={cn(
                        "p-3 rounded-lg border transition-colors",
                        isSelected ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50 cursor-pointer"
                      )}
                      onClick={() => handleSettingsUpdate({ selectedVoice: voice })}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{voice.name}</div>
                          <div className="text-xs text-gray-500">{voice.lang}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              testVoice(voice);
                            }}
                            className="p-1 hover:bg-gray-200 rounded-full"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          {isSelected && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};