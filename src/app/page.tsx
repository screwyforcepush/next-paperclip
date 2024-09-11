import GameHeader from '@/components/ui/GameHeader'
import ChatPanel from '@/components/game/ChatPanel'
import Dashboard from '@/components/dashboard/Dashboard'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <GameHeader />
      <div className="flex w-full space-x-4">
        <ChatPanel />
        <Dashboard />
      </div>
    </main>
  )
}
