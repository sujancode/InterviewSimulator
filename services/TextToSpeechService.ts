import { ISpeechService } from './interfaces/ISpeechService';
import { VoiceSettings } from '../types/types';

export class TextToSpeechService implements ISpeechService {
  private synthesis: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private settings: VoiceSettings = {
    pitch: 1,
    rate: 1,
    volume: 1,
  };

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initVoice();
  }

  private initVoice() {
    if (this.synthesis.getVoices().length > 0) {
      this.setVoice();
    } else {
      this.synthesis.addEventListener('voiceschanged', () => {
        this.setVoice();
      });
    }
  }

  private setVoice() {
    const voices = this.synthesis.getVoices();
    this.voice = voices.find(voice => voice.lang === 'en-US') || voices[0];
  }

  updateSettings(settings: VoiceSettings) {
    this.settings = settings;
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synthesis) {
        console.error('Speech synthesis not supported');
        resolve();
        return;
      }

      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.voice;
      utterance.pitch = this.settings.pitch;
      utterance.rate = this.settings.rate;
      utterance.volume = this.settings.volume;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      this.synthesis.speak(utterance);
    });
  }
}
