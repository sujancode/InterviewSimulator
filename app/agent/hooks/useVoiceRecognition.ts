"use client";

import { useRef, useCallback, useEffect } from 'react';
import { useVoiceStore } from '../store/voiceStore';

export const useVoiceRecognition = () => {
  const {
    setIsListening,
    setTranscript,
    setError,
    hasStarted,
    setAudioData,
  } = useVoiceStore();

  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout>();
  const audioContextRef = useRef<AudioContext>();
  const analyzerRef = useRef<AnalyserNode>();
  const sourceRef = useRef<MediaStreamAudioSourceNode>();

  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (!analyzerRef.current) {
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 2048;
        analyzerRef.current.smoothingTimeConstant = 0.8;
      }

      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }

      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyzerRef.current);
      
      return stream;
    } catch (error) {
      console.error('Error initializing audio:', error);
      throw error;
    }
  }, []);

  const updateAudioData = useCallback(() => {
    if (!analyzerRef.current) return;

    const frequencyData = new Float32Array(analyzerRef.current.frequencyBinCount);
    const timeData = new Float32Array(analyzerRef.current.frequencyBinCount);
    
    analyzerRef.current.getFloatFrequencyData(frequencyData);
    analyzerRef.current.getFloatTimeDomainData(timeData);
    
    let rms = 0;
    for (let i = 0; i < timeData.length; i++) {
      rms += timeData[i] * timeData[i];
    }
    rms = Math.sqrt(rms / timeData.length);
    const audioLevel = Math.pow(Math.min(1, rms * 4), 0.8);

    setAudioData({
      frequencyData,
      timeData,
      audioLevel,
    });
  }, [setAudioData]);

  const initializeRecognition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setTranscript(finalTranscript);
            
            if (silenceTimeoutRef.current) {
              clearTimeout(silenceTimeoutRef.current);
            }
            silenceTimeoutRef.current = setTimeout(() => {
              if (hasStarted) {
                stopListening();
              }
            }, 2000);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            setError(event.error);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [setIsListening, setTranscript, setError, hasStarted]);

  useEffect(() => {
    initializeRecognition();
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
    };
  }, [initializeRecognition]);

  const startListening = useCallback(async () => {
    try {
      await initializeAudio();
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
        setTranscript('');
        
        // Start updating audio data
        const updateLoop = () => {
          if (sourceRef.current) {
            updateAudioData();
            requestAnimationFrame(updateLoop);
          }
        };
        updateLoop();
      } else {
        setError('Speech recognition not supported in this browser');
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Microphone access denied or not available');
    }
  }, [setIsListening, setError, setTranscript, initializeAudio, updateAudioData]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
  }, [setIsListening]);

  return { startListening, stopListening };
};