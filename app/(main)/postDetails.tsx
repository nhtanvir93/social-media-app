import EvilIcons from '@expo/vector-icons/EvilIcons'
import Feather from '@expo/vector-icons/Feather'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

import BackButton from '@/components/BackButton'
import Input from '@/components/Input'
import Loading from '@/components/Loading'
import PostCard from '@/components/PostCard'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import { heightPercentage } from '@/helpers/common'
import { useAuth } from '@/hooks/useAuth'
import {
  CommentRow,
  createPostComment,
  fetchPostDetails,
  PostRowForList,
} from '@/utils/databases/post'

const PostDetails = () => {
  const [postDetails, setPostDetails] = useState<PostRowForList | null>(null)
  const [comments, setComments] = useState<CommentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingComment, setLoadingComment] = useState(false)

  const [comment, setComment] = useState('')

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

  const addComment = async () => {
    if (!postDetails || !userProfile) {
      return
    }

    const newComment = comment.trim()

    if (newComment.length === 0) {
      Alert.alert('Empty Comment', 'Please enter a comment before submitting.')
      return
    }

    setLoadingComment(true)

    try {
      const newCommentDetails = await createPostComment({
        postId: postDetails.id,
        userId: userProfile.id,
        text: newComment,
      })

      setComments([...comments, newCommentDetails])
      setPostDetails((oldPostDetails) => {
        if (!oldPostDetails) return oldPostDetails

        return {
          ...oldPostDetails,
          commentsCount: oldPostDetails.commentsCount + 1,
        }
      })
      setComment('')
    } catch (error) {
      console.error('Add comment error:', error)

      Alert.alert(
        'Failed to Post Comment',
        'Something went wrong while saving your comment. Please try again.',
      )
    } finally {
      setLoadingComment(false)
    }
  }

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
        <ScrollView showsVerticalScrollIndicator={false}>
          <BackButton router={router} />
          <View style={styles.contentContainer}>
            <PostCard post={postDetails} currentUser={userProfile} router={router} />
            <View style={styles.commentInputContainer}>
              <Input
                placeholder="Type comment ..."
                containerStyle={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                icon={
                  <EvilIcons name="comment" size={24} color={theme.colors.textLight} />
                }
              />
              {loadingComment ? (
                <View style={styles.sendBtn}>
                  <Loading size="small" />
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.6 }]}
                  onPress={addComment}
                >
                  <Feather name="send" size={20} color={theme.colors.primary} />
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
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
    marginTop: heightPercentage(2),
    gap: 15,
  },
  loaderContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5,
  },
  commentInput: {
    flex: 1,
    height: heightPercentage(7.2),
  },
  sendBtn: {
    height: heightPercentage(7.2),
    paddingHorizontal: 18,
    borderWidth: 0.5,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.md,
  },
})
