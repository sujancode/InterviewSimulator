"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, Play, Square } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { TextToSpeechService } from '@/services/TextToSpeechService';
import { WebSpeechRecognitionService } from '@/services/WebSpeechRecognitionService';
import { VoiceSettings } from '@/components/VoiceSettings';
import { StatusIndicators } from '@/components/StatusIndicators';
import { MessageList } from '../components/MessageList';
import { Message, VoiceSettings as VoiceSettingsType } from '@/types/types';

export function VoiceAgent() {
  const [isActive, setIsActive] = useState(false);
  const recognitionService = useRef(new WebSpeechRecognitionService()).current;
  const { state, startListening, stopListening } = useVoiceRecognition(recognitionService);
  const [tts, setTts] = useState<TextToSpeechService | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettingsType>({
    pitch: 1,
    rate: 1,
    volume: 1,
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTts(new TextToSpeechService());
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (tts) {
      tts.updateSettings(voiceSettings);
    }
  }, [voiceSettings, tts]);

  const toggleListening = useCallback(async () => {
    if (!isActive) {
      try {
        setIsActive(true);
        await startListening();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsActive(false);
      }
    } else {
      setIsActive(false);
      stopListening();
      if (tts) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isActive, startListening, stopListening, tts]);

  const handleUserInput = useCallback(async (transcript: string) => {
    if (!transcript.trim() || !isActive) return;

    setMessages(prev => [...prev, { text: transcript, type: 'user' }]);

    // Simulate AI response (replace with actual AI integration)
    const aiResponse = `I heard you say: ${transcript}`;
    setMessages(prev => [...prev, { text: aiResponse, type: 'agent' }]);

    // Show speaking animation and speak response
    setIsSpeaking(true);
    if (tts) {
      await tts.speak(aiResponse);
    }
    setIsSpeaking(false);

    // Only restart listening if still active
    if (isActive) {
      startListening();
    }
  }, [tts, startListening, isActive]);

  useEffect(() => {
    if (state.transcript && !state.isListening) {
      handleUserInput(state.transcript);
    }
  }, [state.isListening, state.transcript, handleUserInput]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Voice Agent</h1>
            <div className="flex gap-2">
              <button
                onClick={toggleListening}
                className={`p-2 rounded-lg flex items-center gap-2 ${
                  isActive 
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isActive ? (
                  <>
                    <Square className="w-4 h-4" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start
                  </>
                )}
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          <StatusIndicators isListening={state.isListening && isActive} isSpeaking={isSpeaking} />

          {state.error && (
            <div className="text-red-500 text-center mb-4 text-sm">
              {state.error}
            </div>
          )}

          <MessageList messages={messages} messagesEndRef={messagesEndRef} />
        </div>
      </div>

      <VoiceSettings
        settings={voiceSettings}
        onSettingsChange={setVoiceSettings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}