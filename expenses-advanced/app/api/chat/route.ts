import { ToolInvocation, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getExpenses, getLatestExpense } from '@/tools/expenses';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: `You are a helpful assistant. You are going to help me with my expenses. Kindly note, that today's date is ${new Date().toLocaleDateString()}.`,
    messages,
    tools: {
      getExpenses,
      getLatestExpense,
    },
    maxSteps: 2,
    onFinish: async () => {
      messages.push();
    },
  });

  return result.toDataStreamResponse();
}
