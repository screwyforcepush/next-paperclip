'use client';

import React, { useState } from 'react';
import ChatPanel from '../components/game/ChatPanel';
import Dashboard from '../components/dashboard/Dashboard';
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

  // Mock data for Dashboard (replace with real data later)
  const mockKPIData = [
    { cycle: 1, revenue: 100000, profitMargin: 10, cacClvRatio: 0.5, productionEfficiency: 0.8, marketShare: 5, innovationIndex: 3 },
    // ... more data points ...
  ];

  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="w-full md:w-1/2 h-full">
        <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
      </div>
      <div className="w-full md:w-1/2 h-full overflow-auto">
        <Dashboard 
          kpiData={mockKPIData}
          companyName="Universal Paperclips Inc."
          currentCycle={1}
          sharePrice={[100, 102, 105, 103, 107]}
        />
      </div>
    </div>
  );
}
