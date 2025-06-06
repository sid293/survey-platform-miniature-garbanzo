'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { handleApiError } from '@/lib/error-handler'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)
      
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setUser(response.data.user)
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await apiClient.register(email, password, name)
      
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setUser(response.data.user)
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 