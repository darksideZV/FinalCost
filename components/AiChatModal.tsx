'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, MicOff, Send, X, Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface AiChatModalProps {
  onApplyParams: (params: any) => void;
}

export default function AiChatModal({ onApplyParams }: AiChatModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: 'Здравствуйте! Я цифровой инженер-сметчик НИУ МГСУ. Опишите параметры здания текстом или голосом (например: «Посчитай монолитный ЖК на 22 этажа в ЗАО с паркингом и витражами»), и я внесу их в расчёт.',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Запуск голосового ввода с принудительным запросом прав
  const startRecording = async () => {
    setSpeechError(null);

    // 1. Проверяем поддержку Web Speech API в браузере
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Ваш браузер не поддерживает распознавание речи. Используйте Chrome или Яндекс Браузер.');
      return;
    }

    try {
      // 2. Запрашиваем физический доступ к микрофону
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // 3. Настраиваем распознавание
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ru-RU';

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
          setIsRecording(false);
          handleSend(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        if (event.error === 'network') {
          setSpeechError(
            'Сервер распознавания речи недоступен (ограничение Google Speech в регионе). Включите VPN, используйте Яндекс Браузер или воспользуйтесь быстрыми кнопками ниже.'
          );
        } else if (event.error === 'not-allowed') {
          setSpeechError('Доступ к микрофону заблокирован в браузере. Разрешите доступ в адресной строке.');
        } else if (event.error === 'no-speech') {
          setSpeechError('Речь не обнаружена. Попробуйте сказать громче или ближе к микрофону.');
        } else {
          setSpeechError(`Ошибка: ${event.error}. Воспользуйтесь текстовым вводом.`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsRecording(false);
      setSpeechError('Микрофон заблокирован. Нажмите на значок замка слева от адреса сайта и включите "Микрофон".');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

 const [accumulatedParams, setAccumulatedParams] = useState<any>({});

  const handleSend = async (manualText?: string) => {
    const textToSend = manualText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    setInputMessage('');
    setSpeechError(null);
    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();

      if (res.ok && !data.error) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: data.replyText || 'Параметры обработаны.' },
        ]);

        if (data.isComplete) {
          // Если все данные собраны — применяем полный расчёт
          onApplyParams(data);
          setAccumulatedParams({});
        } else if (data.partialParams) {
          // Если часть параметров распознана — накапливаем и применяем то, что уже известно
          const updated = { ...accumulatedParams, ...data.partialParams };
          setAccumulatedParams(updated);
          onApplyParams(updated);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'Не удалось распознать параметры. Попробуйте уточнить запрос.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Ошибка соединения с сервером.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Кнопка вызова ИИ */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#0F2850] text-white p-4 rounded-full shadow-2xl hover:bg-blue-900 hover:scale-105 transition flex items-center gap-2.5 border border-blue-300/40"
      >
        <Sparkles className="w-5 h-5 text-blue-300 animate-pulse" />
        <span className="text-xs font-bold pr-1 hidden sm:inline">ИИ-Сметчик МГСУ</span>
      </button>

      {/* Окно диалога */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[420px] bg-white rounded-3xl border border-blue-200 shadow-2xl flex flex-col overflow-hidden max-h-[580px] animate-in fade-in slide-in-from-bottom-5">
          {/* Хедер чата */}
          <div className="p-4 bg-[#0F2850] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-200" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">Цифровой инженер НИУ МГСУ</h4>
                <div className="text-[10px] text-blue-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  NLP & Voice Assistant • Онлайн
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Сообщения */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[260px] max-h-[340px] bg-[#F8FAFC] text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#0F2850] text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isRecording && (
              <div className="flex justify-start">
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl rounded-tl-none flex items-center gap-2 animate-pulse">
                  <Mic className="w-4 h-4 text-rose-600" />
                  <span>Слушаю вас... Назовите параметры дома</span>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-700" />
                  <span>Анализирую параметры проекта...</span>
                </div>
              </div>
            )}

            {speechError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{speechError}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Подсказки */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[10px] text-slate-600">
            <button
              type="button"
              onClick={() => handleSend('Башня бизнес-класса в ЗАО, 28 этажей, 22000 м2, витражи и паркинг')}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:text-blue-900 shrink-0"
            >
              🏢 Башня 28 эт. в ЗАО
            </button>
            <button
              type="button"
              onClick={() => handleSend('ЖК комфорт-класс, панельный остов, 16 этажей, площадь 14000 м2, СВАО')}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:text-blue-900 shrink-0"
            >
              🏗️ ЖК Комфорт 16 эт.
            </button>
          </div>

          {/* Строка ввода */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2.5 rounded-xl border transition ${
                isRecording
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse ring-2 ring-rose-300'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-800'
              }`}
              title="Нажмите для голосового ввода"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? 'Слушаю вас...' : 'Опишите здание или нажмите микрофон...'}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 bg-[#0F2850] text-white rounded-xl hover:bg-blue-900 disabled:opacity-50 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}