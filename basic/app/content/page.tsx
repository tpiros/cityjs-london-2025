'use client';

import { useCompletion } from '@ai-sdk/react';

import ReactMarkdown from 'react-markdown';

export default function Page() {
  const { completion, complete, isLoading, error } = useCompletion({
    api: '/api/content',
    onError: (err) => {
      console.error('Completion error:', err);
    },
  });

  const prompt = 'What is Star Wars?';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-700 via-gray-900 to-black p-8 text-center">
      <main className="flex w-full max-w-2xl flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl mb-6 leading-tight shadow-sm">
          AI Content Generation
        </h1>

        <button
          className="mb-6 inline-block rounded-lg bg-white px-6 py-3 text-base font-semibold text-gray-800 shadow-md transition duration-300 ease-in-out hover:bg-gray-200 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          onClick={() => complete(prompt)}
          disabled={isLoading}
        >
          {isLoading ? 'Generating text...' : `Ask: "${prompt}"`}
        </button>

        {isLoading && <p className="text-gray-400">Loading response...</p>}

        {error && <p className="mt-2 text-red-400">Error: {error.message}</p>}

        {completion && (
          <div className="mt-6 w-full rounded-md border border-gray-700 bg-gray-800 p-6 text-left shadow-inner text-white">
            <h2 className="mb-3 text-xl font-semibold text-gray-200">
              AI Response:
            </h2>

            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{completion}</ReactMarkdown>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
