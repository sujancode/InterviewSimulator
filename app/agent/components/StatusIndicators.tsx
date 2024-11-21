"use client";

import { Mic, Volume2 } from 'lucide-react';
import { useVoiceStore } from '../store/voiceStore';

export const StatusIndicators: React.FC = () => {
  const isListening = useVoiceStore((state) => state.isListening);
  const isSpeaking = useVoiceStore((state) => state.isSpeaking);

  return (
    <div className="flex items-center justify-center space-x-4 mb-4">
      {/* Microphone indicator */}
      {/* <div className="flex items-center">
        <Mic className={`w-5 h-5 mr-1 ${isListening ? 'text-red-400' : 'text-gray-400'}`} />
        <div 
          className={`w-2 h-2 rounded-full ${
            isListening ? 'bg-red-400 animate-pulse' : 'bg-gray-400'
          }`} 
        />
      </div> */}

      {/* Speaker indicator */}
      {/* <div className="flex items-center">
        <Volume2 className={`w-5 h-5 mr-1 ${isSpeaking ? 'text-blue-400' : 'text-gray-400'}`} />
        <div 
          className={`w-2 h-2 rounded-full ${
            isSpeaking ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'
          }`} 
        />
      </div> */}
    </div>
  );
};