import { Mic, Volume2 } from 'lucide-react';

interface StatusIndicatorsProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export const StatusIndicators: React.FC<StatusIndicatorsProps> = ({
  isListening,
  isSpeaking
}) => (
  <div className="flex items-center justify-center space-x-4 mb-4">
    <div className="flex items-center">
      <Mic className={`w-5 h-5 mr-1 ${isListening ? 'text-red-500' : 'text-gray-400'}`} />
      <div 
        className={`w-2 h-2 rounded-full ${
          isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
        }`} 
      />
    </div>

    <div className="flex items-center">
      <Volume2 className={`w-5 h-5 mr-1 ${isSpeaking ? 'text-blue-500' : 'text-gray-400'}`} />
      <div 
        className={`w-2 h-2 rounded-full ${
          isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
        }`} 
      />
    </div>
  </div>
);
