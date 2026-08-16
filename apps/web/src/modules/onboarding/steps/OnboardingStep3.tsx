import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import './OnboardingStep3.css'

type ShoppingCenter = {
  id: string
  name: string
  slug: string
}

export function OnboardingStep3({
  onBack,
  onContinue,
}: {
  onBack: () => void
  onContinue: (shoppingId: string) => void
}) {



  const [shoppings, setShoppings] = useState<ShoppingCenter[]>([])
  const [selectedShoppingId, setSelectedShoppingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadShoppings() {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from('shopping_centers')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name')

      if (supabaseError) {
        console.error('Erro ao carregar shoppings:', supabaseError)
        setError('Não foi possível carregar os shoppings.')
        setLoading(false)
        return
      }

      setShoppings(data ?? [])

      if (data && data.length > 0) {
        setSelectedShoppingId(data[0].id)
      }

      setLoading(false)
    }

    void loadShoppings()
  }, [])

  return (
    <main className="step3-page">

      <button
        className="step3-back"
        type="button"
        onClick={onBack}
      >
        ← VOLTAR
      </button>

      <div className="step3-content">

        <span className="step3-label">
          SEU SHOPPING
        </span>

        <h1>
          Escolha seu shopping.
        </h1>

        <p>
          Selecione o shopping que você frequenta
          para descobrir lojas, novidades, ofertas
          e experiências perto de você.
        </p>

        <div className="step3-shopping-list">

          {loading && (
            <p>
              Carregando shoppings...
            </p>
          )}

          {!loading && error && (
            <p>
              {error}
            </p>
          )}

          {!loading && !error && shoppings.length === 0 && (
            <p>
              Nenhum shopping disponível.
            </p>
          )}

          {!loading && !error && shoppings.map((shopping) => (
            <button
              key={shopping.id}
              type="button"
              className={`step3-shopping-card ${
                selectedShoppingId === shopping.id
                  ? 'selected'
                  : ''
              }`}
              onClick={() => setSelectedShoppingId(shopping.id)}
            >
              <div className="step3-shopping-icon">
                G
              </div>

              <div className="step3-shopping-info">
                <strong>
                  {shopping.name}
                </strong>

                <span>
                  {shopping.slug}
                </span>
              </div>

              {selectedShoppingId === shopping.id && (
                <span className="step3-check">
                  ✓
                </span>
              )}
            </button>
          ))}

        </div>


<button
  className="step3-button"
  type="button"
  onClick={() => {
    if (selectedShoppingId) {
      onContinue(selectedShoppingId)
    }
  }}
  disabled={!selectedShoppingId || loading}
>
  CONTINUAR
</button>



      </div>

      <div
        className="step3-dots"
        aria-hidden="true"
      >
        <span />
        <span />
        <span className="active" />
      </div>

    </main>
  )
}
