import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'

import Header from '@/components/Header'
import Loading from '@/components/Loading'
import PostCard from '@/components/PostCard'
import ScreenWrapper from '@/components/ScreenWrapper'
import { heightPercentage } from '@/helpers/common'
import { useAuth } from '@/hooks/useAuth'
import { CommentRow, fetchPostDetails, PostRowForList } from '@/utils/databases/post'

const PostDetails = () => {
  const [postDetails, setPostDetails] = useState<PostRowForList | null>(null)
  const [comments, setComments] = useState<CommentRow[]>([])
  const [loading, setLoading] = useState(true)

  const { userProfile } = useAuth()
  const router = useRouter()
  const { postId } = useLocalSearchParams<{ postId: string }>()

  const updatePostDetails = useCallback(async () => {
    if (!userProfile || !postId) return

    setLoading(true)

    const response = await fetchPostDetails(postId, userProfile.id)

    if (response.success) {
      const { comments: newComments, ...rest } = response.data
      setPostDetails(rest)
      setComments(newComments)
    } else {
      setPostDetails(null)
      setComments([])
    }

    setLoading(false)
  }, [userProfile, postId])

  useEffect(() => {
    updatePostDetails()
  }, [updatePostDetails])

  if (!postDetails || !userProfile || loading) {
    return (
      <View style={styles.loaderContainer}>
        <Loading />
      </View>
    )
  }

  return (
    <ScreenWrapper withHeader={false}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View>
          <Header title="Post Details" />
        </View>

        <View style={styles.contentContainer}>
          <PostCard post={postDetails} currentUser={userProfile} router={router} />
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  )
}

export default PostDetails

const styles = StyleSheet.create({
  keyboardAvoidingWrapper: {
    flex: 1,
  },
  contentContainer: {
    marginTop: heightPercentage(7),
  },
  loaderContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
