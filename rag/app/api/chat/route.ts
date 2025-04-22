import { findRelevantContent } from '@/lib/embed';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages,
    system: `You are a helpful assistant. You must only respond to questions using the knowledge provided from tool calls. If relevant information is returned, use it to answer the user's question as best as you can and provide additional context as well to the user. Always point to the page numbers where this information can be found in which document. If no relevant information is returned, respond: "I find your question, disturbing."`,
    tools: {
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => {
          const results = await findRelevantContent(question);

          if (!results.length) return 'No relevant content found.';

          return `
I found the following relevant information in your knowledge base:\n\n${results
            .map(
              (r) =>
                `- ${r.content.trim()} (similarity: ${r.similarity.toFixed(
                  2
                )})\n  → Document: ${r.file}, Page: ${r.pageNumber}`
            )
            .join('\n')}
`;
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
