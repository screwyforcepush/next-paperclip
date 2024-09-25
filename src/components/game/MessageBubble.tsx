'use client';

import React from 'react';
import { Message } from '@/types/game';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSimulation = message.role === 'simulation';

  const getBubbleStyle = () => {
    switch (message.role) {
      case 'user':
        return 'bg-indigo-600';
      case 'simulation':
        return message.name === 'Outcome' ? 'bg-gray-700' : 'bg-purple-800';
      case 'CTO':
        return 'bg-blue-600';
      case 'CFO':
        return 'bg-green-600';
      default:
        return 'bg-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-3/4 p-3 rounded-lg shadow-md text-white ${getBubbleStyle()}`}
      >
        {isSimulation && message.name && (
          <p className="text-xs font-bold mb-1 text-gray-200">{message.name}</p>
        )}
        <ReactMarkdown className="text-sm whitespace-pre-wrap">
          {message.content}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
