import { ResizeMode, Video } from 'expo-av'
import { Image } from 'expo-image'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { heightPercentage } from '@/helpers/common'

const FilePreview = ({ fileUrl }: { fileUrl: string | null }) => {
  if (!fileUrl) {
    return
  }

  return (
    <View>
      {fileUrl.includes('image') && (
        <Image source={fileUrl} contentFit="cover" style={styles.filePreview} />
      )}

      {fileUrl.includes('video') && (
        <Video
          source={{ uri: fileUrl }}
          style={styles.filePreview}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
        />
      )}
    </View>
  )
}

export default FilePreview

const styles = StyleSheet.create({
  filePreview: {
    height: heightPercentage(30),
    width: '100%',
  },
})
