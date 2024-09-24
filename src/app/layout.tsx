import type { Metadata } from "next";
import "./globals.css";
import { GameStateProvider } from '@/contexts/GameStateContext';

export const metadata: Metadata = {
  title: "Universal Paperclips Simulation",
  description: "A business simulation game",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GameStateProvider>
          {children}
        </GameStateProvider>
      </body>
    </html>
  );
}
