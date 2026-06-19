-- Enable pgvector before Drizzle migrations create the embeddings table.
CREATE EXTENSION IF NOT EXISTS vector;
