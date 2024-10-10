'use client';

import React, { useState } from 'react';
import GameHeader from '@/components/ui/GameHeader';
import ChatPanel from '@/components/game/ChatPanel';
import Dashboard from '@/components/dashboard/Dashboard';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard'>('chat');

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <GameHeader />
      <div className="flex flex-1 overflow-hidden">
        {/* Large screens: side-by-side layout */}
        <div className="hidden md:flex w-full">
          <div className="w-1/2 h-full overflow-auto border-r border-gray-700">
            <ChatPanel />
          </div>
          <div className="w-1/2 h-full overflow-auto">
            <Dashboard />
          </div>
        </div>

        {/* Small screens: tabbed layout */}
        <div className="flex flex-col w-full md:hidden">
          <div className="flex bg-gray-800">
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ease-in-out ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ease-in-out ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {activeTab === 'chat' ? <ChatPanel /> : <Dashboard />}
          </div>
        </div>
      </div>
    </div>
  );
}
