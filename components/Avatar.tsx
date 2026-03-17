import { Image, ImageProps } from 'expo-image'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { theme } from '@/constants/theme'
import { heightPercentage } from '@/helpers/common'
import { getUserImageSrcUrl } from '@/utils/imageUtil'

const Avatar = ({
  uri,
  size = heightPercentage(4.5),
  rounded = theme.radius.md,
  style,
}: {
  uri?: string | null
  size?: number
  rounded?: number
  style?: ImageProps['style']
}) => {
  return (
    <View style={styles.container}>
      <Image
        source={getUserImageSrcUrl(uri)}
        style={[
          styles.avatar,
          { height: size, width: size, borderRadius: rounded },
          style,
        ]}
      />
    </View>
  )
}

export default Avatar

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    borderColor: theme.colors.gray,
    borderWidth: 2,
  },
})
