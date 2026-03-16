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
  const { user: loggedInUser, setUser } = useAuth()

  useEffect(() => {
    const setCurrentUser = async () => {
      const user = await getCurrentUser()

      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
    }

    setCurrentUser()
  }, [setUser])

  useEffect(() => {
    if (loggedInUser) {
      router.replace('/home')
    } else if (loggedInUser === null) {
      router.replace('/welcome')
    }
  }, [router, loggedInUser])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  )
}

export default RootLayout
