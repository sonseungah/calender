import { create } from 'zustand'
import type { AuthState } from '../types'
import { api, setToken, clearToken, getToken } from './api'

interface AuthStore {
  auth: AuthState | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, handle: string) => Promise<void>
  logout: () => void
  restore: () => Promise<void>
}

export const useAuth = create<AuthStore>((set) => ({
  auth: null,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setToken(data.token)
    set({ auth: { token: data.token, user: { email, streamer_id: data.streamer_id, name: data.name, handle: data.handle } } })
  },

  register: async (email, password, name, handle) => {
    const { data } = await api.post('/auth/register', { email, password, name, handle })
    setToken(data.token)
    set({ auth: { token: data.token, user: { email, streamer_id: data.streamer_id, name, handle: data.handle } } })
  },

  logout: () => {
    clearToken()
    set({ auth: null })
  },

  restore: async () => {
    const token = getToken()
    if (!token) return
    try {
      const { data } = await api.get('/auth/me')
      set({ auth: { token, user: data } })
    } catch {
      clearToken()
    }
  },
}))
