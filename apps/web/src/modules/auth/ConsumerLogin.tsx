import { useState } from 'react'

import { supabase } from '../../lib/supabase'

export function ConsumerLogin({
  onLogin,
}: {
  onLogin: () => void
}) {

  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')

  async function handleLogin() {

    setLoading(true)

    setError('')

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onLogin()
  }

  return (

    <main>

      <h1>Entrar no Gruplace</h1>

      <input
        type="email"
        placeholder="Seu e-mail"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <input
        type="password"
        placeholder="Sua senha"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button
        type="button"
        onClick={() => void handleLogin()}
        disabled={loading}
      >
        {loading ? 'ENTRANDO...' : 'ENTRAR'}
      </button>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

    </main>

  )
}
