import { VoiceSettings } from '../../types/types';

export interface ISpeechService {
  speak(text: string): Promise<void>;
  updateSettings(settings: VoiceSettings): void;
}
