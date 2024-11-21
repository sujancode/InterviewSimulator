import { VoiceSettings as VoiceSettingsType } from '../types/types';

interface VoiceSettingsProps {
  settings: VoiceSettingsType;
  onSettingsChange: (settings: VoiceSettingsType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  settings,
  onSettingsChange,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Voice Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pitch</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.pitch}
              onChange={(e) => onSettingsChange({
                ...settings,
                pitch: parseFloat(e.target.value)
              })}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">{settings.pitch.toFixed(1)}</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Speed</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.rate}
              onChange={(e) => onSettingsChange({
                ...settings,
                rate: parseFloat(e.target.value)
              })}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">{settings.rate.toFixed(1)}</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => onSettingsChange({
                ...settings,
                volume: parseFloat(e.target.value)
              })}
              className="w-full"
            />
            <div className="text-sm text-gray-500 mt-1">{settings.volume.toFixed(1)}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};
