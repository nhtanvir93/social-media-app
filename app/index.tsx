import { useRouter } from 'expo-router'
import React from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'

import ScreenWrapper from '@/components/ScreenWrapper'

const Home = () => {
  const router = useRouter()

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text>Home</Text>
        <Button title="welcome" onPress={() => router.push('/welcome')} />
      </View>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
