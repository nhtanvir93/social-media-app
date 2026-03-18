import { Stack, useRouter } from 'expo-router'
import React, { useEffect, useRef } from 'react'

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
  const userEmail = useRef('')

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
    if (
      userProfile === undefined ||
      (userProfile && userEmail.current === userProfile.email)
    ) {
      return
    }

    if (userProfile) {
      userEmail.current = userProfile.email
      router.replace('/home')
    } else if (!userProfile) {
      userEmail.current = ''
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
