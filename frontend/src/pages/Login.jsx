
import { useState } from 'react'
import { loginUser, registerUser } from '../services/authService'

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('buyer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        await registerUser({
          full_name: fullName,
          email,
          password,
          role,
        })

        setIsRegister(false)
        setError('Registration successful! Please log in.')
        setPassword('')
      } else {
        const user = await loginUser(email, password)
        onLogin(user)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">W</div>
        <h1>WholesaleHub</h1>
        <p className="auth-subtitle">
          {isRegister ? 'Create your business account' : 'Welcome back! Please log in.'}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                maxLength={100}
                placeholder="Enter your full name"
              />
            </>
          )}

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="you@example.com"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            maxLength={72}
            placeholder="At least 8 characters"
          />

          {isRegister && (
            <>
              <label htmlFor="role">Account type</label>
              <select
                id="role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="buyer">Buyer</option>
                <option value="supplier">Supplier</option>
              </select>
            </>
          )}

          {error && <p className="auth-message" role="status">{error}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : isRegister
                ? 'Create account'
                : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
            }}
          >
            {isRegister ? 'Log in' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
