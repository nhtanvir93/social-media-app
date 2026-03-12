import React, { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ScreenWrapper = ({
  children,
  bgColor,
  withHeader = true,
}: {
  children: ReactNode
  bgColor?: string,
  withHeader?: boolean
}) => {
  const { top } = useSafeAreaInsets()
  const paddingTop = top > 0 ? top + 5 : 30
  const finalPaddingTop = withHeader ? 5 : paddingTop 

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: finalPaddingTop,
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
