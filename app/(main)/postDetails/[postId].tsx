import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { View } from 'react-native'

import Header from '@/components/Header'
import ScreenWrapper from '@/components/ScreenWrapper'

const PostDetails = () => {
  const { postId } = useLocalSearchParams<{ postId: string }>()

  return (
    <ScreenWrapper withHeader={false}>
      <View>
        <Header title="Post Details" />
      </View>
    </ScreenWrapper>
  )
}

export default PostDetails
