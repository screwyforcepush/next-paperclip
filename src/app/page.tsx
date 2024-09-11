'use client';

import React from 'react';
import GameHeader from '@/components/ui/GameHeader';
import ChatPanel from '@/components/game/ChatPanel';
import Dashboard from '@/components/dashboard/Dashboard';

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <GameHeader />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 h-full overflow-auto">
          <ChatPanel />
        </div>
        <div className="w-1/2 h-full overflow-auto">
          <Dashboard />
        </div>
      </div>
    </div>
  );
}
