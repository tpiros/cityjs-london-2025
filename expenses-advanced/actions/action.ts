'use server';

import { systemPromt } from '@/system-prompt';
import { openai } from '@ai-sdk/openai';
import { sql } from '@/lib/db';
import { generateObject } from 'ai';
import { z } from 'zod';

export const generateQuery = async (input: string) => {
  'use server';
  try {
    const result = await generateObject({
      model: openai('gpt-4o'),
      system: systemPromt,
      prompt: `Generate the query necessary to retrieve the data that I want: ${input}`,
      schema: z.object({
        query: z.string(),
      }),
    });
    return result.object.query;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to generate query');
  }
};

export const runGenerateSQLQuery = async (query: string) => {
  'use server';
  console.log('now running query.....');
  if (
    !query.trim().toLowerCase().startsWith('select') ||
    query.trim().toLowerCase().includes('drop') ||
    query.trim().toLowerCase().includes('delete') ||
    query.trim().toLowerCase().includes('insert') ||
    query.trim().toLowerCase().includes('update') ||
    query.trim().toLowerCase().includes('alter') ||
    query.trim().toLowerCase().includes('truncate') ||
    query.trim().toLowerCase().includes('create') ||
    query.trim().toLowerCase().includes('grant') ||
    query.trim().toLowerCase().includes('revoke')
  ) {
    throw new Error('Only SELECT queries are allowed');
  }
  // eslint-disable-next-line
  let data: any;
  console.log({ query });
  try {
    data = await sql.query(query);
    // eslint-disable-next-line
  } catch (e: any) {
    console.log('e', e);
    if (e.message.includes('relation does not exist')) {
      console.log(
        'Table does not exist, creating and seeding it with dummy data now...'
      );
      throw Error('Table does not exist');
    } else {
      throw e;
    }
  }

  console.log(data.rows);
  return data.rows;
};

export const explainQuery = async (input: string, sqlQuery: string) => {
  'use server';
  try {
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        explanations: z.array(
          z.object({
            section: z.string(),
            explanation: z.string(),
          })
        ),
      }),
      system: `You are a SQL (postgres) expert. Your job is to explain to me the SQL query you wrote to retrieve the data I asked for. The table schema is as follows:
    model Expense {
  id         String   @id @default(cuid())
  amount     Float
  date       DateTime
  categoryId String
  merchantId String
  createdAt  DateTime @default(now())

  category Category @relation(fields: [categoryId], references: [id])
  merchant Merchant @relation(fields: [merchantId], references: [id])
}

model Category {
  id       String    @id @default(cuid())
  name     String    @unique
  expenses Expense[]
}

model Merchant {
  id       String    @id @default(cuid())
  name     String    @unique
  expenses Expense[]
}
    When you explain you must take a section of the query, and then explain it. Each "section" should be unique. So in a query like: "SELECT * FROM expenses limit 20", the sections could be "SELECT *", "FROM EXPENSES", "LIMIT 20".
    If a section doesnt have any explanation, include it, but leave the explanation empty.

    `,
      prompt: `Explain the SQL query you generated to retrieve the data the I wanted. Assume that I am not an expert in SQL. Break down the query into steps. Be concise.

      User Query:
      ${input}

      Generated SQL Query:
      ${sqlQuery}`,
    });
    return result.object;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to generate query');
  }
};

export const generateNaturalExplanation = async (
  question: string,
  sqlQuery: string,
  // eslint-disable-next-line
  data: any[]
) => {
  const prompt = `You are a helpful assistant. You are going to help me with my expenses. All financial data is in Singapore Dollars (SGD). Kindly note, that today's date is ${new Date().toLocaleDateString()}. I asked this question:\n\n"${question}"\n\nYou wrote this SQL query:\n\n${sqlQuery}\n\nThis is the data it returned:\n${JSON.stringify(
    data,
    null,
    2
  )}\n\nExplain the results to me in plain English. Be concise but informative.`;

  const result = await generateObject({
    model: openai('gpt-4o'),
    prompt,
    schema: z.object({
      explanation: z.string(),
    }),
  });

  return result.object.explanation;
};
