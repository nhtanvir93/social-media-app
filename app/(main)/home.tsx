import React from 'react'
import { Alert, StyleSheet, Text } from 'react-native'

import Button from '@/components/Button'
import ScreenWrapper from '@/components/ScreenWrapper'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const Home = () => {
  const { setUser } = useAuth()

  const handleLogout = async () => {
    setUser(null)
    const { error } = await supabase.auth.signOut()

    if (error) {
      Alert.alert('Sign Out', error.message)
    }
  }

  return (
    <ScreenWrapper withHeader={false}>
      <Text style={styles.title}>Home</Text>
      <Button title="Sign Out" onPress={handleLogout} />
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  title: {
    fontWeight: 900,
  },
})
