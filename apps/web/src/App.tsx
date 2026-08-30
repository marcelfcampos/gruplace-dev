import { useEffect, useState } from 'react'

import { supabase } from './lib/supabase'

import { SplashPage } from './modules/splash/SplashPage'
import { OnboardingPage } from './modules/onboarding/OnboardingPage'
import { OnboardingStep2 } from './modules/onboarding/steps/OnboardingStep2'
import { OnboardingStep3 } from './modules/onboarding/steps/OnboardingStep3'
import { ConsumerFeed } from './modules/consumer/feed/ConsumerFeed'
import { ConsumerLogin } from './modules/auth/ConsumerLogin'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [step, setStep] = useState(1)

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  const [selectedShoppingId, setSelectedShoppingId] = useState<string | null>(
    null
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false)
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setIsAuthenticated(!!session)
      setAuthLoading(false)
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (showSplash) {
    return <SplashPage />
  }

  if (authLoading) {
    return (
      <main>
        <p>Carregando...</p>
      </main>
    )
  }

  /*
   * STEP 1
   * Apresentação
   */
  if (step === 1) {
    return (
      <OnboardingPage
        onStart={() => {
          if (isAuthenticated) {
            setStep(3)
          } else {
            setStep(2)
          }
        }}
      />
    )
  }

  /*
   * STEP 2
   * Login
   */
  if (step === 2) {
    return (
      <ConsumerLogin
        onLogin={() => {
          setIsAuthenticated(true)
          setStep(3)
        }}
      />
    )
  }

  /*
   * STEP 3
   * Interesses
   */
  if (step === 3) {
    return (
      <OnboardingStep2
        onContinue={() => {
          setStep(4)
        }}
        onBack={() => {
          if (isAuthenticated) {
            setStep(1)
          } else {
            setStep(2)
          }
        }}
      />
    )
  }

  /*
   * STEP 4
   * Escolha do shopping
   */
  if (step === 4) {
    return (
      <OnboardingStep3
        onBack={() => {
          setStep(3)
        }}
        onContinue={async (shoppingId) => {
          console.log('STEP 4 → CONTINUAR')
          console.log('Shopping selecionado:', shoppingId)

          const {
            data: { user },
          } = await supabase.auth.getUser()

          console.log('Usuário autenticado:', user?.id)

          if (!user) {
            console.error('Nenhum usuário autenticado.')
            return
          }

          try {
            const { error } = await supabase
              .from('user_shopping_preferences')
              .upsert(
                {
                  user_id: user.id,
                  shopping_center_id: shoppingId,
                  is_primary: true,
                },
                {
                  onConflict: 'user_id,shopping_center_id',
                }
              )

            console.log('Resultado do UPSERT:', { error })

            if (error) {
              console.error('ERRO DO UPSERT:', error)
              return
            }
          } catch (upsertError) {
            console.error('EXCEÇÃO NO UPSERT:', upsertError)
            return
          }

          console.log('Preferência de shopping salva com sucesso.')

          setSelectedShoppingId(shoppingId)
          setStep(5)
        }}
      />
    )
  }

  /*
   * STEP 5
   * Feed
   */
  if (step === 5) {
    return <ConsumerFeed shoppingId={selectedShoppingId} />
  }

  return null
}

export default App
