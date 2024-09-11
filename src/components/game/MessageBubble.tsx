'use client';

import React from 'react';
import { Message } from '@/types/game';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3/4 p-3 rounded-lg ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-700 text-white'
        }`}
      >
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
};

export default MessageBubble;
