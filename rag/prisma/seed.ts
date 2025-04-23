import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import prisma from '../lib/prisma';
import fs from 'fs/promises';
import pdf from 'pdf-parse';
import crypto from 'node:crypto';
import { TextContent } from 'pdfjs-dist/types/src/display/api';

import { join } from 'node:path';

const embeddingModel = openai.embedding('text-embedding-ada-002');
const file = join(__dirname, '..', 'pdf', 'comprehensive.pdf');

const generateChunks = (
  text: string,
  chunkSize = 800,
  overlap = 200
): string[] => {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  return chunks;
};

export async function embedPdfAndSave(filePath: string) {
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS embedding_hnsw_idx
    ON "Embedding"
    USING hnsw (embedding vector_cosine_ops)
  `);

  await prisma.embedding.deleteMany();
  await prisma.resource.deleteMany();

  const fileBuffer = await fs.readFile(filePath);
  const pageTexts: string[] = [];

  await pdf(fileBuffer, {
    pagerender: (pageData) =>
      pageData.getTextContent().then((textContent: TextContent) => {
        let lastY,
          text = '';
        // eslint-disable-next-line
        for (const item of textContent.items as any[]) {
          const y = item.transform[5];
          if (lastY === y || !lastY) {
            text += item.str + ' ';
          } else {
            text += '\n' + item.str + ' ';
          }
          lastY = y;
        }
        pageTexts.push(text.trim());
        return text;
      }),
  });

  const chunksWithPages: { content: string; page: number }[] = [];

  pageTexts.forEach((text, i) => {
    const pageNumber = i + 1;
    const chunks = generateChunks(text);
    chunks.forEach((chunk) => {
      chunksWithPages.push({ content: chunk, page: pageNumber });
    });
  });

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunksWithPages.map((c) => c.content),
  });

  const resource = await prisma.resource.create({
    data: { file },
  });

  const values = embeddings
    .map((embedding, i) => {
      const id = crypto.randomUUID();
      const content = chunksWithPages[i].content.replace(/'/g, "''");
      const page = chunksWithPages[i].page;
      const vector = `'[${embedding.join(',')}]'::vector`;
      return `('${id}', '${resource.id}', '${content}', ${page}, ${vector})`;
    })
    .join(',\n');

  const insertSQL = `
    INSERT INTO "Embedding" ("id", "resourceId", "content", "pageNumber", "embedding")
    VALUES ${values};
  `;

  await prisma.$executeRawUnsafe(insertSQL);

  console.log('✅ Resource and embeddings saved:', resource.id);
}

embedPdfAndSave(file)
  .then(() => console.log('📄 PDF processing complete.'))
  .catch((err) => console.error('❌ PDF processing failed:', err));
