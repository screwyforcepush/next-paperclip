import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GameHeader from '../components/ui/GameHeader';
import { GameProvider } from '../context/GameContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Universal Paperclips Simulation",
  description: "A business simulation game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col h-full`}>
        <GameProvider>
          <GameHeader />
          <div className="flex-grow overflow-hidden">
            {children}
          </div>
        </GameProvider>
      </body>
    </html>
  );
}
