'use client';

import React from 'react';
import ChatPanel from '../components/game/ChatPanel';
import Dashboard from '../components/dashboard/Dashboard';
import { initialMessages, mockKPIData, mockCompanyData } from '../lib/mockData';

const Home: React.FC = () => {
  const handleSendMessage = (content: string) => {
    console.log('Message sent:', content);
    // Here you would typically update the game state and trigger the next cycle
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-grow flex overflow-hidden">
        <div className="w-1/2 overflow-hidden">
          <ChatPanel initialMessages={initialMessages} onSendMessage={handleSendMessage} />
        </div>
        <div className="w-1/2 overflow-hidden">
          <Dashboard 
            kpiData={mockKPIData}
            companyName={mockCompanyData.companyName}
            currentCycle={mockCompanyData.currentCycle}
            sharePrice={mockCompanyData.sharePrice}
          />
        </div>
      </main>
    </div>
  );
};

export default Home;
