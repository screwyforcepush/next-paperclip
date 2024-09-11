import { Message } from '../components/game/MessageBubble';

export const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'System',
    content: 'Business cycle 1 begins. Welcome to Universal Paperclips!',
    type: 'system',
  },
  {
    id: '2',
    sender: 'System',
    content: 'Inflection point: The paperclip market is steady, but there\'s room for growth. What strategic move would you advise?',
    type: 'system',
  },
  // User message will be added dynamically
];

export const mockKPIData = [
  { cycle: 1, revenue: 100000, profitMargin: 10, cacClvRatio: 0.8, productionEfficiency: 0.7, marketShare: 5, innovationIndex: 3 },
  { cycle: 2, revenue: 120000, profitMargin: 12, cacClvRatio: 0.75, productionEfficiency: 0.75, marketShare: 5.5, innovationIndex: 3.2 },
  { cycle: 3, revenue: 150000, profitMargin: 15, cacClvRatio: 0.7, productionEfficiency: 0.8, marketShare: 6, innovationIndex: 3.5 },
];

export const mockCompanyData = {
  companyName: "PaperClip Inc.",
  currentCycle: 3,
  sharePrice: [10, 12, 15],
};