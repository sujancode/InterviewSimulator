import { Message } from '../types/types';

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, messagesEndRef }) => (
  <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50">
    {messages.map((message, index) => (
      <div
        key={index}
        className={`mb-2 p-3 rounded-lg max-w-[80%] ${
          message.type === 'user' 
            ? 'bg-blue-100 ml-auto' 
            : 'bg-white border border-gray-200'
        }`}
      >
        <div className="text-sm">{message.text}</div>
      </div>
    ))}
    <div ref={messagesEndRef} />
  </div>
);
