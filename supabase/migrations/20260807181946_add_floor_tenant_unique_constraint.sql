BEGIN;

ALTER TABLE public.shopping_floors
ADD CONSTRAINT uq_floor_tenant_id
UNIQUE (tenant_id, id);

COMMIT;