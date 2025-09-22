"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signOut } from "firebase/auth"
import { auth, hasRealCredentials } from "./firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  isDevMode: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  isDevMode: false,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hasRealCredentials && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user)
        setLoading(false)
      })
      return unsubscribe
    } else {
      setLoading(false)
    }
  }, [])

  const logout = async () => {
    if (hasRealCredentials && auth) {
      await signOut(auth)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        isDevMode: !hasRealCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
