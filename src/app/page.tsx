'use client';

import React, { useEffect, useState } from 'react';
import ChatPanel from '../components/game/ChatPanel';
import Dashboard from '../components/dashboard/Dashboard';
import { initialMessages, mockKPIData, mockCompanyData } from '../lib/mockData';
import { getClientSideEnv } from '@/lib/env';

const Home: React.FC = () => {
  const [serverEnv, setServerEnv] = useState<{ OPENAI_API_KEY_SET: boolean, API_BASE_URL_SET: boolean } | null>(null);
  const clientEnv = getClientSideEnv();

  const handleSendMessage = (content: string) => {
    console.log('Message sent:', content);
    // Here you would typically update the game state and trigger the next cycle
  };

  useEffect(() => {
    console.log('Client-side API_BASE_URL:', clientEnv.API_BASE_URL);
    
    fetch('/api/check-env')
      .then(res => res.json())
      .then(data => {
        console.log('Server-side environment check:', data);
        setServerEnv(data);
      });
  }, []);

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
