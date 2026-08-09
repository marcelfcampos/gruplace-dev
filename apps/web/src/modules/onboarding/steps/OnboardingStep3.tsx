import './OnboardingStep3.css'

export function OnboardingStep3({
  onBack,
}: {
  onBack: () => void
}) {

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

          <button
            type="button"
            className="step3-shopping-card selected"
          >
            <div className="step3-shopping-icon">
              G
            </div>

            <div className="step3-shopping-info">
              <strong>
                Shopping Exemplo
              </strong>

              <span>
                Florianópolis · SC
              </span>
            </div>

            <span className="step3-check">
              ✓
            </span>
          </button>

          <button
            type="button"
            className="step3-shopping-card"
          >
            <div className="step3-shopping-icon">
              G
            </div>

            <div className="step3-shopping-info">
              <strong>
                Outro Shopping
              </strong>

              <span>
                Florianópolis · SC
              </span>
            </div>
          </button>

        </div>

        <button
          className="step3-button"
          type="button"
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
