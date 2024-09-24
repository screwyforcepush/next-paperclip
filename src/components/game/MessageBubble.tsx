'use client';

import React from 'react';
import { Message } from '@/types/game';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSimulation = message.role === 'simulation';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-3/4 p-3 rounded-lg ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-700 text-white'
        }`}
      >
        {isSimulation && message.name && (
          <p className="text-xs font-bold mb-1">{message.name}</p>
        )}
        <p className="text-sm">{message.content}</p>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
