BEGIN;

ALTER TABLE public.shopping_zones
ADD CONSTRAINT uq_zone_tenant_id
UNIQUE (tenant_id, id);

COMMIT;