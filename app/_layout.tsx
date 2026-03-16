import { Stack, useRouter } from 'expo-router'
import React, { useEffect } from 'react'

import { AuthProvider } from '@/contexts/Auth'
import { useAuth } from '@/hooks/useAuth'
import { getCurrentUser } from '@/utils/databases/user'

const RootLayout = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  )
}

const MainLayout = () => {
  const router = useRouter()
  const { setUser } = useAuth()

  useEffect(() => {
    const setCurrentUser = async () => {
      const user = await getCurrentUser()

      if (user) {
        setUser(user)
        router.replace('/home')
      } else {
        setUser(null)
        router.replace('/')
      }
    }

    setCurrentUser()
  }, [router, setUser])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  )
}

export default RootLayout
