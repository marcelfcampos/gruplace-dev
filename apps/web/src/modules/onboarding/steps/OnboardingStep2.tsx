import { useEffect, useState } from 'react'

import { supabase } from '../../../lib/supabase'

import './OnboardingStep2.css'

type Category = {
  id: string
  name: string
  slug: string
}

export function OnboardingStep2({
  onContinue,
  onBack,
}: {
  onContinue: () => void
  onBack: () => void
}) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategories() {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from('catalog_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('display_order')

      if (supabaseError) {
        console.error('Erro ao carregar categorias:', supabaseError)
        setError('Não foi possível carregar os interesses.')
        setLoading(false)
        return
      }

      setCategories(data ?? [])
      setLoading(false)
    }

    void loadCategories()
  }, [])

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    )
  }

  

async function handleContinue() {
  if (selectedCategoryIds.length === 0 || saving) {
    return
  }

  console.log('STEP 2 → CONTINUAR')
  console.log('Categorias selecionadas:', selectedCategoryIds)

  setSaving(true)
  setError(null)

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log('Usuário:', user?.id)

    if (userError || !user) {
      console.error('Erro ao identificar usuário:', userError)
      setError('Não foi possível identificar seu usuário.')
      return
    }

    console.log('Removendo interesses anteriores...')

    const { error: deleteError } = await supabase
      .from('user_interests')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Erro ao atualizar interesses:', deleteError)
      setError('Não foi possível atualizar seus interesses.')
      return
    }

    console.log('Interesses anteriores removidos.')

    const interests = selectedCategoryIds.map((categoryId) => ({
      user_id: user.id,
      category_id: categoryId,
    }))

    console.log('Inserindo interesses:', interests)

    const { error: insertError } = await supabase
      .from('user_interests')
      .insert(interests)

    if (insertError) {
      console.error('Erro ao salvar interesses:', insertError)
      setError('Não foi possível salvar seus interesses.')
      return
    }

    console.log('Interesses salvos com sucesso.')
    console.log('STEP 2 → chamando onContinue()')

    onContinue()
  } catch (unexpectedError) {
    console.error('EXCEÇÃO NO STEP 2:', unexpectedError)
    setError('Ocorreu um erro ao salvar seus interesses.')
  } finally {
    setSaving(false)
  }
}



  return (
    <main className="onboarding-step2">
      <button
        className="step2-back"
        type="button"
        onClick={onBack}
        disabled={saving}
      >
        ← VOLTAR
      </button>

      <div className="step2-content">
        <span className="step2-label">
          SEUS INTERESSES
        </span>

        <h1>
          Escolha o que você gosta.
        </h1>

        <p>
          Siga suas lojas favoritas e receba novidades,
          ofertas e experiências que combinam com você.
        </p>

        <div className="step2-interests">
          {loading && (
            <p>
              Carregando interesses...
            </p>
          )}

          {!loading && error && (
            <p role="alert">
              {error}
            </p>
          )}

          {!loading && !error && categories.length === 0 && (
            <p>
              Nenhum interesse disponível.
            </p>
          )}

          {!loading &&
            !error &&
            categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`step2-interest ${
                  selectedCategoryIds.includes(category.id)
                    ? 'selected'
                    : ''
                }`}
                onClick={() => toggleCategory(category.id)}
                disabled={saving}
              >
                {category.name}
              </button>
            ))}
        </div>

        {error && (
          <p role="alert">
            {error}
          </p>
        )}

        <button
          className="step2-button"
          type="button"
          onClick={() => void handleContinue()}
          disabled={
            loading ||
            saving ||
            selectedCategoryIds.length === 0
          }
        >
          {saving ? 'SALVANDO...' : 'CONTINUAR'}
        </button>
      </div>

      <div
        className="step2-dots"
        aria-hidden="true"
      >
        <span />
        <span className="active" />
        <span />
      </div>
    </main>
  )
}
