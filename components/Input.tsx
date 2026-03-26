import React, { ReactNode } from 'react'
import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native'

import { theme } from '@/constants/theme'
import { heightPercentage } from '@/helpers/common'

type Props = {
  placeholder?: string
  containerStyle?: ViewStyle
  icon?: ReactNode
} & TextInputProps

const Input = ({ containerStyle, icon, multiline, ...props }: Props) => {
  return (
    <View
      style={[styles.container, multiline && styles.multilineContainer, containerStyle]}
    >
      {icon}
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        placeholderTextColor={theme.colors.textLight}
        multiline={multiline}
        {...props}
      />
    </View>
  )
}

export default Input

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: heightPercentage(7.2),
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: theme.colors.textLight,
    borderRadius: theme.radius.md,
    paddingHorizontal: 18,
    paddingVertical: 8,
    gap: 4,
  },
  multilineContainer: {
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    fontSize: heightPercentage(1.8),
    color: theme.colors.text,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
})
