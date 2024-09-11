'use client';

import React from 'react';

export interface Message {
  id: string;
  sender: string;
  content: string;
  type: 'system' | 'user' | 'ceo' | 'cto' | 'cfo' | 'cmo' | 'coo';
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const getBubbleStyle = () => {
    switch (message.type) {
      case 'user':
        return 'bg-blue-500 text-white self-end';
      case 'system':
        return 'bg-gray-200 text-gray-800';
      case 'ceo':
        return 'bg-green-100 border border-green-300 text-green-800';
      case 'cto':
        return 'bg-purple-100 border border-purple-300 text-purple-800';
      case 'cfo':
        return 'bg-yellow-100 border border-yellow-300 text-yellow-800';
      case 'cmo':
        return 'bg-red-100 border border-red-300 text-red-800';
      case 'coo':
        return 'bg-indigo-100 border border-indigo-300 text-indigo-800';
      default:
        return 'bg-white border border-gray-300 text-gray-800';
    }
  };

  return (
    <div className={`max-w-3/4 rounded-lg p-3 ${getBubbleStyle()}`}>
      {message.type !== 'user' && (
        <div className="font-bold mb-1">{message.sender}</div>
      )}
      <div>{message.content}</div>
    </div>
  );
};

export default MessageBubble;
