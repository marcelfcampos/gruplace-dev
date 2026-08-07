-- ============================================================================
-- Migration: 20260807000003_domain_identity.sql
-- Projeto: Gruplace
-- Domínio: Identity + Multi Tenant Core
-- Stack: PostgreSQL 16+ / Supabase
-- ============================================================================

BEGIN;


-- ============================================================================
-- TABLE: tenants
-- Empresas / Shoppings clientes da plataforma
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tenants (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,

    slug VARCHAR(100) NOT NULL UNIQUE,

    is_active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP

);


COMMENT ON TABLE public.tenants IS
'Clientes SaaS do Gruplace. Cada shopping opera como tenant isolado.';



-- ============================================================================
-- TABLE: profiles
-- Extensão do usuário autenticado Supabase Auth
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (

    id UUID PRIMARY KEY REFERENCES auth.users(id)
        ON DELETE CASCADE,

    full_name VARCHAR(255),

    avatar_url TEXT,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

);



COMMENT ON TABLE public.profiles IS
'Perfil complementar dos usuários autenticados.';



-- ============================================================================
-- TABLE: tenant_members
-- Relação usuário x tenant
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tenant_members (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    user_id UUID NOT NULL,

    role public.enum_user_role NOT NULL DEFAULT 'customer',

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_member_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES public.tenants(id)
        ON DELETE CASCADE,


    CONSTRAINT fk_member_profile
        FOREIGN KEY (user_id)
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,


    CONSTRAINT uq_member_tenant_user
        UNIQUE(tenant_id,user_id)

);



COMMENT ON TABLE public.tenant_members IS
'Usuários vinculados aos tenants com controle de permissão.';



-- ============================================================================
-- INDEXES
-- ============================================================================


CREATE INDEX IF NOT EXISTS idx_tenant_members_user
ON public.tenant_members(user_id);


CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant
ON public.tenant_members(tenant_id);



COMMIT;