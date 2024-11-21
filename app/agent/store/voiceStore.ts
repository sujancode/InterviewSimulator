"use client";

import { create } from 'zustand';
import { VoiceSettings } from '../services/TextToSpeechService';

export interface Message {
  text: string;
  type: 'user' | 'agent';
}

interface AudioData {
  frequencyData: Float32Array;
  timeData: Float32Array;
  audioLevel: number;
}

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  error: string | null;
  messages: Message[];
  hasStarted: boolean;
  voiceSettings: VoiceSettings;
  isSettingsOpen: boolean;
  audioData: AudioData | null;
}

interface VoiceActions {
  setIsListening: (isListening: boolean) => void;
  setIsSpeaking: (isSpeaking: boolean) => void;
  setTranscript: (transcript: string) => void;
  setError: (error: string | null) => void;
  addMessage: (message: Message) => void;
  setHasStarted: (hasStarted: boolean) => void;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setAudioData: (data: AudioData | null) => void;
  reset: () => void;
}

const initialState: VoiceState = {
  isListening: false,
  isSpeaking: false,
  transcript: '',
  error: null,
  messages: [],
  hasStarted: false,
  voiceSettings: {
    pitch: 1,
    rate: 1,
    volume: 1,
  },
  isSettingsOpen: false,
  audioData: null,
};

export const useVoiceStore = create<VoiceState & VoiceActions>((set) => ({
  ...initialState,

  setIsListening: (isListening) => set({ isListening }),
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  setTranscript: (transcript) => set({ transcript }),
  setError: (error) => set({ error }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  setHasStarted: (hasStarted) => set({ hasStarted }),
  updateVoiceSettings: (settings) => set((state) => ({
    voiceSettings: { ...state.voiceSettings, ...settings },
  })),
  setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  setAudioData: (audioData) => set({ audioData }),
  reset: () => set((state) => ({
    ...initialState,
    voiceSettings: state.voiceSettings,
  })),
}));