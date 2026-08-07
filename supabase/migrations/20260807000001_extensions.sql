-- ============================================================================
-- Migration: 20260807000001_extensions.sql
-- Projeto: Gruplace
-- Stack: PostgreSQL 16+ / Supabase
-- Objetivo: Extensões base do banco
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE EXTENSION IF NOT EXISTS "pg_trgm";

COMMIT;