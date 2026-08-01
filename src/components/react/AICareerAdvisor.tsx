import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Send, X, User, RefreshCw, ChevronRight, Zap, Compass, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { parse } from 'marked';

interface AICareerAdvisorProps {
  enabled?: boolean;
  pageContext?: Record<string, any> | null;
}

const CHAT_STORAGE_KEY = 'huongnghiep_ai_chat_messages_v1';
const CHAT_OPEN_KEY = 'huongnghiep_ai_chat_open_v1';

function renderMarkdown(content: string) {
  if (!content) return { __html: '' };
  try {
    const rawHtml = parse(content, { breaks: true, gfm: true }) as string;
    return { __html: rawHtml };
  } catch {
    return { __html: content };
  }
}

export default function AICareerAdvisor({
  enabled = true,
  pageContext = null,
}: AICareerAdvisorProps) {
  if (!enabled) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [inputVal, setInputVal] = useState('');

  // Extract client page context if not explicitly passed
  const activeContext = pageContext || (typeof window !== 'undefined' ? {
    url: window.location.href,
    title: document.title,
    path: window.location.pathname,
  } : null);

  const contextTitle = activeContext?.name || activeContext?.title || activeContext?.shortName || '';

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        pageContext: activeContext,
      },
    }),
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: contextTitle
              ? `Xin chào! Tôi là **Trợ Lý AI HướngNghiệp VN** 🤖.\n\n📌 Bạn đang xem: **${contextTitle}**. Bạn có câu hỏi nào về các ngành đào tạo, điểm chuẩn, khối thi hay học phí của đơn vị này?`
              : 'Xin chào! Tôi là **Trợ Lý AI HướngNghiệp VN** 🤖. Bạn cần tư vấn về chọn ngành, chọn trường, khối thi hay mức lương công việc nào?',
          },
        ],
      },
    ],
  });

  // Client-only hydration effect: Restore localStorage AFTER initial render to prevent SSR hydration mismatch
  useEffect(() => {
    setIsMounted(true);

    try {
      const savedOpen = localStorage.getItem(CHAT_OPEN_KEY) === 'true';
      if (savedOpen) {
        setIsOpen(true);
      }

      const savedMsgs = localStorage.getItem(CHAT_STORAGE_KEY);
      if (savedMsgs) {
        const parsed = JSON.parse(savedMsgs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load saved chat state:', e);
    }
  }, []);

  // Track context changes across page navigations
  const prevContextTitleRef = useRef<string>(contextTitle);

  useEffect(() => {
    if (!contextTitle || !isMounted) return;

    if (prevContextTitleRef.current !== contextTitle) {
      const oldTitle = prevContextTitleRef.current;
      prevContextTitleRef.current = contextTitle;

      // If user hasn't sent any user messages yet (only initial welcome message exists)
      const userMessageCount = messages.filter(m => (m.role as string) === 'user').length;
      if (userMessageCount === 0) {
        setMessages([
          {
            id: 'welcome-' + Date.now(),
            role: 'assistant',
            parts: [
              {
                type: 'text',
                text: `Xin chào! Tôi là **Trợ Lý AI HướngNghiệp VN** 🤖.\n\n📌 Bạn đang xem: **${contextTitle}**. Bạn có câu hỏi nào về các ngành đào tạo, điểm chuẩn, khối thi hay học phí của đơn vị này?`,
              },
            ],
          },
        ]);
      } else if (oldTitle) {
        // User has an ongoing chat session, insert a page transition badge into history
        setMessages(prev => [
          ...prev,
          {
            id: 'ctx-change-' + Date.now(),
            role: 'assistant',
            parts: [
              {
                type: 'text',
                text: `📍 *Bạn vừa chuyển sang trang:* **${contextTitle}**. Tôi đã cập nhật thông tin ngữ cảnh mới!`,
              },
            ],
          },
        ]);
      }
    }
  }, [contextTitle, messages, isMounted]);

  // Persist conversation to localStorage AFTER mount
  useEffect(() => {
    if (!isMounted) return;
    if (messages && messages.length > 0 && typeof window !== 'undefined') {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to persist chat messages:', e);
      }
    }
  }, [messages, isMounted]);

  // Persist open/close state to localStorage AFTER mount
  useEffect(() => {
    if (!isMounted) return;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CHAT_OPEN_KEY, String(isOpen));
      } catch {}
    }
  }, [isOpen, isMounted]);

  const handleReset = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(CHAT_STORAGE_KEY);
      } catch {}
    }
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: contextTitle
              ? `Đã xóa lịch sử! Bạn muốn hỏi thông tin gì về **${contextTitle}**?`
              : 'Đã xóa lịch sử! Bạn muốn hỏi gì về tuyển sinh và hướng nghiệp?',
          },
        ],
      },
    ]);
  };

  const dynamicSuggestions = contextTitle
    ? [
        `🏛️ Đây là trường gì & mã trường là gì?`,
        `📊 Các ngành học & học phí ${contextTitle}?`,
        `🎯 Điểm chuẩn & khối thi xét tuyển ${contextTitle}?`,
        `💻 Lộ trình cơ hội việc làm sau tốt nghiệp?`,
      ]
    : [
        '🎯 Thi khối A01 24 điểm nên chọn ngành & trường nào?',
        '💻 Mức lương ngành CNTT & Bán dẫn ở Việt Nam?',
        '🏛️ Mã trường & điểm chuẩn Đại Học Hồng Đức?',
        '⚖️ So sánh ngành Luật Kinh Tế và Marketing Digital',
      ];

  const isLoading = status === 'submitted' || status === 'streaming';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, status, isMaximized]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isLoading) return;

    if (!textToSend) setInputVal('');
    await sendMessage({ text });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 group"
          aria-label="Mở Trợ Lý AI Hướng Nghiệp"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <span className="font-bold text-sm tracking-wide hidden sm:inline">
            {contextTitle ? `Hỏi AI về ${contextTitle.slice(0, 16)}...` : 'Tư Vấn Hướng Nghiệp AI'}
          </span>
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        </button>
      )}

      {/* Chat Window Modal / Slide-over / Full Screen */}
      {isOpen && (
        <div
          className={
            isMaximized
              ? "fixed inset-2 sm:inset-6 z-50 w-auto h-auto bg-slate-900/98 backdrop-blur-2xl border border-indigo-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              : "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[440px] h-[620px] max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
          }
        >
          
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                    Tư Vấn Hướng Nghiệp AI
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Xóa lịch sử chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title={isMaximized ? "Thu nhỏ cửa sổ" : "Phóng to toàn màn hình"}
                >
                  {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Đóng chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Context Badge Banner */}
            {contextTitle && (
              <div className="mt-1 px-2.5 py-1 bg-indigo-950/80 border border-indigo-500/30 rounded-lg flex items-center gap-1.5 text-[11px] text-indigo-200">
                <Compass className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 animate-spin-slow" />
                <span className="truncate">Trang hiện tại: <strong className="text-white font-semibold">{contextTitle}</strong></span>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
            {messages.map((msg, idx) => {
              const textContent = (msg as any).parts
                ? (msg as any).parts.map((p: any) => p.type === 'text' ? p.text : '').join('')
                : (msg as any).content || '';

              const isUser = (msg.role as string) === 'user';
              const isAssistant = (msg.role as string) === 'assistant';

              // Skip messages with no text content (tool-call-only messages)
              if (!textContent && !isLoading) return null;

              return (
                <div
                  key={msg.id || idx}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-indigo-300" />
                    </div>
                  )}
                  <div
                    className={`max-w-[84%] px-3.5 py-2.5 rounded-2xl ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-none shadow-md'
                        : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {textContent ? (
                      <div
                        className="text-xs sm:text-sm leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-1 [&_strong]:text-indigo-300 [&_strong]:font-semibold [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-2 [&_h1]:mb-1 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-indigo-200 [&_h3]:mt-2 [&_h3]:mb-1 [&_code]:bg-slate-900 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-amber-300 [&_code]:text-[11px] [&_blockquote]:border-l-2 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-2.5 [&_blockquote]:italic [&_blockquote]:text-slate-300"
                        dangerouslySetInnerHTML={renderMarkdown(textContent)}
                      />
                    ) : (
                      isLoading && idx === messages.length - 1 ? (
                        <span className="flex items-center gap-1.5 text-indigo-300">
                          <Zap className="w-3.5 h-3.5 animate-spin" />
                          Đang phân tích & tra cứu dữ liệu...
                        </span>
                      ) : null
                    )}
                  </div>
                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Gợi ý cho trang này:
              </p>
              <div className="flex flex-col gap-1.5">
                {dynamicSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sug)}
                    className="text-left text-[11px] text-slate-300 hover:text-indigo-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate">{sug}</span>
                    <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder={contextTitle ? `Hỏi AI về ${contextTitle.slice(0, 20)}...` : 'Hỏi về chọn ngành, khối thi, điểm chuẩn...'}
                className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="p-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
