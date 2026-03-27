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
  Text,
  View,
} from 'react-native'

import BackButton from '@/components/BackButton'
import Comment from '@/components/Comment'
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
  createPostLike,
  deletePostComment,
  deletePostLike,
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

  const handleToggleLikeOptimistic = async () => {
    if (!postDetails || !userProfile) return

    const wasLiked = postDetails.isLiked

    setPostDetails((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        isLiked: !prev.isLiked,
        likesCount: prev.likesCount + (wasLiked ? -1 : 1),
      }
    })

    try {
      if (wasLiked) {
        await deletePostLike(postDetails.id, userProfile.id)
      } else {
        await createPostLike({
          postId: postDetails.id,
          userId: userProfile.id,
        })
      }
    } catch (err) {
      console.error('Like failed', err)

      setPostDetails((prev) => {
        if (!prev) return prev

        return {
          ...prev,
          isLiked: !prev.isLiked,
          likesCount: prev.likesCount + (wasLiked ? 1 : -1),
        }
      })
    }
  }

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

  const deleteComment = async (comment: CommentRow) => {
    if (!userProfile || !postDetails) {
      return
    }

    if (comment.author.id !== userProfile.id && postDetails.user.id !== userProfile.id) {
      Alert.alert('Warning', 'You are not allowed to delete this comment!!!')
      return
    }

    try {
      await deletePostComment(comment.id)

      setComments((prevComments) =>
        prevComments.filter((oldComment) => oldComment.id !== comment.id),
      )
    } catch (error) {
      console.log('Error occured while removing comment', error)
      Alert.alert(
        'Failed to remove comment',
        'Something went wrong while removing comment. Please try again',
      )
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
            <PostCard
              post={postDetails}
              router={router}
              onToggleLike={handleToggleLikeOptimistic}
            />
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
            <View style={styles.comments}>
              {comments.length === 0 && (
                <Text style={styles.emptyCommentMsg}>Be first to comment!</Text>
              )}
              {comments.map((postComment) => (
                <Comment
                  key={postComment.id}
                  postUserId={postDetails.user.id}
                  currentUser={userProfile}
                  comment={postComment}
                  onDelete={(comment: CommentRow) => deleteComment(comment)}
                />
              ))}
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
  emptyCommentMsg: {
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: 2,
  },
  comments: {
    gap: 8,
  },
})
