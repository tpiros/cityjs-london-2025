'use client';

import { useChat } from '@ai-sdk/react';
import { Bot, User, Send } from 'lucide-react';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Page() {
  const { messages, input, setInput, handleSubmit, status } = useChat({
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

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-gray-700 bg-gray-900/50 p-4 backdrop-blur-sm">
        <h1 className="text-center text-xl font-semibold text-gray-200">
          AI Chat
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                    <Bot className="h-5 w-5 text-gray-300" />
                  </div>
                  <div className="max-w-prose rounded-b-xl rounded-tr-xl bg-gray-800 p-3 text-sm shadow-md">
                    <div className="prose prose-sm prose-invert max-w-none text-gray-200">
                      <ReactMarkdown>{String(message.content)}</ReactMarkdown>
                    </div>
                  </div>
                </>
              )}

              {message.role === 'user' && (
                <>
                  <div className="max-w-prose rounded-b-xl rounded-tl-xl bg-white p-3 text-sm shadow-md">
                    <div className="prose prose-sm max-w-none text-gray-800">
                      <ReactMarkdown>{String(message.content)}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    <User className="h-5 w-5 text-gray-700" />
                  </div>
                </>
              )}
            </div>
          ))}

          {status === 'streaming' &&
            messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-start gap-3 justify-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
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
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
            disabled={status === 'streaming'}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-md transition duration-300 ease-in-out hover:bg-gray-200 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={status === 'streaming' || !input.trim()}
          >
            <Send className="mr-2 h-4 w-4" />
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
