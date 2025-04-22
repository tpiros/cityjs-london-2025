'use client';

import { useChat } from '@ai-sdk/react';
import { Bot, User, Send } from 'lucide-react';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Page() {
  const { messages, input, setInput, append, status } = useChat({
    api: '/api/chat',
    onError: (err) => {
      console.error('Chat error:', err);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (status === 'ready') {
      inputRef.current?.focus();
    }
  }, [messages, status]);

  const formDisabled = status === 'streaming';

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-gray-700 bg-gray-900/50 p-4 backdrop-blur-sm">
        <h1 className="text-center text-xl font-semibold text-gray-200">
          💸 Expense Insight
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id || `msg-${index}`}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-600">
                  <Bot className="h-5 w-5 text-gray-300" />
                </div>
              )}

              <div
                className={`max-w-prose rounded-b-xl p-3 text-sm shadow-md ${
                  message.role === 'user'
                    ? 'order-1 rounded-tl-xl bg-white text-gray-800'
                    : 'rounded-tr-xl bg-gray-800 text-gray-200'
                }`}
              >
                <div className="prose prose-sm max-w-none marker:text-inherit prose-p:before:content-none prose-p:after:content-none">
                  <ReactMarkdown components={{ p: 'span' }}>
                    {String(message.content)}
                  </ReactMarkdown>
                </div>
              </div>

              {message.role === 'user' && (
                <div className="order-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white">
                  <User className="h-5 w-5 text-gray-700" />
                </div>
              )}
            </div>
          ))}

          {status === 'submitted' && (
            <div className="flex items-start gap-3 justify-start">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-600">
                <Bot className="h-5 w-5 text-gray-300 animate-pulse" />
              </div>
              <div className="max-w-prose rounded-b-xl rounded-tr-xl bg-gray-800 p-3 text-sm shadow-md">
                <div className="flex gap-1 text-gray-400">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce [animation-delay:0.1s]">
                    .
                  </span>
                  <span className="animate-bounce [animation-delay:0.2s]">
                    .
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-gray-700 bg-gray-900/50 p-4 backdrop-blur-sm">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!input.trim() || formDisabled) return;
            await append({ role: 'user', content: input });
            setInput('');
          }}
          className="flex items-center gap-3"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your expenses..."
            className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
            disabled={formDisabled}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-md transition duration-300 ease-in-out hover:bg-gray-200 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={formDisabled || !input.trim()}
          >
            <Send className="mr-2 h-4 w-4" />
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
