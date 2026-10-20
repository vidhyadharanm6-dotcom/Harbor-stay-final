import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '@exp1/api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('harborstay-token'))
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('harborstay-user') || 'null'))

  // (a) login API call. Success: { ok: true }, fail: { ok: false, error }
  const login = useCallback(async (email, password, names = {}) => {
    try {
      const { data } = await api.post('/login', { email: email.trim().toLowerCase(), password })
      const u = { ...data.user, ...names }
      localStorage.setItem('harborstay-token', data.token) // (b) token store
      localStorage.setItem('harborstay-user', JSON.stringify(u))
      setToken(data.token)
      setUser(u)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.response?.data?.message || 'Login failed. Is the server running?' }
    }
  }, [])

  // server-la separate signup illa, so same login API-ah use pannum
  const signup = useCallback(
    (firstName, lastName, email, password) =>
      login(email, password, { firstName: firstName.trim(), lastName: lastName.trim() }),
    [login]
  )

  // (e) logout
  const logout = useCallback(() => {
    localStorage.removeItem('harborstay-token')
    localStorage.removeItem('harborstay-user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}