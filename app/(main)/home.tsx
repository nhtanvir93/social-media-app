import React from 'react'
import { StyleSheet, Text } from 'react-native'

import ScreenWrapper from '@/components/ScreenWrapper'

const Home = () => {
  return (
    <ScreenWrapper withHeader={false}>
      <Text style={styles.title}>Home</Text>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  title: {
    fontWeight: 900,
  },
})
