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
    <div className="flex flex-col h-[500px] md:h-[650px] bg-meteorix-card border border-meteorix-border rounded-3xl overflow-hidden backdrop-blur-2xl">
      <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-meteorix-blue/10 rounded-lg">
            <BrainCircuit className="text-meteorix-blue w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest text-white/80 uppercase font-orbitron">Dr. AETHER AI</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-meteorix-green animate-pulse" />
              <span className="text-[8px] font-bold tracking-widest text-white/30 uppercase">{t('status')}</span>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
          {[t('tags.synoptic'), t('tags.risks'), t('tags.advice')].map((tag) => (
            <span key={tag} className="text-[7px] font-bold tracking-widest text-white/20 border border-white/5 px-2 py-1 rounded bg-white/5">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/5"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fadein`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${
              msg.role === 'user'
                ? 'bg-meteorix-blue/20 border-meteorix-blue/30 text-meteorix-blue'
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
            >
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-meteorix-blue/5 border border-meteorix-blue/10 text-white/80 rounded-tr-none'
                : 'bg-white/5 border border-white/5 text-white/70 rounded-tl-none'
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
            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border bg-white/5 border-white/10 text-white/40">
              <Bot size={14} className="animate-spin" />
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-meteorix-blue rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-meteorix-blue rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 h-1 bg-meteorix-blue rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 border-t border-white/5 bg-white/5"
      >
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full bg-meteorix-bg/50 border border-meteorix-border rounded-xl px-4 py-3 text-xs text-white/80 placeholder:text-white/20 focus:outline-none focus:border-meteorix-blue/40 transition-all pr-12 font-orbitron tracking-widest"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-meteorix-blue hover:text-white transition-colors disabled:opacity-20"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Sparkles size={10} className="text-meteorix-blue" />
          <span className="text-[7px] tracking-[0.2em] font-bold text-white/20 uppercase">
            {t('powered')}
          </span>
        </div>
      </form>
    </div>
  );
}
