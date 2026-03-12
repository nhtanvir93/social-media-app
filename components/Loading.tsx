import React from 'react'
import { ActivityIndicator, ActivityIndicatorProps, StyleSheet, View } from 'react-native'

import { theme } from '@/constants/theme'

type Props = {
  size?: ActivityIndicatorProps['size']
  color?: ActivityIndicatorProps['color']
}

const Loading = ({ size = 'large', color = theme.colors.primary }: Props) => {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}

export default Loading

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
