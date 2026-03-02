'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, getPerfumeImageUrl } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import Image from 'next/image';

type Product = {
  id: number;
  name: string;
  brand: string;
  image: string | null;
  reason: string;
};

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  data?: Product[];
};

const ProductCarousel = ({ products, onProductClick }: { products: Product[], onProductClick: () => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 192 : 216; // Adjusted card width + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group/slider w-full mt-3">
      {products.length > 1 && (
        <button 
          onClick={() => scroll('left')}
          className="absolute left-2 md:left-3 top-[45%] -translate-y-1/2 z-20 bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-200 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600 opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-110 active:scale-95"
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      
      <div 
        ref={scrollRef}
        className="flex gap-3 md:gap-4 overflow-x-auto pb-4 w-full max-w-full px-2 md:px-4 snap-x no-scrollbar scroll-smooth relative"
      >
        {products.map((product) => (
          <Link 
            key={product.id} 
            href={`/catalog/${product.id}`}
            onClick={onProductClick}
            className="min-w-[180px] max-w-[180px] md:min-w-[200px] md:max-w-[200px] bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 snap-center hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer"
          >
            <div className="relative h-32 md:h-36 w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
                {product.image ? (
                     <Image 
                        src={getPerfumeImageUrl(product.image)} 
                        alt={product.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                        sizes="(max-width: 768px) 180px, 200px" 
                     />
                ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs p-4 text-center">Imagen no disponible</div>
                )}
            </div>
            <div className="p-3 md:p-4 flex-1 flex flex-col">
                <div className="text-[10px] md:text-xs text-amber-600 dark:text-amber-500 font-semibold mb-1 uppercase tracking-wider">{product.brand}</div>
                <div className="font-bold text-sm md:text-base text-gray-900 dark:text-white truncate" title={product.name}>{product.name}</div>
                <div className="text-xs mt-2 text-gray-600 dark:text-gray-400 bg-amber-50/50 dark:bg-amber-900/10 p-2.5 rounded-xl leading-relaxed border border-amber-100/50 dark:border-amber-900/20 line-clamp-3">
                  ✨ {product.reason}
                </div>
            </div>
          </Link>
        ))}
      </div>

      {products.length > 1 && (
        <button 
          onClick={() => scroll('right')}
          className="absolute right-2 md:right-3 top-[45%] -translate-y-1/2 z-20 bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-200 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600 opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-110 active:scale-95"
          aria-label="Desplazar a la derecha"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};

export default function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcomeMessages = [
      "Bienvenid@ a Sahara Essence. 🌹 Soy Aurora, tu experta en alta perfumería. Estoy aquí para encontrar ese aroma sublime que despierte tus sentidos. Cuéntame... ¿qué deseas transmitir hoy?",
      "Hola... Soy Aurora. ✨ El perfume es el accesorio invisible más poderoso. ¿Buscas algo para seducir, para empoderarte o simplemente para disfrutar?",
      "Un placer saludarte. Soy Aurora. 💎 La elegancia comienza con una buena fragancia. Cuéntame, ¿qué momento especial deseas eternizar con un aroma?",
      "Bienvenid@. Soy Aurora. 🌹 Dicen que el olfato es el sentido de la memoria. ¿Qué recuerdo inolvidable quieres crear hoy?",
      "Hola... Soy Aurora. 🌹 ¿Sabías que un perfume es la firma más íntima? Permíteme ayudarte a encontrar esa esencia que hable por ti sin decir una palabra.",
      "Bienvenid@. ✨ Soy Aurora. Hoy es un buen día para descubrir un aroma que te haga sentir inolvidable. ¿Comenzamos este viaje sensorial?",
      "Un placer recibirte. Soy Aurora. 💎 Busco fragancias con alma para personas con carácter. ¿Qué historia quieres que cuente tu perfume hoy?",
      "Hola, soy Aurora. 🌹 La seducción es un arte, y tu perfume es tu mejor aliado. ¿Buscas algo sutil y misterioso, o intenso y magnético?",
      "Bienvenid@ a mi rincón olfativo. Soy Aurora. ✨ Hay un perfume esperando ser tu secreto mejor guardado. ¿Te animas a descubrirlo conmigo?",
      "Hola... Soy Aurora. 💎 Dicen que la elegancia es la única belleza que no se marchita. Encontremos esa fragancia que realce tu luz propia."
    ];

    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

    setMessages([
      {
        id: '1',
        content: randomMessage,
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Auto-close tooltip after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Lock body scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare messages for API (remove generic types/timestamp for payload)
      const payloadMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      if (!response.ok) throw new Error('Error al conectar con el asistente');

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content || 'Lo siento, no pude procesar tu solicitud.',
        role: 'assistant',
        timestamp: new Date(),
        data: data.data // Products
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.',
        role: 'assistant',
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
      
      <div className={cn("fixed z-50 transition-all duration-300", isOpen ? "bottom-4 right-4 md:bottom-10 md:right-10 flex flex-col justify-end" : "bottom-6 right-4 md:bottom-10 md:right-10")}>
        <AnimatePresence mode="wait">
          {isOpen ? (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="relative w-[calc(100vw-2rem)] sm:w-[28rem] md:w-[32rem] lg:w-[36rem] h-[88vh] sm:h-[80vh] max-h-[850px] bg-white dark:bg-gray-900 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col border border-gray-200/60 dark:border-gray-700"
          >
            {/* Header */}
            <div className="bg-amber-600 p-4 text-white flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-full">
                    <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm md:text-base">Aurora</h3>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className=" rounded-full hover:bg-white/20 transition-colors"
                aria-label="Cerrar chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-2 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
              {messages.map((message) => (
                <div key={message.id} className={cn('flex flex-col gap-2', message.role === 'user' ? 'items-end' : 'items-start')}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      'max-w-[85%] p-3.5 rounded-2xl shadow-sm relative',
                      message.role === 'user'
                        ? 'bg-amber-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-700'
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className={cn("text-[10px] mt-1 text-right block", message.role === 'user' ? "text-white/60" : "text-gray-400")}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </motion.div>

                  {/* Product Recommendation Cards */}
                  {message.data && message.data.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full max-w-full"
                      >
                         <ProductCarousel products={message.data} onProductClick={() => setIsOpen(false)} />
                      </motion.div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex space-x-1.5 items-center">
                      <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-xs text-gray-400 ml-2 font-medium">Pensando...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 p-3 pr-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium placeholder:font-normal"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:hover:bg-amber-600 transition-colors shadow-sm active:scale-95"
                  aria-label="Enviar mensaje"
                >
                  <Send size={18} />
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
                className="bg-amber-600 text-white p-3.5 md:p-4 rounded-full shadow-xl hover:shadow-2xl transition-all z-50 ring-4 ring-amber-100/50 dark:ring-amber-900/20"
                aria-label="Abrir chat"
              >
                <div className="relative">
                    <MessageSquare className="w-5 h-5" strokeWidth={2.5} />
                    {!hasBeenClicked && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                </div>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/50 text-gray-800 dark:text-gray-100 shadow-xl px-4 py-3 rounded-xl font-medium text-md tracking-wide"
              sideOffset={16}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
