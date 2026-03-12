import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import ScreenWrapper from '@/components/ScreenWrapper'

const welcome = () => {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text>Welcome</Text>
      </View>
    </ScreenWrapper>
  )
}

export default welcome

const styles = StyleSheet.create({
  container: {
    color: 'orange',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
})
