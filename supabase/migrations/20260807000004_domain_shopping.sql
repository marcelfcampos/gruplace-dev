-- ============================================================================
-- Migration: 20260807000004_domain_shopping.sql
-- Projeto: Gruplace
-- Domínio: Shopping Centers, Floors e Zones
-- Stack: PostgreSQL 16+ / Supabase
-- ============================================================================

BEGIN;


-- ============================================================================
-- TABLE: shopping_centers
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shopping_centers (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    name VARCHAR(255) NOT NULL,

    slug VARCHAR(100) NOT NULL,

    address JSONB DEFAULT '{}'::jsonb,

    metadata JSONB DEFAULT '{}'::jsonb,

    is_active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_shopping_tenant

        FOREIGN KEY (tenant_id)

        REFERENCES public.tenants(id)

        ON DELETE RESTRICT,


    CONSTRAINT uq_shopping_slug_tenant

        UNIQUE(tenant_id, slug)

);



COMMENT ON TABLE public.shopping_centers IS
'Shoppings físicos pertencentes aos tenants do Gruplace.';



CREATE INDEX IF NOT EXISTS idx_shopping_tenant

ON public.shopping_centers(tenant_id);



-- ============================================================================
-- TABLE: shopping_floors
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shopping_floors (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    shopping_center_id UUID NOT NULL,


    name VARCHAR(100) NOT NULL,

    level_order INTEGER NOT NULL DEFAULT 0,


    metadata JSONB DEFAULT '{}'::jsonb,


    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_floor_shopping

        FOREIGN KEY(shopping_center_id)

        REFERENCES public.shopping_centers(id)

        ON DELETE CASCADE,


    CONSTRAINT fk_floor_tenant

        FOREIGN KEY(tenant_id)

        REFERENCES public.tenants(id)

        ON DELETE RESTRICT

);



COMMENT ON TABLE public.shopping_floors IS
'Pisos físicos do shopping para navegação e mapa indoor.';



CREATE INDEX IF NOT EXISTS idx_floor_shopping

ON public.shopping_floors(shopping_center_id);



-- ============================================================================
-- TABLE: shopping_zones
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shopping_zones (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),


    tenant_id UUID NOT NULL,


    shopping_center_id UUID NOT NULL,


    name VARCHAR(150) NOT NULL,


    description TEXT,


    metadata JSONB DEFAULT '{}'::jsonb,


    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_zone_shopping

        FOREIGN KEY(shopping_center_id)

        REFERENCES public.shopping_centers(id)

        ON DELETE CASCADE,


    CONSTRAINT fk_zone_tenant

        FOREIGN KEY(tenant_id)

        REFERENCES public.tenants(id)

        ON DELETE RESTRICT

);



COMMENT ON TABLE public.shopping_zones IS
'Áreas internas do shopping para mapas e inteligência espacial.';



CREATE INDEX IF NOT EXISTS idx_zone_shopping

ON public.shopping_zones(shopping_center_id);



COMMIT;