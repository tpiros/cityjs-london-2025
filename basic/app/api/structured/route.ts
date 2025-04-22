import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { starWarsFilmSchema } from '../../../schema/starWarsFilmSchema';

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();
  const result = streamObject({
    model: openai('gpt-4-turbo'),
    schema: starWarsFilmSchema,
    prompt,
  });

  return result.toTextStreamResponse();
}
