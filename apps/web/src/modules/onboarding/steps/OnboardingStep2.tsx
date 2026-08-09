import { useState } from 'react'
import './OnboardingStep2.css'

export function OnboardingStep2({
  onContinue,
  onBack,
}: {
  onContinue: () => void
  onBack: () => void
}) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const interests = [
    'Moda',
    'Gastronomia',
    'Tecnologia',
    'Beleza',
    'Casa',
    'Lazer',
  ]

  function toggleInterest(interest: string) {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    )
  }

  return (
    <main className="onboarding-step2">

      <button
        className="step2-back"
        type="button"
        onClick={onBack}
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
          {interests.map((interest) => (
            <button
              key={interest}
              type="button"
              className={`step2-interest ${
                selectedInterests.includes(interest)
                  ? 'selected'
                  : ''
              }`}
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </button>
          ))}
        </div>

        <button
          className="step2-button"
          type="button"
          onClick={onContinue}
        >
          CONTINUAR
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
