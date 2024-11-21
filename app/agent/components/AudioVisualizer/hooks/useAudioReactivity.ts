"use client";

import { useEffect, useRef } from 'react';
import { useVoiceStore } from '../../../store/voiceStore';
import { AudioAnalyzer } from '../../../hooks/useAudioAnalyzer';

export const useAudioReactivity = () => {
  const { isListening, isSpeaking, setAudioData } = useVoiceStore();
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!analyzerRef.current) {
      analyzerRef.current = new AudioAnalyzer();
    }

    const updateAudioData = () => {
      if (analyzerRef.current && (isListening || isSpeaking)) {
        analyzerRef.current.resume();
        const audioData = analyzerRef.current.getAudioData();
        setAudioData(audioData);
      } else {
        setAudioData(null);
      }
      
      frameRef.current = requestAnimationFrame(updateAudioData);
    };

    const setupAudio = async () => {
      if (isListening && analyzerRef.current) {
        await analyzerRef.current.connectMicrophone();
      }
    };

    setupAudio();
    updateAudioData();

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (analyzerRef.current) {
        analyzerRef.current.disconnectMicrophone();
      }
    };
  }, [isListening, isSpeaking, setAudioData]);

  return useVoiceStore(state => ({
    audioData: state.audioData,
    isListening: state.isListening,
    isSpeaking: state.isSpeaking,
  }));
};