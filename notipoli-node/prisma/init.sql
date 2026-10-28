-- notipoli-node/prisma/init.sql
-- Initial database setup (runs on first container startup)

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- Create indexes for better performance (Prisma creates most, but these help)
-- These run after Prisma migrations

-- Full text search index for news
-- CREATE INDEX IF NOT EXISTS news_search_idx ON "news" USING gin (
--   to_tsvector('spanish', coalesce("title", '') || ' ' || coalesce("excerpt", '') || ' ' || coalesce("content", ''))
-- );

-- Grant permissions (if using different users)
-- GRANT ALL PRIVILEGES ON DATABASE notipoli TO notipoli;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO notipoli;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO notipoli;