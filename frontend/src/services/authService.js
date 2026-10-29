
const API_URL = 'http://127.0.0.1:5000/api/auth'

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Login failed')
  }

  localStorage.setItem('token', result.token)
  localStorage.setItem('user', JSON.stringify(result.data))

  return result.data
}

export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Registration failed')
  }

  return result
}

export function logoutUser() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
