// app/page.tsx (or your home route file)
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-700 via-gray-900 to-black p-8 text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl mb-4 leading-tight shadow-sm">
          Welcome to CityJS London 🇬🇧
        </h1>

        <p className="text-lg text-gray-300 sm:text-xl mb-8">
          Explore different ways to interact with AI. Choose an option below to
          get started.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/content"
            className="inline-block rounded-lg bg-white px-6 py-3 text-base font-semibold text-gray-800 shadow-md transition duration-300 ease-in-out hover:bg-gray-200 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-900 w-full sm:w-auto"
          >
            Generate Content
          </Link>

          <Link
            href="/chat"
            className="inline-block rounded-lg bg-white px-6 py-3 text-base font-semibold text-gray-800 shadow-md transition duration-300 ease-in-out hover:bg-gray-200 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-900 w-full sm:w-auto"
          >
            Start Chat
          </Link>

          <Link
            href="/structured"
            className="inline-block rounded-lg bg-white px-6 py-3 text-base font-semibold text-gray-800 shadow-md transition duration-300 ease-in-out hover:bg-gray-200 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-900 w-full sm:w-auto"
          >
            Structured Output
          </Link>

          <Link
            href="/tool"
            className="inline-block rounded-lg bg-white px-6 py-3 text-base font-semibold text-gray-800 shadow-md transition duration-300 ease-in-out hover:bg-gray-200 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-900 w-full sm:w-auto"
          >
            Function/Tool Calling
          </Link>
        </div>
      </div>
    </main>
  );
}
