'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { starWarsFilmSchema } from '../../schema/starWarsFilmSchema';

export default function Page() {
  const { object, submit, isLoading, error } = useObject({
    api: '/api/structured',
    schema: starWarsFilmSchema,
  });

  const prompt =
    'Display information about the original three Star Wars films.';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="mb-6 text-center text-4xl font-extrabold text-white sm:text-5xl md:text-6xl leading-tight shadow-sm">
          Star Wars Films
        </h1>

        <div className="text-center">
          <button
            onClick={() => submit({ prompt })}
            className="mb-6 inline-block rounded-lg bg-white px-6 py-3 text-base font-semibold text-gray-800 shadow-md transition duration-300 ease-in-out hover:bg-gray-200 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Structured Information'}
          </button>
        </div>

        {isLoading && (
          <p className="mt-4 text-center text-gray-400">
            Loading information...
          </p>
        )}

        {error && (
          <div className="mt-4 rounded-md border border-red-400 bg-red-900/30 p-4 text-center text-red-400">
            <p className="font-semibold">Error generating information:</p>
            <p className="mt-1 text-sm">{error.message}</p>
          </div>
        )}

        {object?.films && (
          <div className="mt-6 w-full space-y-4">
            <h2 className="text-center text-2xl font-semibold text-gray-200">
              Generated Information:
            </h2>
            {object.films?.length === 0 ? (
              <p className="text-center text-gray-400">
                No film information available.
              </p>
            ) : (
              object.films?.map((film, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-md"
                >
                  {film?.title && film?.released && (
                    <p className="mb-1 font-semibold text-gray-200">
                      {film.title}{' '}
                      <span className="text-xs">({film.released})</span>
                    </p>
                  )}
                  {film?.characters && (
                    <p className="text-sm text-gray-300">{film.characters}</p>
                  )}
                  {film?.plot && (
                    <p className="text-sm text-gray-300">{film.plot}</p>
                  )}
                </div>
              ))
            )}
            {object && (
              <div className="mt-8">
                <h3 className="mb-2 text-center text-xl font-semibold text-gray-200">
                  Raw JSON Output:
                </h3>
                <pre className="overflow-x-auto rounded-md border border-gray-700 bg-gray-900 p-4">
                  <code className="text-sm text-gray-300 font-mono whitespace-pre">
                    {JSON.stringify(object, null, 2)}
                  </code>
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
