'use client';

import React from 'react';
import { Message } from '@/types/game';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div className={`message-bubble ${message.sender === 'User' ? 'user' : 'agent'}`}>
      <div className="message-sender">{message.sender}</div>
      <div className="message-content">{message.content}</div>
    </div>
  );
};

export default MessageBubble;
