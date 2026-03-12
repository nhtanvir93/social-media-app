import React from 'react'
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'

import { theme } from '@/constants/theme'
import { heightPercentage } from '@/helpers/common'

import Loading from './Loading'

type Props = {
  title: string
  btnStyle?: ViewStyle
  textStyle?: TextStyle
  onPress: () => void
  loading?: boolean
  hasShadow?: boolean
}

const Button = ({
  title,
  btnStyle,
  textStyle,
  onPress,
  loading = false,
  hasShadow = true,
}: Props) => {
  if (loading) {
    return (
      <View style={btnStyle}>
        <Loading />
      </View>
    )
  }

  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, btnStyle, hasShadow && styles.shadowStyle]}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </Pressable>
  )
}

export default Button

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    padding: heightPercentage(1.5),
    borderRadius: theme.radius.sm,
  },
  text: {
    textAlign: 'center',
    color: '#fff',
    fontSize: heightPercentage(2.6),
  },
  shadowStyle: {
    shadowColor: theme.colors.dark,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
})
