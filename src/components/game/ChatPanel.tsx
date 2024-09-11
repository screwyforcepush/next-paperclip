'use client';

import React, { useRef, useEffect, useState } from 'react';
import MessageBubble, { Message } from './MessageBubble';
import BusinessCycleHeader from './BusinessCycleHeader';
import SimulationAccordion from './SimulationAccordion';

interface ChatPanelProps {
  initialMessages: Message[];
  onSendMessage: (content: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ initialMessages, onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [businessCycle, setBusinessCycle] = useState(1);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      
      const newMessages: Message[] = [
        {
          id: Date.now().toString(),
          sender: 'User',
          content: inputValue,
          type: 'user',
        },
        {
          id: (Date.now() + 1).toString(),
          sender: 'System',
          content: 'Simulating business outcomes...',
          type: 'system',
        },
        {
          id: (Date.now() + 2).toString(),
          sender: 'CEO',
          content: `Interesting suggestion about ${inputValue}. Let's discuss this with the team.`,
          type: 'ceo',
        },
        // Simulate C-suite responses
        {
          id: (Date.now() + 3).toString(),
          sender: 'CTO',
          content: `From a technology perspective, ${inputValue} could be implemented by...`,
          type: 'cto',
        },
        {
          id: (Date.now() + 4).toString(),
          sender: 'CFO',
          content: `Financially, ${inputValue} would impact our budget in the following ways...`,
          type: 'cfo',
        },
        {
          id: (Date.now() + 5).toString(),
          sender: 'CMO',
          content: `In terms of marketing, ${inputValue} could affect our brand by...`,
          type: 'cmo',
        },
        {
          id: (Date.now() + 6).toString(),
          sender: 'COO',
          content: `Operationally, we can support ${inputValue} by adjusting our processes to...`,
          type: 'coo',
        },
        {
          id: (Date.now() + 7).toString(),
          sender: 'CEO',
          content: `Thank you all for your input. Based on our discussion, we'll proceed with ${inputValue}, taking into account the points raised.`,
          type: 'ceo',
        },
        {
          id: (Date.now() + 8).toString(),
          sender: 'System',
          content: `Business outcome simulated: The decision to ${inputValue} has been implemented...`,
          type: 'system',
        },
        {
          id: (Date.now() + 9).toString(),
          sender: 'System',
          content: `Business cycle ${businessCycle + 1} begins. New challenges arise...`,
          type: 'system',
        },
        {
          id: (Date.now() + 10).toString(),
          sender: 'System',
          content: `Inflection point: [New market condition or challenge]. What strategic move would you advise?`,
          type: 'system',
        },
      ];

      setMessages(prevMessages => [...prevMessages, ...newMessages]);
      setInputValue('');
      setBusinessCycle(prevCycle => prevCycle + 1);
      inputRef.current?.focus();
    }
  };

  const renderMessages = () => {
    const renderedMessages: JSX.Element[] = [];
    let simulationMessages: Message[] = [];
    let currentCycle = 1;

    messages.forEach((message) => {
      if (message.type === 'system' && message.content.startsWith('Business cycle')) {
        if (simulationMessages.length > 0) {
          renderedMessages.push(
            <SimulationAccordion
              key={`simulation-${currentCycle}`}
              messages={simulationMessages}
              cycleNumber={currentCycle}
            />
          );
          simulationMessages = [];
        }
        renderedMessages.push(<BusinessCycleHeader key={`cycle-${currentCycle}`} cycleNumber={currentCycle} />);
        currentCycle++;
      } else if (message.type === 'system' && message.content.startsWith('Business outcome simulated')) {
        if (simulationMessages.length > 0) {
          renderedMessages.push(
            <SimulationAccordion
              key={`simulation-${currentCycle}`}
              messages={simulationMessages}
              cycleNumber={currentCycle}
            />
          );
          simulationMessages = [];
        }
        renderedMessages.push(<MessageBubble key={message.id} message={message} />);
      } else if (['ceo', 'cto', 'cfo', 'cmo', 'coo'].includes(message.type)) {
        simulationMessages.push(message);
      } else {
        renderedMessages.push(<MessageBubble key={message.id} message={message} />);
      }
    });

    if (simulationMessages.length > 0) {
      renderedMessages.push(
        <SimulationAccordion
          key={`simulation-${currentCycle}`}
          messages={simulationMessages}
          cycleNumber={currentCycle}
        />
      );
    }

    return renderedMessages;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {renderMessages()}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your advice here..."
            className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
