import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TremorProvider } from '@tremor/react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Universal Paperclips Simulation",
  description: "A business simulation game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TremorProvider>
          {children}
        </TremorProvider>
      </body>
    </html>
  );
}
