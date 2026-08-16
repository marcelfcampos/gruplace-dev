-- ============================================================
-- Gruplace — Development Seed
-- ============================================================

INSERT INTO public.tenants (
  name,
  slug
)
VALUES (
  'Gruplace Demo',
  'gruplace-demo'
)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO public.shopping_centers (
  tenant_id,
  name,
  slug
)
SELECT
  t.id,
  'Shopping Gruplace Demo',
  'shopping-gruplace-demo'
FROM public.tenants t
WHERE t.slug = 'gruplace-demo'
ON CONFLICT (tenant_id, slug) DO NOTHING;
