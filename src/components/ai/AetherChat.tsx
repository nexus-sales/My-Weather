'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Bot, BrainCircuit, Send, Sparkles, User } from 'lucide-react';
import { askAether, generateSystemPrompt, Message } from '@/services/aiService';
import { WeatherData } from '@/services/weatherService';

interface AetherChatProps {
  weather: WeatherData;
  cityName: string;
}

export default function AetherChat({ weather, cityName }: AetherChatProps) {
  const t = useTranslations('Aether');
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>(() => [
    { role: 'assistant', content: t('greeting', { cityName }) },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt = generateSystemPrompt(weather, cityName, locale);
      const response = await askAether(nextMessages, systemPrompt);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: t('error') }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] md:h-[650px] meteorix-card rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-meteorix-blue/10 rounded-lg border border-meteorix-blue/20">
            <BrainCircuit className="text-meteorix-highlight w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest text-white font-orbitron">Dr. AETHER AI</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-meteorix-green animate-pulse shadow-[0_0_8px_#F2E2C4]" />
              <span className="text-[8px] font-bold tracking-widest text-white/40 uppercase">{t('status')}</span>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
          {[t('tags.synoptic'), t('tags.risks'), t('tags.advice')].map((tag) => (
            <span key={tag} className="text-[7px] font-bold tracking-widest text-white/40 border border-white/10 px-2 py-1 rounded bg-white/5 uppercase">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fadein`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${
              msg.role === 'user'
                ? 'bg-meteorix-blue/20 border-meteorix-blue/40 text-meteorix-highlight'
                : 'bg-white/10 border-white/20 text-white/60'
            }`}
            >
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-meteorix-blue/10 border border-meteorix-blue/20 text-white rounded-tr-none shadow-[0_4px_15px_rgba(0,0,0,0.2)]'
                : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-none shadow-[0_4px_15px_rgba(0,0,0,0.2)]'
            }`}
            >
              {msg.content.split('\n').map((line, lineIndex) => (
                <p key={lineIndex} className={line.trim() === '' ? 'h-2' : 'mb-1'}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 animate-fadein">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border bg-white/10 border-white/20 text-white/60">
              <Bot size={14} className="animate-spin" />
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-meteorix-highlight rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-meteorix-highlight rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-meteorix-highlight rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 border-t border-white/10 bg-white/5"
      >
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-meteorix-blue/60 transition-all pr-12 font-orbitron tracking-widest"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-meteorix-highlight hover:text-white transition-colors disabled:opacity-20"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Sparkles size={10} className="text-meteorix-highlight/60" />
          <span className="text-[7px] tracking-[0.2em] font-bold text-white/40 uppercase">
            {t('powered')}
          </span>
        </div>
      </form>
    </div>
  );
}
