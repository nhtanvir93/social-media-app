import Ionicons from '@expo/vector-icons/Ionicons'
import { Router } from 'expo-router'
import React, { ComponentProps } from 'react'
import { Pressable, StyleSheet } from 'react-native'

import { theme } from '@/constants/theme'

const BackButton = ({
  size = 24,
  color = '#000',
  router,
}: {
  size?: number
  color?: ComponentProps<typeof Ionicons>['color']
  router: Router
}) => {
  return (
    <Pressable style={styles.button} onPress={() => router.back()}>
      <Ionicons name="chevron-back" size={size} color={color} />
    </Pressable>
  )
}

export default BackButton

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    padding: 5,
    borderRadius: theme.radius.xs,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
})
