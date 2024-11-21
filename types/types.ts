export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  error: string | null;
}

export interface Message {
  text: string;
  type: 'user' | 'agent';
}

export interface VoiceSettings {
  pitch: number;
  rate: number;
  volume: number;
}
