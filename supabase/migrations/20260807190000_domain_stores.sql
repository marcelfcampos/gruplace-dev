-- ============================================================================
-- Migration: 20260807000006_domain_stores.sql
-- Projeto: Gruplace - Plataforma SaaS Multi-Tenant Phygital
-- Domínio: Stores, Categories, Locations, Contacts & Operating Hours
-- Stack: PostgreSQL 16+ / Supabase
-- ============================================================================

BEGIN;

-- ============================================================================
-- ENUMS
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_store_contact_type'
    ) THEN
        CREATE TYPE public.enum_store_contact_type AS ENUM (
            'whatsapp',
            'phone',
            'instagram',
            'email',
            'website',
            'e_commerce',
            'facebook',
            'tiktok'
        );
    END IF;
END $$;


-- ============================================================================
-- TABLE: store_categories
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.store_categories (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL
        REFERENCES public.tenants(id)
        ON DELETE RESTRICT,

    parent_id UUID,

    name VARCHAR(100) NOT NULL,

    slug VARCHAR(100) NOT NULL,

    description TEXT,

    icon_url TEXT,

    display_order INT NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMPTZ,


    CONSTRAINT uq_store_categories_tenant_id
        UNIQUE (tenant_id, id),


    CONSTRAINT uq_store_categories_tenant_slug
        UNIQUE (tenant_id, slug),


    CONSTRAINT chk_store_category_slug
        CHECK (slug ~ '^[a-z0-9-]+$'),


    CONSTRAINT fk_store_categories_parent_tenant
        FOREIGN KEY (tenant_id, parent_id)
        REFERENCES public.store_categories(tenant_id, id)
        ON DELETE RESTRICT
);


COMMENT ON TABLE public.store_categories IS
'Categorias e subcategorias comerciais dos tenants.';


CREATE INDEX IF NOT EXISTS idx_store_categories_tenant_active
ON public.store_categories
(
    tenant_id,
    display_order
)
WHERE deleted_at IS NULL
AND is_active = true;


CREATE INDEX IF NOT EXISTS idx_store_categories_parent
ON public.store_categories
(
    tenant_id,
    parent_id
)
WHERE deleted_at IS NULL;


-- ============================================================================
-- TABLE: stores
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.stores (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL
        REFERENCES public.tenants(id)
        ON DELETE RESTRICT,


    shopping_center_id UUID NOT NULL,

    category_id UUID NOT NULL,


    external_reference VARCHAR(100),

    corporate_name VARCHAR(255),

    trade_name VARCHAR(255) NOT NULL,

    slug VARCHAR(100) NOT NULL,


    tax_identifier VARCHAR(50),


    description TEXT,

    logo_url TEXT,

    banner_url TEXT,


    store_type public.enum_store_type NOT NULL
        DEFAULT 'inline',


    is_featured BOOLEAN NOT NULL DEFAULT false,

    tags TEXT[] NOT NULL DEFAULT '{}',


    accepts_cashback BOOLEAN NOT NULL DEFAULT true,


    is_active BOOLEAN NOT NULL DEFAULT true,


    sync_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,


    last_sync_at TIMESTAMPTZ,


    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMPTZ,


    CONSTRAINT uq_stores_tenant_id
        UNIQUE (tenant_id, id),


    CONSTRAINT uq_stores_shopping_slug
        UNIQUE (shopping_center_id, slug),


    CONSTRAINT chk_store_slug_format
        CHECK (slug ~ '^[a-z0-9-]+$'),


    CONSTRAINT fk_stores_shopping_tenant
        FOREIGN KEY (tenant_id, shopping_center_id)
        REFERENCES public.shopping_centers(tenant_id, id)
        ON DELETE RESTRICT,


    CONSTRAINT fk_stores_category_tenant
        FOREIGN KEY (tenant_id, category_id)
        REFERENCES public.store_categories(tenant_id, id)
        ON DELETE RESTRICT
);


-- ============================================================================
-- INDEXES STORES
-- ============================================================================

COMMENT ON TABLE public.stores IS
'Lojas, quiosques e operações comerciais dos tenants.';


CREATE UNIQUE INDEX IF NOT EXISTS uq_stores_external_reference
ON public.stores
(
    shopping_center_id,
    external_reference
)
WHERE external_reference IS NOT NULL
AND deleted_at IS NULL;


-- Feed B2C
CREATE INDEX IF NOT EXISTS idx_stores_feed
ON public.stores
(
    tenant_id,
    shopping_center_id,
    is_active,
    trade_name
)
WHERE deleted_at IS NULL;


-- Dashboard Lojista
CREATE INDEX IF NOT EXISTS idx_stores_category
ON public.stores
(
    tenant_id,
    category_id,
    id
)
WHERE deleted_at IS NULL;


CREATE INDEX IF NOT EXISTS idx_stores_slug
ON public.stores
(
    tenant_id,
    slug
)
WHERE deleted_at IS NULL;


-- Destaques do Shopping
CREATE INDEX IF NOT EXISTS idx_stores_featured
ON public.stores
(
    tenant_id,
    shopping_center_id,
    is_featured,
    trade_name
)
WHERE is_featured = true
AND is_active = true
AND deleted_at IS NULL;


-- Busca por tags
CREATE INDEX IF NOT EXISTS idx_stores_tags_gin
ON public.stores
USING gin(tags)
WHERE deleted_at IS NULL
AND is_active = true;



-- ============================================================================
-- TABLE: store_locations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.store_locations (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),


    tenant_id UUID NOT NULL
        REFERENCES public.tenants(id)
        ON DELETE RESTRICT,


    shopping_center_id UUID NOT NULL,

    store_id UUID NOT NULL,

    floor_id UUID NOT NULL,

    zone_id UUID,


    luc_number VARCHAR(50) NOT NULL,


    leasable_area_sqm NUMERIC(10,2)
        CHECK (leasable_area_sqm >= 0),


    position_x NUMERIC(10,2)
        CHECK (position_x IS NULL OR position_x >= 0),


    position_y NUMERIC(10,2)
        CHECK (position_y IS NULL OR position_y >= 0),


    is_main_location BOOLEAN NOT NULL DEFAULT true,


    is_active BOOLEAN NOT NULL DEFAULT true,


    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMPTZ,


    CONSTRAINT uq_store_luc_per_shopping
        UNIQUE
        (
            tenant_id,
            shopping_center_id,
            luc_number
        ),


    CONSTRAINT fk_store_locations_shopping_tenant
        FOREIGN KEY
        (
            tenant_id,
            shopping_center_id
        )
        REFERENCES public.shopping_centers
        (
            tenant_id,
            id
        )
        ON DELETE RESTRICT,


    CONSTRAINT fk_store_locations_store_tenant
        FOREIGN KEY
        (
            tenant_id,
            store_id
        )
        REFERENCES public.stores
        (
            tenant_id,
            id
        )
        ON DELETE RESTRICT,


    CONSTRAINT fk_store_locations_floor_tenant
        FOREIGN KEY
        (
            tenant_id,
            floor_id
        )
        REFERENCES public.shopping_floors
        (
            tenant_id,
            id
        )
        ON DELETE RESTRICT,


    CONSTRAINT fk_store_locations_zone_tenant
        FOREIGN KEY
        (
            tenant_id,
            zone_id
        )
        REFERENCES public.shopping_zones
        (
            tenant_id,
            id
        )
        ON DELETE SET NULL

);


COMMENT ON TABLE public.store_locations IS
'Localizações físicas das lojas, LUCs e mapa indoor.';




-- ============================================================================
-- INDEXES STORE LOCATIONS
-- ============================================================================


CREATE UNIQUE INDEX IF NOT EXISTS idx_store_main_location_unique
ON public.store_locations(store_id)
WHERE is_main_location = true
AND deleted_at IS NULL;


CREATE INDEX IF NOT EXISTS idx_store_locations_store
ON public.store_locations
(
    tenant_id,
    store_id
)
WHERE deleted_at IS NULL;


CREATE INDEX IF NOT EXISTS idx_store_locations_floor
ON public.store_locations
(
    tenant_id,
    floor_id
)
WHERE deleted_at IS NULL;


-- Mapa Indoor
CREATE INDEX IF NOT EXISTS idx_store_locations_indoor_map
ON public.store_locations
(
    tenant_id,
    shopping_center_id,
    floor_id,
    store_id
)
WHERE deleted_at IS NULL
AND is_active = true;



-- ============================================================================
-- TABLE: store_contacts
-- ============================================================================


CREATE TABLE IF NOT EXISTS public.store_contacts (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),


    tenant_id UUID NOT NULL
        REFERENCES public.tenants(id)
        ON DELETE RESTRICT,


    store_id UUID NOT NULL,


    contact_type public.enum_store_contact_type NOT NULL,


    contact_value TEXT NOT NULL,


    label VARCHAR(100),


    is_primary BOOLEAN NOT NULL DEFAULT false,


    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMPTZ,


    CONSTRAINT fk_store_contacts_store_tenant
        FOREIGN KEY
        (
            tenant_id,
            store_id
        )
        REFERENCES public.stores
        (
            tenant_id,
            id
        )
        ON DELETE RESTRICT
);


COMMENT ON TABLE public.store_contacts IS
'Canais de contato e redes sociais das lojas.';



CREATE UNIQUE INDEX IF NOT EXISTS idx_store_primary_contact
ON public.store_contacts
(
    store_id,
    contact_type
)
WHERE is_primary = true
AND deleted_at IS NULL;


CREATE INDEX IF NOT EXISTS idx_store_contacts_store
ON public.store_contacts
(
    tenant_id,
    store_id
)
WHERE deleted_at IS NULL;



-- ============================================================================
-- TABLE: store_operating_hours
-- ============================================================================


CREATE TABLE IF NOT EXISTS public.store_operating_hours (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),


    tenant_id UUID NOT NULL
        REFERENCES public.tenants(id)
        ON DELETE RESTRICT,


    store_id UUID NOT NULL,


    day_of_week INT
        CHECK(day_of_week BETWEEN 0 AND 6),


    specific_date DATE,


    opens_at TIME,


    closes_at TIME,


    is_closed BOOLEAN NOT NULL DEFAULT false,


    notes TEXT,


    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,


    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,


    deleted_at TIMESTAMPTZ,



    CONSTRAINT chk_store_hours_type
    CHECK
    (
        (day_of_week IS NOT NULL AND specific_date IS NULL)
        OR
        (day_of_week IS NULL AND specific_date IS NOT NULL)
    ),



    CONSTRAINT chk_store_hours_time
    CHECK
    (
        is_closed = true
        OR
        (
            opens_at IS NOT NULL
            AND
            closes_at IS NOT NULL
            AND
            opens_at <> closes_at
        )
    ),



    CONSTRAINT fk_store_hours_store_tenant
        FOREIGN KEY
        (
            tenant_id,
            store_id
        )
        REFERENCES public.stores
        (
            tenant_id,
            id
        )
        ON DELETE RESTRICT

);


COMMENT ON TABLE public.store_operating_hours IS
'Horários regulares e exceções das lojas.';



CREATE INDEX IF NOT EXISTS idx_store_hours_store
ON public.store_operating_hours
(
    tenant_id,
    store_id
)
WHERE deleted_at IS NULL;



CREATE INDEX IF NOT EXISTS idx_store_hours_specific_date
ON public.store_operating_hours
(
    tenant_id,
    store_id,
    specific_date
)
WHERE specific_date IS NOT NULL
AND deleted_at IS NULL;



-- ============================================================================
-- FINAL
-- ============================================================================


COMMIT;