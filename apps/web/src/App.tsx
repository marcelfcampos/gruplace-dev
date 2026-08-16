import { useEffect, useState } from 'react'
import { SplashPage } from './modules/splash/SplashPage'
import { OnboardingPage } from './modules/onboarding/OnboardingPage'
import { OnboardingStep2 } from './modules/onboarding/steps/OnboardingStep2'
import { OnboardingStep3 } from './modules/onboarding/steps/OnboardingStep3'
import { ConsumerFeed } from './modules/consumer/feed/ConsumerFeed'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [step, setStep] = useState(1)
  const [selectedShoppingId, setSelectedShoppingId] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false)
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashPage />
  }

  if (step === 2) {
    return (
      <OnboardingStep2
        onContinue={() => setStep(3)}
        onBack={() => setStep(1)}
      />
    )
  }

  if (step === 3) {
    return (
      <OnboardingStep3
        onBack={() => setStep(2)}
        onContinue={(shoppingId) => {
          setSelectedShoppingId(shoppingId)
          setStep(4)
        }}
      />
    )
  }



if (step === 4) {
  return (
    <ConsumerFeed
      shoppingId={selectedShoppingId}
    />
  )
}


  return (
    <OnboardingPage
      onStart={() => setStep(2)}
    />
  )
}

export default App
