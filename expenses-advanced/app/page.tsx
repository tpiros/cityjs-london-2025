'use client';

import {
  explainQuery,
  generateNaturalExplanation,
  generateQuery,
  runGenerateSQLQuery,
} from '@/actions/action';
import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

export default function Page() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  // eslint-disable-next-line
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [explanation, setExplanation] = useState('');
  const [querySections, setQuerySections] = useState<
    { section: string; explanation: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [results, explanation, isLoading]);

  const handleSubmit = async (suggestion?: string) => {
    const question = inputValue || suggestion;
    if (!question) return;
    setIsLoading(true);
    try {
      setCurrentStep('Generating SQL query...');
      const query = await generateQuery(question);
      setSqlQuery(query);
      setCurrentStep('Explaining SQL query...');
      const sections = await explainQuery(question, query);
      setQuerySections(
        Array.isArray(sections.explanations)
          ? sections.explanations
          : [sections.explanations]
      );
      setCurrentStep('Running SQL query...');
      const data = await runGenerateSQLQuery(query);
      setResults(data);
      setColumns(data.length > 0 ? Object.keys(data[0]) : []);

      setCurrentStep('Generating summary...');
      const summary = await generateNaturalExplanation(question, query, data);
      setExplanation(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setCurrentStep(null);
      setIsLoading(false);
    }
  };

  const formDisabled = isLoading;

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-gray-700 bg-gray-900/50 p-4 backdrop-blur-sm">
        <h1 className="text-center text-xl font-semibold text-gray-200">
          💸 Expense Insight - SQL Query
        </h1>
      </header>

      {currentStep && (
        <div className="border-b border-gray-700 bg-gray-900/60 px-4 py-2 text-sm text-gray-100 backdrop-blur-sm">
          <span className="italic">🧠 {currentStep}</span>
        </div>
      )}
      <main className="flex-1 overflow-y-auto">
        {sqlQuery && (
          <div className="border-b border-gray-700 bg-gray-900/60 p-4 backdrop-blur-sm">
            <p className="mb-2 font-semibold text-gray-400">
              Generated SQL Query:
            </p>
            <pre className="overflow-x-auto rounded-md border border-gray-700 bg-gray-800 p-3 font-mono text-sm text-cyan-400">
              {sqlQuery}
            </pre>
          </div>
        )}

        {querySections.length > 0 && (
          <div className="border-b border-gray-700 bg-gray-900/60 p-4 text-sm backdrop-blur-sm">
            <p className="mb-2 font-semibold text-gray-400">SQL Breakdown:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              {querySections.map((sec, idx) => (
                <li key={idx}>
                  <span className="font-mono text-cyan-400">{sec.section}</span>
                  {sec.explanation && <> — {sec.explanation}</>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {results.length > 0 && (
          <div className="p-4">
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2 text-left font-semibold text-gray-300"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-800">
                  {results.map((row, i) => (
                    <tr
                      key={i}
                      className="border-t border-gray-700 hover:bg-gray-700/50"
                    >
                      {columns.map((col) => (
                        <td
                          key={col}
                          className="whitespace-nowrap px-4 py-2 text-gray-300"
                        >
                          {String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {explanation && (
          <div className="border-t border-gray-700 bg-gray-900/60 p-4 text-sm backdrop-blur-sm">
            <p className="mb-1 font-semibold text-gray-400">Explanation:</p>
            <p className="text-gray-300">{explanation}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="border-t border-gray-700 bg-gray-900/50 p-4 backdrop-blur-sm">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!inputValue.trim() || formDisabled) return;
            await handleSubmit();
          }}
          className="flex items-center gap-3"
        >
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything about your expenses..."
            className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
            disabled={formDisabled}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-md transition duration-300 ease-in-out hover:bg-gray-200 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={formDisabled || !inputValue.trim()}
          >
            <Send className="mr-2 h-4 w-4" />
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
