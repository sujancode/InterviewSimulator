import { useRef, useEffect } from 'react';
import { useVoiceStore } from '../store/voiceStore';

export const MessageList: React.FC = () => {
  const messages = useVoiceStore((state) => state.messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-96 overflow-y-auto rounded-lg p-4 mb-4 bg-black/20">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`mb-2 p-3 rounded-lg max-w-[80%] ${
            message.type === 'user' 
              ? 'bg-blue-500/20 text-white ml-auto backdrop-blur-sm border border-blue-500/20' 
              : 'bg-white/10 text-white backdrop-blur-sm border border-white/20'
          }`}
        >
          <div className="text-sm">
            {message.text}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};