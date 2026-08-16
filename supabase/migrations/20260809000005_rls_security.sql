-- ============================================================
-- Gruplace
-- Migration: RLS & Security
-- Version: 20260809000005
--
-- Objetivo:
--   - garantir RLS nas tabelas do domínio
--   - remover privilégios estruturais excessivos
--   - preparar os privilégios mínimos da aplicação
-- ============================================================




-- ============================================================
-- 1. GARANTIR RLS NAS TABELAS DO DOMÍNIO
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_operating_hours ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 2. REMOVER PRIVILÉGIOS ESTRUTURAIS EXCESSIVOS
--
-- anon/authenticated não devem possuir:
--   TRUNCATE
--   REFERENCES
--   TRIGGER
--   MAINTAIN
-- ============================================================

REVOKE TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
ON TABLE
    public.profiles,
    public.tenants,
    public.tenant_members,
    public.shopping_centers,
    public.shopping_floors,
    public.shopping_zones,
    public.stores,
    public.store_categories,
    public.store_contacts,
    public.store_locations,
    public.store_operating_hours
FROM anon, authenticated;


-- ============================================================
-- 3. REMOVER DML DO ANON
--
-- O role anon somente poderá consultar conteúdo público
-- através das Policies de SELECT.
-- ============================================================

REVOKE INSERT, UPDATE, DELETE
ON TABLE
    public.profiles,
    public.tenants,
    public.tenant_members,
    public.shopping_centers,
    public.shopping_floors,
    public.shopping_zones,
    public.stores,
    public.store_categories,
    public.store_contacts,
    public.store_locations,
    public.store_operating_hours
FROM anon;


-- ============================================================
-- 4. LEITURA PÚBLICA
--
-- O GRANT permite SELECT.
-- O RLS determinará quais linhas podem ser retornadas.
-- ============================================================

GRANT SELECT
ON TABLE
    public.shopping_centers,
    public.shopping_floors,
    public.shopping_zones,
    public.stores,
    public.store_categories,
    public.store_locations,
    public.store_operating_hours
TO anon;


-- ============================================================
-- 5. LEITURA PARA AUTHENTICATED
-- ============================================================

GRANT SELECT
ON TABLE
    public.shopping_centers,
    public.shopping_floors,
    public.shopping_zones,
    public.stores,
    public.store_categories,
    public.store_locations,
    public.store_operating_hours
TO authenticated;


-- ============================================================
-- 6. PROFILE DO USUÁRIO AUTENTICADO
-- ============================================================

GRANT SELECT, UPDATE
ON TABLE public.profiles
TO authenticated;


-- ============================================================
-- 7. DML PARA AUTHENTICATED
--
-- O GRANT concede capacidade técnica.
-- As Policies determinarão quais linhas podem ser acessadas.
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE
    public.tenants,
    public.tenant_members,
    public.shopping_centers,
    public.shopping_floors,
    public.shopping_zones,
    public.stores,
    public.store_categories,
    public.store_contacts,
    public.store_locations,
    public.store_operating_hours
TO authenticated;


-- ============================================================
-- 8. SERVICE ROLE
--
-- service_role é backend privilegiado e possui BYPASSRLS.
-- Nunca deve ser utilizado no frontend.
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE
    public.profiles,
    public.tenants,
    public.tenant_members,
    public.shopping_centers,
    public.shopping_floors,
    public.shopping_zones,
    public.stores,
    public.store_categories,
    public.store_contacts,
    public.store_locations,
    public.store_operating_hours
TO service_role;



-- ============================================================
-- 9. FUNÇÃO: ACESSO AO TENANT
--
-- Retorna TRUE quando o usuário autenticado pertence
-- ao tenant informado.
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_tenant_access(
    target_tenant_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.tenant_members AS tm
        WHERE tm.tenant_id = target_tenant_id
          AND tm.user_id = auth.uid()
    );
$$;


-- ============================================================
-- 10. FUNÇÃO: ROLE NO TENANT
--
-- Retorna TRUE quando o usuário autenticado possui
-- uma das roles permitidas dentro do tenant.
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_tenant_role(
    target_tenant_id uuid,
    allowed_roles public.enum_user_role[]
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.tenant_members AS tm
        WHERE tm.tenant_id = target_tenant_id
          AND tm.user_id = auth.uid()
          AND tm.role = ANY(allowed_roles)
    );
$$;


-- ============================================================
-- 11. FUNÇÃO: PLATFORM ADMIN
--
-- Retorna TRUE quando o usuário possui a role global
-- platform_admin.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.tenant_members AS tm
        WHERE tm.user_id = auth.uid()
          AND tm.role = 'platform_admin'::public.enum_user_role
    );
$$;


-- ============================================================
-- 12. PROTEGER EXECUÇÃO DAS FUNÇÕES
--
-- Nenhum cliente anônimo deve executar essas funções.
-- authenticated utiliza as funções através das Policies.
-- ============================================================

REVOKE EXECUTE
ON FUNCTION public.has_tenant_access(uuid)
FROM PUBLIC, anon;

REVOKE EXECUTE
ON FUNCTION public.has_tenant_role(
    uuid,
    public.enum_user_role[]
)
FROM PUBLIC, anon;

REVOKE EXECUTE
ON FUNCTION public.is_platform_admin()
FROM PUBLIC, anon;


GRANT EXECUTE
ON FUNCTION public.has_tenant_access(uuid)
TO authenticated, service_role;

GRANT EXECUTE
ON FUNCTION public.has_tenant_role(
    uuid,
    public.enum_user_role[]
)
TO authenticated, service_role;

GRANT EXECUTE
ON FUNCTION public.is_platform_admin()
TO authenticated, service_role;



-- ============================================================
-- 13. REMOVER POLICIES EXISTENTES
--
-- Garante que a migration seja determinística caso alguma
-- Policy tenha sido criada manualmente anteriormente.
-- ============================================================

DROP POLICY IF EXISTS profiles_select_own
ON public.profiles;

DROP POLICY IF EXISTS profiles_update_own
ON public.profiles;

DROP POLICY IF EXISTS tenants_select_member
ON public.tenants;

DROP POLICY IF EXISTS tenants_admin_update
ON public.tenants;

DROP POLICY IF EXISTS tenants_platform_all
ON public.tenants;

DROP POLICY IF EXISTS tenant_members_select_own
ON public.tenant_members;

DROP POLICY IF EXISTS tenant_members_select_admin
ON public.tenant_members;

DROP POLICY IF EXISTS tenant_members_insert_admin
ON public.tenant_members;

DROP POLICY IF EXISTS tenant_members_update_admin
ON public.tenant_members;

DROP POLICY IF EXISTS tenant_members_delete_admin
ON public.tenant_members;


-- ============================================================
-- 14. PROFILES — SELECT
--
-- O usuário autenticado pode consultar somente
-- o próprio perfil.
-- ============================================================

CREATE POLICY profiles_select_own
ON public.profiles
FOR SELECT
TO authenticated
USING (
    id = auth.uid()
);


-- ============================================================
-- 15. PROFILES — UPDATE
--
-- O usuário autenticado pode atualizar somente
-- o próprio perfil.
--
-- O id continua obrigatoriamente vinculado ao auth.uid().
-- ============================================================

CREATE POLICY profiles_update_own
ON public.profiles
FOR UPDATE
TO authenticated
USING (
    id = auth.uid()
)
WITH CHECK (
    id = auth.uid()
);


-- ============================================================
-- 16. TENANTS — SELECT
--
-- Um usuário pode consultar somente tenants dos quais
-- participa.
--
-- platform_admin possui acesso global.
-- ============================================================

CREATE POLICY tenants_select_member
ON public.tenants
FOR SELECT
TO authenticated
USING (
    public.has_tenant_access(id)
    OR public.is_platform_admin()
);


-- ============================================================
-- 17. TENANTS — UPDATE
--
-- shopping_admin pode atualizar o próprio tenant.
-- platform_admin pode atualizar qualquer tenant.
-- ============================================================

CREATE POLICY tenants_admin_update
ON public.tenants
FOR UPDATE
TO authenticated
USING (
    public.has_tenant_role(
        id,
        ARRAY[
            'shopping_admin'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
)
WITH CHECK (
    public.has_tenant_role(
        id,
        ARRAY[
            'shopping_admin'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
);


-- ============================================================
-- 18. TENANTS — PLATFORM ADMIN
--
-- platform_admin possui controle global.
-- ============================================================

CREATE POLICY tenants_platform_all
ON public.tenants
FOR ALL
TO authenticated
USING (
    public.is_platform_admin()
)
WITH CHECK (
    public.is_platform_admin()
);


-- ============================================================
-- 19. TENANT MEMBERS — SELECT PRÓPRIO
--
-- Todo usuário autenticado pode consultar seu próprio
-- vínculo com um tenant.
-- ============================================================

CREATE POLICY tenant_members_select_own
ON public.tenant_members
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);


-- ============================================================
-- 20. TENANT MEMBERS — SELECT ADMIN
--
-- shopping_admin pode consultar os membros do próprio tenant.
-- platform_admin pode consultar membros globalmente.
-- ============================================================

CREATE POLICY tenant_members_select_admin
ON public.tenant_members
FOR SELECT
TO authenticated
USING (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
);


-- ============================================================
-- 21. TENANT MEMBERS — INSERT
--
-- shopping_admin pode adicionar membros ao próprio tenant,
-- mas não pode criar platform_admin.
--
-- platform_admin pode criar qualquer role.
-- ============================================================

CREATE POLICY tenant_members_insert_admin
ON public.tenant_members
FOR INSERT
TO authenticated
WITH CHECK (
    (
        public.has_tenant_role(
            tenant_id,
            ARRAY[
                'shopping_admin'::public.enum_user_role
            ]
        )
        AND role <> 'platform_admin'::public.enum_user_role
    )
    OR public.is_platform_admin()
);


-- ============================================================
-- 22. TENANT MEMBERS — UPDATE
--
-- shopping_admin pode administrar membros do próprio tenant,
-- mas não pode promover ninguém a platform_admin.
-- ============================================================

CREATE POLICY tenant_members_update_admin
ON public.tenant_members
FOR UPDATE
TO authenticated
USING (
    (
        public.has_tenant_role(
            tenant_id,
            ARRAY[
                'shopping_admin'::public.enum_user_role
            ]
        )
        AND role <> 'platform_admin'::public.enum_user_role
    )
    OR public.is_platform_admin()
)
WITH CHECK (
    (
        public.has_tenant_role(
            tenant_id,
            ARRAY[
                'shopping_admin'::public.enum_user_role
            ]
        )
        AND role <> 'platform_admin'::public.enum_user_role
    )
    OR public.is_platform_admin()
);


-- ============================================================
-- 23. TENANT MEMBERS — DELETE
-- ============================================================

CREATE POLICY tenant_members_delete_admin
ON public.tenant_members
FOR DELETE
TO authenticated
USING (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
);



-- ============================================================
-- 24. SHOPPING CENTERS
-- ============================================================

DROP POLICY IF EXISTS shopping_centers_select
ON public.shopping_centers;

DROP POLICY IF EXISTS shopping_centers_insert
ON public.shopping_centers;

DROP POLICY IF EXISTS shopping_centers_update
ON public.shopping_centers;

DROP POLICY IF EXISTS shopping_centers_delete
ON public.shopping_centers;


-- SELECT
-- Conteúdo ativo pode ser descoberto publicamente.
-- O RLS impede acesso a tenants inativos/fora do escopo.

CREATE POLICY shopping_centers_select
ON public.shopping_centers
FOR SELECT
TO anon, authenticated
USING (
    is_active = true
);


-- INSERT
-- Somente shopping_admin ou platform_admin.

CREATE POLICY shopping_centers_insert
ON public.shopping_centers
FOR INSERT
TO authenticated
WITH CHECK (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
);


-- UPDATE
-- shopping_admin somente dentro do próprio tenant.

CREATE POLICY shopping_centers_update
ON public.shopping_centers
FOR UPDATE
TO authenticated
USING (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
)
WITH CHECK (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
);


-- DELETE
-- Exclusivamente platform_admin.
--
-- Shopping centers são entidades estruturais do tenant.

CREATE POLICY shopping_centers_delete
ON public.shopping_centers
FOR DELETE
TO authenticated
USING (
    public.is_platform_admin()
);


-- ============================================================
-- 25. SHOPPING FLOORS
-- ============================================================

DROP POLICY IF EXISTS shopping_floors_select
ON public.shopping_floors;

DROP POLICY IF EXISTS shopping_floors_insert
ON public.shopping_floors;

DROP POLICY IF EXISTS shopping_floors_update
ON public.shopping_floors;

DROP POLICY IF EXISTS shopping_floors_delete
ON public.shopping_floors;


-- SELECT

CREATE POLICY shopping_floors_select
ON public.shopping_floors
FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.shopping_centers AS sc
        WHERE sc.id = shopping_center_id
          AND sc.tenant_id = shopping_floors.tenant_id
          AND sc.is_active = true
    )
);


-- INSERT

CREATE POLICY shopping_floors_insert
ON public.shopping_floors
FOR INSERT
TO authenticated
WITH CHECK (
    (
        public.has_tenant_role(
            tenant_id,
            ARRAY[
                'shopping_admin'::public.enum_user_role
            ]
        )
        OR public.is_platform_admin()
    )
);


-- UPDATE

CREATE POLICY shopping_floors_update
ON public.shopping_floors
FOR UPDATE
TO authenticated
USING (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
)
WITH CHECK (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
);


-- DELETE

CREATE POLICY shopping_floors_delete
ON public.shopping_floors
FOR DELETE
TO authenticated
USING (
    public.is_platform_admin()
);


-- ============================================================
-- 26. SHOPPING ZONES
-- ============================================================

DROP POLICY IF EXISTS shopping_zones_select
ON public.shopping_zones;

DROP POLICY IF EXISTS shopping_zones_insert
ON public.shopping_zones;

DROP POLICY IF EXISTS shopping_zones_update
ON public.shopping_zones;

DROP POLICY IF EXISTS shopping_zones_delete
ON public.shopping_zones;


-- SELECT

CREATE POLICY shopping_zones_select
ON public.shopping_zones
FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.shopping_centers AS sc
        WHERE sc.id = shopping_center_id
          AND sc.tenant_id = shopping_zones.tenant_id
          AND sc.is_active = true
    )
);


-- INSERT

CREATE POLICY shopping_zones_insert
ON public.shopping_zones
FOR INSERT
TO authenticated
WITH CHECK (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
);


-- UPDATE

CREATE POLICY shopping_zones_update
ON public.shopping_zones
FOR UPDATE
TO authenticated
USING (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
)
WITH CHECK (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
);


-- DELETE

CREATE POLICY shopping_zones_delete
ON public.shopping_zones
FOR DELETE
TO authenticated
USING (
    public.is_platform_admin()
);



-- ============================================================
-- 27. STORES
-- ============================================================

DROP POLICY IF EXISTS stores_select
ON public.stores;

DROP POLICY IF EXISTS stores_insert
ON public.stores;

DROP POLICY IF EXISTS stores_update
ON public.stores;

DROP POLICY IF EXISTS stores_delete
ON public.stores;


-- ============================================================
-- 28. STORES — SELECT
--
-- Consumidores anônimos e autenticados podem descobrir
-- lojas ativas.
--
-- O tenant precisa possuir um shopping center ativo
-- correspondente ao registro da loja.
-- ============================================================

CREATE POLICY stores_select
ON public.stores
FOR SELECT
TO anon, authenticated
USING (
    is_active = true
    AND EXISTS (
        SELECT 1
        FROM public.shopping_centers AS sc
        WHERE sc.id = shopping_center_id
          AND sc.tenant_id = stores.tenant_id
          AND sc.is_active = true
    )
);


-- ============================================================
-- 29. STORES — INSERT
--
-- Permitido para:
--   - shopping_admin
--   - store_owner
--   - store_manager
--   - platform_admin
--
-- A criação ocorre somente dentro de um tenant ao qual
-- o usuário possui autorização.
-- ============================================================

CREATE POLICY stores_insert
ON public.stores
FOR INSERT
TO authenticated
WITH CHECK (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role,
            'store_owner'::public.enum_user_role,
            'store_manager'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
);


-- ============================================================
-- 30. STORES — UPDATE
--
-- Os mesmos papéis podem administrar lojas dentro
-- do próprio tenant.
-- ============================================================

CREATE POLICY stores_update
ON public.stores
FOR UPDATE
TO authenticated
USING (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role,
            'store_owner'::public.enum_user_role,
            'store_manager'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
)
WITH CHECK (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role,
            'store_owner'::public.enum_user_role,
            'store_manager'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
);


-- ============================================================
-- 31. STORES — DELETE
--
-- Exclusivamente:
--   - shopping_admin
--   - platform_admin
--
-- Store owner/manager não removem estruturalmente uma loja.
-- ============================================================

CREATE POLICY stores_delete
ON public.stores
FOR DELETE
TO authenticated
USING (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
);



-- ============================================================
-- 32. STORE CATEGORIES
-- ============================================================

DROP POLICY IF EXISTS store_categories_select
ON public.store_categories;

DROP POLICY IF EXISTS store_categories_insert
ON public.store_categories;

DROP POLICY IF EXISTS store_categories_update
ON public.store_categories;

DROP POLICY IF EXISTS store_categories_delete
ON public.store_categories;


-- SELECT
-- Categorias ativas são públicas.

CREATE POLICY store_categories_select
ON public.store_categories
FOR SELECT
TO anon, authenticated
USING (
    is_active = true
);


-- INSERT
-- Somente shopping_admin e platform_admin.

CREATE POLICY store_categories_insert
ON public.store_categories
FOR INSERT
TO authenticated
WITH CHECK (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
);


-- UPDATE

CREATE POLICY store_categories_update
ON public.store_categories
FOR UPDATE
TO authenticated
USING (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
)
WITH CHECK (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
);


-- DELETE
-- Exclusivamente platform_admin.

CREATE POLICY store_categories_delete
ON public.store_categories
FOR DELETE
TO authenticated
USING (
    public.is_platform_admin()
);


-- ============================================================
-- 33. STORE CONTACTS
-- ============================================================

DROP POLICY IF EXISTS store_contacts_select
ON public.store_contacts;

DROP POLICY IF EXISTS store_contacts_insert
ON public.store_contacts;

DROP POLICY IF EXISTS store_contacts_update
ON public.store_contacts;

DROP POLICY IF EXISTS store_contacts_delete
ON public.store_contacts;


-- SELECT
-- Contatos não são públicos nesta primeira versão.

CREATE POLICY store_contacts_select
ON public.store_contacts
FOR SELECT
TO authenticated
USING (
    public.has_tenant_access(tenant_id)
    OR public.is_platform_admin()
);


-- INSERT

CREATE POLICY store_contacts_insert
ON public.store_contacts
FOR INSERT
TO authenticated
WITH CHECK (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role,
            'store_owner'::public.enum_user_role,
            'store_manager'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
);


-- UPDATE

CREATE POLICY store_contacts_update
ON public.store_contacts
FOR UPDATE
TO authenticated
USING (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role,
            'store_owner'::public.enum_user_role,
            'store_manager'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
)
WITH CHECK (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role,
            'store_owner'::public.enum_user_role,
            'store_manager'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
);


-- DELETE

CREATE POLICY store_contacts_delete
ON public.store_contacts
FOR DELETE
TO authenticated
USING (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role,
            'store_owner'::public.enum_user_role,
            'store_manager'::public.enum_user_role
        ]
    )
    OR public.is_platform_admin()
);


-- ============================================================
-- 34. STORE LOCATIONS
-- ============================================================

DROP POLICY IF EXISTS store_locations_select
ON public.store_locations;

DROP POLICY IF EXISTS store_locations_insert
ON public.store_locations;

DROP POLICY IF EXISTS store_locations_update
ON public.store_locations;

DROP POLICY IF EXISTS store_locations_delete
ON public.store_locations;


-- SELECT
-- Localização ativa de loja ativa em shopping ativo.

CREATE POLICY store_locations_select
ON public.store_locations
FOR SELECT
TO anon, authenticated
USING (
    is_active = true
    AND EXISTS (
        SELECT 1
        FROM public.stores AS s
        JOIN public.shopping_centers AS sc
          ON sc.id = s.shopping_center_id
         AND sc.tenant_id = s.tenant_id
        WHERE s.id = store_id
          AND s.tenant_id = store_locations.tenant_id
          AND s.is_active = true
          AND sc.is_active = true
    )
);


-- INSERT

CREATE POLICY store_locations_insert
ON public.store_locations
FOR INSERT
TO authenticated
WITH CHECK (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'::public.enum_user_role,
            'store_owner',
            'store_manager'
        ]::public.enum_user_role[]
    )
    OR public.is_platform_admin()
);


-- UPDATE

CREATE POLICY store_locations_update
ON public.store_locations
FOR UPDATE
TO authenticated
USING (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin',
            'store_owner',
            'store_manager'
        ]::public.enum_user_role[]
    )
    OR public.is_platform_admin()
)
WITH CHECK (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin',
            'store_owner',
            'store_manager'
        ]::public.enum_user_role[]
    )
    OR public.is_platform_admin()
);


-- DELETE

CREATE POLICY store_locations_delete
ON public.store_locations
FOR DELETE
TO authenticated
USING (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'
        ]::public.enum_user_role[]
    )
    OR public.is_platform_admin()
);


-- ============================================================
-- 35. STORE OPERATING HOURS
-- ============================================================

DROP POLICY IF EXISTS store_operating_hours_select
ON public.store_operating_hours;

DROP POLICY IF EXISTS store_operating_hours_insert
ON public.store_operating_hours;

DROP POLICY IF EXISTS store_operating_hours_update
ON public.store_operating_hours;

DROP POLICY IF EXISTS store_operating_hours_delete
ON public.store_operating_hours;


-- SELECT
-- Horários de lojas ativas são públicos.

CREATE POLICY store_operating_hours_select
ON public.store_operating_hours
FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.stores AS s
        JOIN public.shopping_centers AS sc
          ON sc.id = s.shopping_center_id
         AND sc.tenant_id = s.tenant_id
        WHERE s.id = store_id
          AND s.tenant_id = store_operating_hours.tenant_id
          AND s.is_active = true
          AND sc.is_active = true
    )
);


-- INSERT

CREATE POLICY store_operating_hours_insert
ON public.store_operating_hours
FOR INSERT
TO authenticated
WITH CHECK (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin',
            'store_owner',
            'store_manager'
        ]::public.enum_user_role[]
    )
    OR public.is_platform_admin()
);


-- UPDATE

CREATE POLICY store_operating_hours_update
ON public.store_operating_hours
FOR UPDATE
TO authenticated
USING (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin',
            'store_owner',
            'store_manager'
        ]::public.enum_user_role[]
    )
    OR public.is_platform_admin()
)
WITH CHECK (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin',
            'store_owner',
            'store_manager'
        ]::public.enum_user_role[]
    )
    OR public.is_platform_admin()
);


-- DELETE

CREATE POLICY store_operating_hours_delete
ON public.store_operating_hours
FOR DELETE
TO authenticated
USING (
    public.has_tenant_role(
        tenant_id,
        ARRAY[
            'shopping_admin'
        ]::public.enum_user_role[]
    )
    OR public.is_platform_admin()
);




-- ============================================================
-- 36. HARDENING — TENANT_ID IMUTÁVEL
--
-- Usuários da aplicação não podem alterar o tenant_id
-- de registros existentes.
--
-- Isso impede movimentação acidental ou maliciosa de dados
-- entre tenants.
--
-- Operações administrativas que realmente precisarem alterar
-- tenant_id deverão ocorrer através do backend privilegiado.
-- ============================================================


REVOKE UPDATE (tenant_id)
ON public.tenant_members
FROM authenticated;

REVOKE UPDATE (tenant_id)
ON public.shopping_centers
FROM authenticated;

REVOKE UPDATE (tenant_id)
ON public.shopping_floors
FROM authenticated;

REVOKE UPDATE (tenant_id)
ON public.shopping_zones
FROM authenticated;

REVOKE UPDATE (tenant_id)
ON public.stores
FROM authenticated;

REVOKE UPDATE (tenant_id)
ON public.store_categories
FROM authenticated;

REVOKE UPDATE (tenant_id)
ON public.store_contacts
FROM authenticated;

REVOKE UPDATE (tenant_id)
ON public.store_locations
FROM authenticated;

REVOKE UPDATE (tenant_id)
ON public.store_operating_hours
FROM authenticated;


-- ============================================================
-- 37. HARDENING — CHAVES DE IDENTIDADE IMUTÁVEIS
--
-- Um usuário não pode transformar o vínculo de um membro
-- em outro usuário através de UPDATE.
--
-- tenant_id e user_id continuam sendo definidos somente
-- na criação do vínculo.
-- ============================================================

REVOKE UPDATE (tenant_id, user_id)
ON public.tenant_members
FROM authenticated;


-- ============================================================
-- 38. HARDENING — IDENTIDADE DO PROFILE
--
-- O id do profile representa o auth.uid().
-- A Policy já impede alteração lógica do id.
-- Aqui removemos também a capacidade técnica de UPDATE
-- dessa coluna pelo role authenticated.
-- ============================================================

REVOKE UPDATE (id)
ON public.profiles
FROM authenticated;


-- ============================================================
-- 39. HARDENING — PRIVILÉGIOS DE FUNÇÕES
--
-- As funções de autorização são SECURITY DEFINER e somente
-- devem ser executáveis pelos papéis que precisam utilizá-las.
-- ============================================================

REVOKE ALL
ON FUNCTION public.has_tenant_access(uuid)
FROM PUBLIC;

REVOKE ALL
ON FUNCTION public.has_tenant_role(
    uuid,
    public.enum_user_role[]
)
FROM PUBLIC;

REVOKE ALL
ON FUNCTION public.is_platform_admin()
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.has_tenant_access(uuid)
TO authenticated, service_role;

GRANT EXECUTE
ON FUNCTION public.has_tenant_role(
    uuid,
    public.enum_user_role[]
)
TO authenticated, service_role;

GRANT EXECUTE
ON FUNCTION public.is_platform_admin()
TO authenticated, service_role;


-- ============================================================
-- 40. HARDENING — PRIVILÉGIOS DE TABELAS
--
-- RLS controla QUEM pode acessar cada linha.
-- GRANT controla QUAIS operações o papel pode solicitar.
--
-- anon:
--   somente SELECT nas tabelas públicas.
--
-- authenticated:
--   SELECT / INSERT / UPDATE / DELETE.
--   As Policies determinam o escopo real.
--
-- service_role:
--   acesso completo para operações privilegiadas do backend.
-- ============================================================


-- ============================================================
-- 40.1 REMOVER PRIVILÉGIOS DESNECESSÁRIOS
-- ============================================================

REVOKE TRIGGER, TRUNCATE, REFERENCES
ON ALL TABLES IN SCHEMA public
FROM anon, authenticated, service_role;


-- ============================================================
-- 40.2 ANON — ACESSO DE LEITURA PÚBLICA
-- ============================================================

GRANT SELECT
ON TABLE
    public.shopping_centers,
    public.shopping_floors,
    public.shopping_zones,
    public.stores,
    public.store_categories,
    public.store_locations,
    public.store_operating_hours
TO anon;


-- ============================================================
-- 40.3 AUTHENTICATED — PRIVILÉGIOS DML
--
-- O RLS continuará sendo a autoridade final sobre as linhas.
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE
    public.profiles,
    public.tenants,
    public.tenant_members,
    public.shopping_centers,
    public.shopping_floors,
    public.shopping_zones,
    public.stores,
    public.store_categories,
    public.store_contacts,
    public.store_locations,
    public.store_operating_hours
TO authenticated;


-- ============================================================
-- 40.4 SERVICE ROLE — BACKEND PRIVILEGIADO
--
-- service_role possui BYPASSRLS no Supabase.
-- O acesso deve ocorrer somente no backend seguro.
-- ============================================================

GRANT ALL
ON TABLE
    public.profiles,
    public.tenants,
    public.tenant_members,
    public.shopping_centers,
    public.shopping_floors,
    public.shopping_zones,
    public.stores,
    public.store_categories,
    public.store_contacts,
    public.store_locations,
    public.store_operating_hours
TO service_role;


-- ============================================================
-- 41. HARDENING — SEQUENCES
--
-- Não existem sequences nas 11 tabelas atuais porque os IDs
-- são UUID. Nenhum privilégio de sequence é necessário.
-- ============================================================


-- ============================================================
-- 42. FINALIZAÇÃO
--
-- Não utilizar COMMIT manualmente.
-- O Supabase CLI gerencia a transação da migration.
-- ============================================================
