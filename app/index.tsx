import React from 'react'
import { StyleSheet, View } from 'react-native'

import Loading from '@/components/Loading'
import ScreenWrapper from '@/components/ScreenWrapper'

const index = () => {
  return (
    <ScreenWrapper withHeader={false}>
      <View style={styles.container}>
        <Loading />
      </View>
    </ScreenWrapper>
  )
}

export default index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
