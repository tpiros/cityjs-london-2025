'use client';

import { useChat } from '@ai-sdk/react';
import { Bot, User, Send, CheckCircle, Info } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function Chat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    addToolResult,
    status,
  } = useChat({
    api: '/api/tool',
    maxSteps: 5,

    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'askForConfirmation') {
        return;
      }

      if (toolCall.toolName === 'getLocation') {
        return new Promise((resolve) => {
          if (!navigator.geolocation) {
            return resolve('Geolocation not supported by your browser.');
          }

          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;

              try {
                const res = await fetch(
                  `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}`
                );
                const data = await res.json();

                const city =
                  data.results?.[0]?.components?.city ||
                  data.results?.[0]?.components?.town ||
                  data.results?.[0]?.components?.village ||
                  'Unknown city';

                resolve(city);
              } catch (err) {
                console.error('OpenCage error:', err);
                resolve('Unknown city');
              }
            },
            (error) => {
              console.error('Geolocation error:', error);
              resolve('Unable to get location');
            }
          );
        });
      }
    },
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
  // eslint-disable-next-line
  const renderMessagePart = (part: any, messageId: string, index: number) => {
    const key = `${messageId}-${part.type}-${
      part.toolInvocation?.toolCallId || 'text'
    }`;

    switch (part.type) {
      case 'step-start':
        return index > 0 ? (
          <div key={index} className="text-gray-500">
            <hr className="my-2 border-gray-300" />
          </div>
        ) : null;

      case 'text':
        return (
          <span key={key} className="whitespace-pre-wrap">
            {part.text}
          </span>
        );

      case 'tool-invocation': {
        const { toolInvocation } = part;
        const { toolCallId, toolName, args, state, result } = toolInvocation;

        switch (toolName) {
          case 'askForConfirmation': {
            switch (state) {
              case 'call':
                return (
                  <div
                    key={key}
                    className="my-2 rounded border border-gray-600 bg-gray-700 p-3 shadow-md"
                  >
                    <p className="mb-3 font-medium text-gray-100">
                      {args.message}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          addToolResult({
                            toolCallId,
                            result: 'Yes, confirmed.',
                          })
                        }
                        className="flex-1 rounded bg-white px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm transition duration-150 ease-in-out hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-700"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() =>
                          addToolResult({ toolCallId, result: 'No, denied' })
                        }
                        className="flex-1 rounded border border-gray-500 bg-transparent px-3 py-1 text-xs font-medium text-gray-300 shadow-sm transition duration-150 ease-in-out hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-700"
                      >
                        No
                      </button>
                    </div>
                  </div>
                );
              case 'result':
                return (
                  <div
                    key={key}
                    className="my-1 flex items-center gap-2 rounded bg-gray-700 px-3 py-1 text-xs text-gray-400"
                  >
                    <CheckCircle className="h-3 w-3 text-green-400" />{' '}
                    Confirmation: {result}
                  </div>
                );
              default:
                return null;
            }
          }
          case 'getLocation': {
            switch (state) {
              case 'call':
                return (
                  <div
                    key={key}
                    className="my-1 flex animate-pulse items-center gap-2 rounded bg-gray-700 px-3 py-1 text-xs text-gray-400"
                  >
                    <Info className="h-3 w-3" /> Getting location...
                  </div>
                );
              case 'result':
                return (
                  <div
                    key={key}
                    className="my-1 flex items-center gap-2 rounded bg-gray-700 px-3 py-1 text-xs text-gray-400"
                  >
                    <CheckCircle className="h-3 w-3 text-green-400" /> Location:{' '}
                    {result}
                  </div>
                );
              default:
                return null;
            }
          }

          case 'getWeatherInformation': {
            switch (state) {
              case 'partial-call':
                return (
                  <div key={key} className="my-2">
                    <p className="mb-1 text-xs text-gray-500">
                      Tool Call (Streaming):
                    </p>
                    <pre className="overflow-x-auto rounded border border-gray-600 bg-gray-900 p-2 text-xs text-gray-400 font-mono">
                      {JSON.stringify(toolInvocation, null, 2)}
                    </pre>
                  </div>
                );
              case 'call':
                return (
                  <div
                    key={key}
                    className="my-1 flex animate-pulse items-center gap-2 rounded bg-gray-700 px-3 py-1 text-xs text-gray-400"
                  >
                    <Info className="h-3 w-3" /> Getting weather for {args.city}
                    ...
                  </div>
                );
              case 'result':
                const { temperature, condition } = result || {};
                return (
                  <div
                    key={key}
                    className="my-1 flex flex-col gap-1 rounded bg-gray-700 px-3 py-2 text-xs text-gray-300"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      Weather in {args.city}:
                    </div>
                    <div className="pl-5">Temperature: {temperature}°C</div>
                    <div className="pl-5">Condition: {condition}</div>
                  </div>
                );
              default:
                return null;
            }
          }

          default:
            return (
              <div
                key={key}
                className="my-1 rounded bg-gray-700 p-2 text-xs text-gray-400"
              >
                Tool Call: {toolName} (State: {state})
                {args && (
                  <pre className="mt-1 overflow-x-auto bg-gray-900 p-1 text-xs">
                    {JSON.stringify(args, null, 2)}
                  </pre>
                )}
                {result && <p className="mt-1">Result: {result}</p>}
              </div>
            );
        }
      }

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-gray-700 bg-gray-900/50 p-4 backdrop-blur-sm">
        <h1 className="text-center text-xl font-semibold text-gray-200">
          AI Tool Chat
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
                {message.parts.map((part, index) =>
                  renderMessagePart(part, message.id, index)
                )}
              </div>

              {message.role === 'user' && (
                <div className="order-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white">
                  <User className="h-5 w-5 text-gray-700" />
                </div>
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
            onChange={handleInputChange}
            placeholder="Ask anything or trigger a tool..."
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
