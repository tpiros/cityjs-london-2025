import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const embeddingModel = openai.embedding('text-embedding-ada-002');

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (
  userQuery: string
): Promise<
  { content: string; similarity: number; file: string; pageNumber: number }[]
> => {
  const userQueryEmbedded: number[] = await generateEmbedding(userQuery);

  if (!userQueryEmbedded || userQueryEmbedded.length === 0) {
    console.error('Error: Failed to generate embedding for the query.');
    return [];
  }

  try {
    const similarGuides = await prisma.$queryRawUnsafe<
      {
        content: string;
        similarity: number;
        file: string;
        pageNumber: number;
      }[]
    >(
      `
      SELECT
        e."content",
        1 - (e.embedding <#> $1::vector) AS similarity,
        r."file",
        e."pageNumber"
      FROM "Embedding" e
      JOIN "Resource" r ON r.id = e."resourceId"
      WHERE (1 - (e.embedding <#> $1::vector)) > 0.5
      ORDER BY similarity DESC
      LIMIT 4
      `,
      userQueryEmbedded
    );

    return similarGuides;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma Known Request Error:', {
        code: error.code,
        meta: error.meta,
        message: error.message,
      });
    } else {
      console.error(
        'Error executing Prisma raw query for similarity search:',
        error
      );
    }
    return [];
  }
};
