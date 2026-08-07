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

        ON DELETE RESTRICT,


    CONSTRAINT uq_floor_tenant_id

        UNIQUE (
            tenant_id,
            id
        )

);