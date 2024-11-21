import { useState, useEffect, useCallback } from 'react';
import { IVoiceRecognitionService } from '../services/interfaces/IVoiceRecognitionService';
import { VoiceState } from '../types/types';

export const useVoiceRecognition = (recognitionService: IVoiceRecognitionService) => {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    error: null,
  });

  useEffect(() => {
    recognitionService.onTranscript((transcript) => {
      setState(prev => ({ ...prev, transcript }));
    });

    recognitionService.onError((error) => {
      setState(prev => ({ ...prev, error }));
    });

    recognitionService.onStateChange((isListening) => {
      setState(prev => ({ ...prev, isListening }));
    });
  }, [recognitionService]);

  const startListening = useCallback(async () => {
    await recognitionService.start();
  }, [recognitionService]);

  const stopListening = useCallback(() => {
    recognitionService.stop();
  }, [recognitionService]);

  return { state, startListening, stopListening };
};
