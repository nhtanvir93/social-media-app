import { Stack, useRouter } from 'expo-router'
import React, { useEffect } from 'react'

import { AuthProvider } from '@/contexts/Auth'
import { useAuth } from '@/hooks/useAuth'
import { getCurrentUserProfile } from '@/utils/databases/userProfile'

const RootLayout = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  )
}

const MainLayout = () => {
  const router = useRouter()
  const { userProfile, setUserProfile } = useAuth()

  useEffect(() => {
    const setCurrentUserProfile = async () => {
      const currentUserProfile = await getCurrentUserProfile()

      if (currentUserProfile) {
        setUserProfile(currentUserProfile)
      } else {
        setUserProfile(null)
      }
    }

    setCurrentUserProfile()
  }, [setUserProfile])

  useEffect(() => {
    if (userProfile) {
      router.replace('/home')
    } else if (userProfile === null) {
      router.replace('/welcome')
    }
  }, [router, userProfile])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  )
}

export default RootLayout
