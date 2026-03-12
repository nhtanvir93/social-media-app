import React, { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ScreenWrapper = ({
  children,
  bgColor,
}: {
  children: ReactNode
  bgColor?: string
}) => {
  const { top } = useSafeAreaInsets()
  const paddingTop = top > 0 ? top + 5 : 30

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop,
          backgroundColor: bgColor,
        },
      ]}
    >
      {children}
    </View>
  )
}

export default ScreenWrapper

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
