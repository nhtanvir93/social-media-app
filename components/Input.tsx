import React, { ReactNode } from 'react'
import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native'

import { theme } from '@/constants/theme'
import { heightPercentage } from '@/helpers/common'

type Props = {
  placeholder: string
  containerStyle?: ViewStyle
  icon?: ReactNode
} & TextInputProps

const Input = ({ containerStyle, icon, ...props }: Props) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {icon}
      <TextInput
        style={styles.input}
        placeholderTextColor={theme.colors.textLight}
        {...props}
      />
    </View>
  )
}

export default Input

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: heightPercentage(7.2),
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 0.4,
    borderColor: theme.colors.textLight,
    borderRadius: theme.radius.xl,
    paddingHorizontal: 18,
    gap: 12,
  },
  input: {
    flex: 1,
  },
})
