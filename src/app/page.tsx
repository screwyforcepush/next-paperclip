'use client';

import React from 'react';
import GameHeader from '../components/ui/GameHeader';
import ChatPanel from '../components/game/ChatPanel';
import Dashboard from '../components/dashboard/Dashboard';
import { GameProvider } from '../context/GameContext';

const Home: React.FC = () => {
  return (
    <GameProvider>
      <div className="flex flex-col min-h-screen">
        <GameHeader />
        <main className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="w-full md:w-1/2 p-4 overflow-y-auto">
            <ChatPanel />
          </div>
          <div className="w-full md:w-1/2 p-4 overflow-y-auto">
            <Dashboard />
          </div>
        </main>
      </div>
    </GameProvider>
  );
};

export default Home;
