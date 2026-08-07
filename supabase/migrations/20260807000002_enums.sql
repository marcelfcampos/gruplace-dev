-- ============================================================================
-- Migration: 20260807000002_enums.sql
-- Projeto: Gruplace
-- Domínio: Enums base da plataforma SaaS Multi-Tenant
-- Stack: PostgreSQL 16+ / Supabase
-- ============================================================================

BEGIN;

-- Tipo de usuário dentro da plataforma
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_user_role'
    ) THEN
        CREATE TYPE public.enum_user_role AS ENUM (
            'customer',
            'store_owner',
            'store_manager',
            'shopping_admin',
            'platform_admin'
        );
    END IF;
END $$;


-- Tipo de loja/operação comercial
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_store_type'
    ) THEN
        CREATE TYPE public.enum_store_type AS ENUM (
            'anchor',
            'megastore',
            'inline',
            'kiosk',
            'pop_up',
            'food_court',
            'service'
        );
    END IF;
END $$;


-- Status de campanhas/promocoes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_campaign_status'
    ) THEN
        CREATE TYPE public.enum_campaign_status AS ENUM (
            'draft',
            'scheduled',
            'active',
            'paused',
            'finished',
            'cancelled'
        );
    END IF;
END $$;


-- Tipo de contato comercial
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_contact_type'
    ) THEN
        CREATE TYPE public.enum_contact_type AS ENUM (
            'phone',
            'whatsapp',
            'email',
            'instagram',
            'website',
            'facebook',
            'tiktok'
        );
    END IF;
END $$;


COMMIT;