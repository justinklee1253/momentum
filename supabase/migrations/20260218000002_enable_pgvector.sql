-- Enable pgvector extension for RAG (embeddings infrastructure — retrieval not used in MVP)
CREATE EXTENSION IF NOT EXISTS vector;

-- Embeddings table
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL, -- 'journal', 'protocol', etc.
  source_id UUID NOT NULL,
  content_preview TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HNSW index for fast ANN search (post-MVP)
CREATE INDEX ON embeddings USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_embeddings_user_source ON embeddings(user_id, source_type);
