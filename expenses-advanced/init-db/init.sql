CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX IF NOT EXISTS embedding_hnsw_idx
ON "Embedding"
USING hnsw (embedding vector_cosine_ops);