CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX userName_gin_idx ON "User" USING GIN ("userName" gin_trgm_ops);
