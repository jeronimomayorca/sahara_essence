'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

export default function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola, soy Aurora! tu asesor de Sahara Essence. ¿Qué fragancia buscas hoy?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-close tooltip after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error('Error al conectar con el asistente');

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply || 'Lo siento, no pude procesar tu solicitud.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="chat-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      
      <div className="fixed bottom-10 right-5 z-50">
        <AnimatePresence mode="wait">
          {isOpen ? (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="relative w-[90vw] sm:w-100 md:w-[30rem] max-w-[95vw] h-[82vh] max-h-[700px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Aurora</h3>
                <p className="text-xs opacity-80">Sahara Essence</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-amber-700 transition-colors"
                aria-label="Cerrar chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    'flex',
                    message.isUser ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] p-3 rounded-2xl',
                      message.isUser
                        ? 'bg-amber-600 text-white rounded-br-none'
                        : 'bg-amber-700 dark:bg-gray-800 text-gray-200 dark:text-gray-200 rounded-bl-none'
                    )}
                  >
                    <p className="text-sm break-words whitespace-pre-wrap overflow-x-hidden">{message.content}</p>
                    <p className="text-xs mt-1 opacity-60 text-right">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="w-full p-3 pr-12 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-amber-600 hover:text-amber-700 disabled:opacity-50"
                  aria-label="Enviar mensaje"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <Tooltip open={!hasBeenClicked && showTooltip}>
            <TooltipTrigger asChild>
              <motion.button
                key="chat-fab"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setHasBeenClicked(true);
                  setShowTooltip(false);
                  setIsOpen(true);
                }}
                className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
                aria-label="Abrir chat"
              >
                <MessageSquare size={24} />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/50 text-gray-800 dark:text-gray-100 shadow-xl px-4 py-3 rounded-xl font-medium text-md tracking-wide"
              sideOffset={12}
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"></div>
                <p>¿Qué perfume buscas hoy?</p>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
