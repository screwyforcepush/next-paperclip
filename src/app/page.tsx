'use client';

import React, { useState } from 'react';
import ChatPanel from '../components/game/ChatPanel';
import { Message } from '../components/game/MessageBubble';

// Temporary mock data for testing
const initialMessages: Message[] = [
  { id: '1', sender: 'System', content: 'Welcome to Universal Paperclips!', type: 'system' },
  { id: '2', sender: 'CEO', content: 'What advice do you have for our next move?', type: 'ceo' },
  { id: '3', sender: 'CTO', content: 'We should consider upgrading our production line.', type: 'cto' },
  { id: '4', sender: 'CFO', content: 'Our current budget allows for a 10% increase in R&D spending.', type: 'cfo' },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: String(messages.length + 1),
      sender: 'User',
      content,
      type: 'user',
    };
    setMessages([...messages, newMessage]);
    
    // Simulate CEO response (this would be replaced with actual AI logic later)
    setTimeout(() => {
      const ceoResponse: Message = {
        id: String(messages.length + 2),
        sender: 'CEO',
        content: 'Thank you for your input. We\'ll consider that in our next steps.',
        type: 'ceo',
      };
      setMessages((prevMessages) => [...prevMessages, ceoResponse]);
    }, 1000);
  };

  return (
    <div className="flex h-full">
      <div className="w-full md:w-1/2 h-full">
        <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
      </div>
      {/* Dashboard will be added here later */}
    </div>
  );
}
