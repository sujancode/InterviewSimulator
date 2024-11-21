"use client";

import React, { useEffect, useCallback } from 'react';
import { Settings, Play, Square } from 'lucide-react';
import { toast } from 'sonner';
import { TextToSpeechService } from './services/TextToSpeechService';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { VoiceSettings } from './components/VoiceSettings';
import { MessageList } from './components/MessageList';
import { StatusIndicators } from './components/StatusIndicators';
import { AudioVisualizer } from './components/AudioVisualizer';
import { useVoiceStore } from './store/voiceStore';
import { AzureOpenAIService } from './services/AzureOpenAIService';

export default function VoiceAgent() {
  const {
    hasStarted,
    setHasStarted,
    addMessage,
    setIsSpeaking,
    setIsSettingsOpen,
    voiceSettings,
    error,
    transcript,
    isListening,
    reset,
  } = useVoiceStore();

  const { startListening, stopListening } = useVoiceRecognition();
  const [tts, setTts] = React.useState<TextToSpeechService | null>(null);
  const [aiService] = React.useState(new AzureOpenAIService());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ttsService = new TextToSpeechService();
      setTts(ttsService);
    }
  }, []);

  useEffect(() => {
    if (transcript && !isListening) {
      handleUserInput(transcript);
    }
  }, [isListening, transcript]);

  useEffect(() => {
    if (tts) {
      tts.updateSettings(voiceSettings);
      if (hasStarted) {
        toast.success('Voice settings updated', {
          description: `Voice: ${voiceSettings.selectedVoice?.name || 'Default'}`,
        });
      }
    }
  }, [voiceSettings, tts, hasStarted]);

  const handleStart = useCallback(() => {
    setHasStarted(true);
    startListening();
    addMessage({ 
      text: "Voice interaction started. How can I help you with your interview preparation?", 
      type: 'agent' 
    });
  }, [startListening, setHasStarted, addMessage]);

  const handleStop = useCallback(() => {
    stopListening();
    if (tts) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    reset();
  }, [stopListening, setIsSpeaking, reset, tts]);

  const handleUserInput = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;

    addMessage({ text: transcript, type: 'user' });

    setIsSpeaking(true);
    const aiResponse = await aiService.getResponse(transcript);
    addMessage({ text: aiResponse, type: 'agent' });

    if (tts) {
      await tts.speak(aiResponse);
    }
    setIsSpeaking(false);

    if (hasStarted) {
      startListening();
    }
  }, [tts, startListening, addMessage, setIsSpeaking, hasStarted, aiService]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">Interview Assistant</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={hasStarted ? handleStop : handleStart}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  hasStarted 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {hasStarted ? (
                  <>
                    <Square className="w-4 h-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start
                  </>
                )}
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full hover:bg-white/10 text-white"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center mb-6">
            <AudioVisualizer />
            <StatusIndicators />
          </div>

          {error && (
            <div className="text-red-400 text-center mb-4 text-sm">
              {error}
            </div>
          )}

          <MessageList />
        </div>
      </div>

      <VoiceSettings />
    </div>
  );
}