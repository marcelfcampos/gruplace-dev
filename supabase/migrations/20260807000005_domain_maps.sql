-- ============================================================================
-- Migration: 20260807000005_domain_maps.sql
-- Projeto: Gruplace
-- Domínio: Maps Hardening / Indoor Navigation
-- Stack: PostgreSQL 16+ / Supabase
--
-- Objetivo:
-- Garantir isolamento Multi-Tenant para Floors e Zones
-- ============================================================================

BEGIN;


-- ============================================================================
-- 1. Criar chaves compostas necessárias
-- ============================================================================

ALTER TABLE public.shopping_centers
DROP CONSTRAINT IF EXISTS uq_shopping_tenant_id;


ALTER TABLE public.shopping_centers
ADD CONSTRAINT uq_shopping_centers_tenant_id
UNIQUE (tenant_id, id);



-- ============================================================================
-- 2. Corrigir isolamento de Floors
-- ============================================================================

ALTER TABLE public.shopping_floors
DROP CONSTRAINT IF EXISTS fk_floor_shopping;


ALTER TABLE public.shopping_floors
ADD CONSTRAINT fk_floor_shopping_tenant
FOREIGN KEY (tenant_id, shopping_center_id)
REFERENCES public.shopping_centers(tenant_id, id)
ON DELETE CASCADE;



-- ============================================================================
-- 3. Corrigir isolamento de Zones
-- ============================================================================

ALTER TABLE public.shopping_zones
DROP CONSTRAINT IF EXISTS fk_zone_shopping;


ALTER TABLE public.shopping_zones
ADD CONSTRAINT fk_zone_shopping_tenant
FOREIGN KEY (tenant_id, shopping_center_id)
REFERENCES public.shopping_centers(tenant_id, id)
ON DELETE CASCADE;



-- ============================================================================
-- 4. Índices para mapa indoor
-- ============================================================================


CREATE INDEX IF NOT EXISTS idx_floor_tenant_map
ON public.shopping_floors(
    tenant_id,
    shopping_center_id,
    level_order
);



CREATE INDEX IF NOT EXISTS idx_zone_tenant_map
ON public.shopping_zones(
    tenant_id,
    shopping_center_id,
    name
);



-- ============================================================================
-- 5. Comentários
-- ============================================================================


COMMENT ON TABLE public.shopping_floors IS
'Pisos físicos isolados por tenant para navegação indoor.';


COMMENT ON TABLE public.shopping_zones IS
'Áreas internas isoladas por tenant para mapas e inteligência espacial.';



COMMIT;