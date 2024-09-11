'use client';

import React, { useState, useEffect } from 'react';
import { simulateBusinessCycle } from '@/lib/utils/api';
import { BaseMessage } from '@langchain/core/messages';

export default function ChatPanel() {
  const [messages, setMessages] = useState<BaseMessage[]>([]);
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');

    try {
      const newMessages = await simulateBusinessCycle(input);
      setMessages(prevMessages => [...prevMessages, ...newMessages.slice(1)]);
    } catch (error) {
      console.error('Error simulating business cycle:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {message.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Type your message..."
        />
      </form>
    </div>
  );
}
