-- ============================================================================
-- Migration: 20260809000006_harden_shopping_tenant_integrity.sql
-- Projeto: Gruplace
-- Domínio: Shopping / Tenant Integrity
-- ============================================================================
--
-- A migration 20260807000005_domain_maps.sql já garante o isolamento
-- multi-tenant de shopping_floors e shopping_zones através das relações:
--
--   (tenant_id, shopping_center_id)
--          ↓
--   shopping_centers (tenant_id, id)
--
-- Não existe relação direta zone → floor no modelo atual.
--
-- Esta migration fica registrada como hardening do domínio, sem alterações
-- adicionais no schema.
-- ============================================================================

BEGIN;

-- A integridade multi-tenant de Floors e Zones já está garantida
-- pela migration 20260807000005_domain_maps.sql.

COMMIT;
