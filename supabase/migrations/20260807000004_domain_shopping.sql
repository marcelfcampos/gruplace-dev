BEGIN;

-- ============================================================================
-- TABLE: shopping_centers
-- Shopping centers clientes da plataforma
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
    CONSTRAINT fk_shopping_center_tenant

        FOREIGN KEY (tenant_id)

        REFERENCES public.tenants(id)

        ON DELETE CASCADE,


    CONSTRAINT uq_shopping_center_tenant_slug

        UNIQUE(tenant_id, slug)

);


COMMENT ON TABLE public.shopping_centers IS
'Shoppings cadastrados no Gruplace. Cada shopping pertence a um tenant.';



-- ============================================================================
-- TABLE: shopping_floors
-- Pisos do shopping
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shopping_floors (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    shopping_center_id UUID NOT NULL,


    name VARCHAR(100) NOT NULL,

    level_order INTEGER NOT NULL DEFAULT 0,


    metadata JSONB DEFAULT '{}'::jsonb,


    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_floor_shopping

        FOREIGN KEY(shopping_center_id)

        REFERENCES public.shopping_centers(id)

        ON DELETE CASCADE,


    CONSTRAINT fk_floor_tenant

        FOREIGN KEY(tenant_id)

        REFERENCES public.tenants(id)

        ON DELETE RESTRICT,


    CONSTRAINT uq_floor_tenant_name

        UNIQUE(
            tenant_id,
            shopping_center_id,
            name
        )

);


COMMENT ON TABLE public.shopping_floors IS
'Pisos físicos dos shoppings cadastrados.';



-- ============================================================================
-- TABLE: shopping_zones
-- Áreas internas do shopping para mapas e navegação
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shopping_zones (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    shopping_center_id UUID NOT NULL,

    floor_id UUID,

    name VARCHAR(100) NOT NULL,

    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_zone_shopping

        FOREIGN KEY(shopping_center_id)

        REFERENCES public.shopping_centers(id)

        ON DELETE CASCADE,


    CONSTRAINT fk_zone_tenant

        FOREIGN KEY(tenant_id)

        REFERENCES public.tenants(id)

        ON DELETE RESTRICT,


    CONSTRAINT fk_zone_floor

        FOREIGN KEY(floor_id)

        REFERENCES public.shopping_floors(id)

        ON DELETE SET NULL,


    CONSTRAINT uq_zone_tenant_name

        UNIQUE(
            tenant_id,
            shopping_center_id,
            name
        )

);


COMMENT ON TABLE public.shopping_zones IS
'Áreas internas isoladas por tenant para mapas e inteligência espacial.';


COMMIT;
