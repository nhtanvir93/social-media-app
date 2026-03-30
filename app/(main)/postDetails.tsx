import EvilIcons from '@expo/vector-icons/EvilIcons'
import Feather from '@expo/vector-icons/Feather'
import { RealtimePostgresInsertPayload } from '@supabase/supabase-js'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { generatePostgresTimestamp, heightPercentage } from '@/helpers/common'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import {
  CommentRow,
  createPostComment,
  deletePostComment,
  fetchPostDetails,
  PostRowForList,
} from '@/utils/databases/post'
import { Database } from '@/utils/databases/types/database.types'
import { getUserProfile } from '@/utils/databases/userProfile'

type PostLikeRow = Database['public']['Tables']['postLikes']['Row']
type PostCommentRow = Database['public']['Tables']['comments']['Row']

const PostDetails = () => {
  const [postDetails, setPostDetails] = useState<PostRowForList | null>(null)
  const [comments, setComments] = useState<CommentRow[]>([])

  const [comment, setComment] = useState('')

  const postLikeIdsRef = useRef(new Set<string>())
  const postCommentIdsRef = useRef(new Set<string>())

  const { userProfile } = useAuth()
  const router = useRouter()
  const { postId } = useLocalSearchParams<{ postId: string }>()

  const updatePostDetails = useCallback(async () => {
    if (!userProfile?.id || !postId) return

    const response = await fetchPostDetails(postId, userProfile.id)

    if (response.success) {
      const { comments: newComments, ...newPostDetails } = response.data
      setPostDetails(newPostDetails)
      setComments(newComments)

      newPostDetails.likeIds?.forEach((likeId) => postLikeIdsRef.current.add(likeId))
      newPostDetails.commentIds?.forEach((commentId) =>
        postCommentIdsRef.current.add(commentId),
      )
    } else {
      setPostDetails(null)
      setComments([])

      postLikeIdsRef.current.clear()
      postCommentIdsRef.current.clear()
    }
  }, [userProfile?.id, postId])

  const handlePostLikeInsertEvent = useCallback(
    async (payload: RealtimePostgresInsertPayload<PostLikeRow>) => {
      console.log('New Like Added')

      if (!userProfile?.id) {
        return
      }

      const { new: newPostLike } = payload
      console.log(
        `Same User = ${newPostLike.userId === userProfile.id}`,
        'newPostLike',
        newPostLike,
      )

      if (
        postLikeIdsRef.current.has(newPostLike.id) ||
        newPostLike.userId === userProfile.id
      ) {
        return
      }

      postLikeIdsRef.current.add(newPostLike.id)

      setPostDetails((prevPostDetails) => {
        if (!prevPostDetails) {
          return null
        }

        return {
          ...prevPostDetails,
          likesCount: prevPostDetails.likesCount + 1,
        }
      })
    },
    [setPostDetails, userProfile?.id],
  )

  const handlePostLikeDeleteEvent = useCallback(
    async (payload: RealtimePostgresInsertPayload<PostLikeRow>) => {
      console.log('Old Like Deleted')

      if (!userProfile?.id) {
        return
      }

      const { new: deletedPostLike } = payload
      console.log(
        `Same User = ${deletedPostLike.userId === userProfile.id}`,
        'deletedPostLike',
        deletedPostLike,
      )

      if (
        !postLikeIdsRef.current.has(deletedPostLike.id) ||
        deletedPostLike.userId === userProfile.id
      ) {
        return
      }

      postLikeIdsRef.current.delete(deletedPostLike.id)

      setPostDetails((prevPostDetails) => {
        if (!prevPostDetails) {
          return null
        }

        return {
          ...prevPostDetails,
          likesCount: prevPostDetails.likesCount - 1,
        }
      })
    },
    [setPostDetails, userProfile?.id],
  )

  const handlePostCommentInsertEvent = useCallback(
    async (payload: RealtimePostgresInsertPayload<PostCommentRow>) => {
      if (!userProfile?.id) {
        return
      }

      const { new: newPostComment } = payload

      if (
        postCommentIdsRef.current.has(newPostComment.id) ||
        newPostComment.userId === userProfile.id
      ) {
        return
      }

      const author = await getUserProfile(newPostComment.userId)

      if (!author) {
        return
      }

      const newComment = {
        id: newPostComment.id,
        text: newPostComment.text,
        createdAt: newPostComment.createdAt,
        author,
      }

      postCommentIdsRef.current.add(newPostComment.id)

      setPostDetails((prevPostDetails) => {
        if (!prevPostDetails) {
          return null
        }

        return {
          ...prevPostDetails,
          commentsCount: prevPostDetails.commentsCount + 1,
        }
      })

      setComments((prevComments) => {
        if (!prevComments) {
          return []
        }

        return [...prevComments, newComment]
      })
    },
    [setPostDetails, userProfile?.id],
  )

  const handlePostCommentDeleteEvent = useCallback(
    async (payload: RealtimePostgresInsertPayload<PostCommentRow>) => {
      console.log('Delete Comment')

      if (!userProfile?.id) {
        return
      }

      const { new: deletedPostComment } = payload
      console.log(deletedPostComment)

      if (
        !postCommentIdsRef.current.has(deletedPostComment.id) ||
        deletedPostComment.userId === userProfile.id
      ) {
        return
      }

      setPostDetails((prevPostDetails) => {
        if (!prevPostDetails) {
          return null
        }

        postCommentIdsRef.current.delete(deletedPostComment.id)

        return {
          ...prevPostDetails,
          commentsCount: prevPostDetails.commentsCount - 1,
        }
      })

      setComments((prevComments) => {
        if (!prevComments) {
          return []
        }

        return prevComments.filter(
          (prevComment) => prevComment.id !== deletedPostComment.id,
        )
      })
    },
    [setPostDetails, userProfile?.id],
  )

  useEffect(() => {
    console.log('PostDetails', postDetails)
  }, [postDetails])

  useEffect(() => {
    updatePostDetails()

    const channel = supabase
      .channel('realtime:posts-details')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'postLikes',
          filter: `postId=eq.${postDetails?.id}`,
        },
        handlePostLikeInsertEvent,
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deletedPostLikes',
          filter: `postId=eq.${postDetails?.id}`,
        },
        handlePostLikeDeleteEvent,
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `postId=eq.${postDetails?.id}`,
        },
        handlePostCommentInsertEvent,
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deletedComments',
          filter: `postId=eq.${postDetails?.id}`,
        },
        handlePostCommentDeleteEvent,
      )
      .subscribe((status) => {
        console.log('Realtime status (postDetails):', status)

        if (status === 'SUBSCRIBED') {
          console.log('✅ Connected to realtime (postDetails)')
        }

        if (status === 'CHANNEL_ERROR') {
          console.log('❌ Channel error (postDetails)')
        }

        if (status === 'TIMED_OUT') {
          console.log('⏱️ Subscription timed out (postDetails)')
        }

        if (status === 'CLOSED') {
          console.log('🔌 Channel closed (postDetails)')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [
    updatePostDetails,
    handlePostLikeInsertEvent,
    handlePostLikeDeleteEvent,
    handlePostCommentInsertEvent,
    handlePostCommentDeleteEvent,
    postDetails?.id,
  ])

  const addComment = async () => {
    if (!postDetails || !userProfile) {
      return
    }

    const newComment = comment.trim()

    if (newComment.length === 0) {
      Alert.alert('Empty Comment', 'Please enter a comment before submitting.')
      return
    }

    const oldComments = [...comments]
    const uniqueStr = String(Date.now())

    setComment('')

    setPostDetails((prevPostDetails) => {
      if (!prevPostDetails) {
        return null
      }

      return {
        ...prevPostDetails,
        commentsCount: prevPostDetails.commentsCount + 1,
      }
    })

    setComments((prevComments) => {
      if (!prevComments) {
        return []
      }

      return [
        ...prevComments,
        {
          id: uniqueStr,
          text: newComment,
          createdAt: generatePostgresTimestamp(),
          author: {
            id: userProfile.id,
            name: userProfile.name,
            image: userProfile.image,
          },
        },
      ]
    })

    try {
      const newCommentDetails = await createPostComment({
        postId: postDetails.id,
        userId: userProfile.id,
        text: newComment,
      })

      setPostDetails((prevPostDetails) => {
        if (!prevPostDetails) {
          return null
        }

        postCommentIdsRef.current.add(newCommentDetails.id)

        return {
          ...prevPostDetails,
          commentIds: [...prevPostDetails.commentIds, newCommentDetails.id],
        }
      })

      setComments((prevComments) =>
        prevComments.map((postComment) => {
          if (postComment.id !== uniqueStr) {
            return postComment
          }

          return newCommentDetails
        }),
      )
    } catch (error) {
      setComment(newComment)

      setPostDetails((prevPostDetails) => {
        if (!prevPostDetails) {
          return null
        }

        return {
          ...prevPostDetails,
          commentsCount: prevPostDetails.commentsCount - 1,
        }
      })
      setComments(oldComments)
      console.error('Add comment error:', error)

      Alert.alert(
        'Failed to Post Comment',
        'Something went wrong while saving your comment. Please try again.',
      )
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

    const oldComments = [...comments]

    try {
      setPostDetails((prevPostDetails) => {
        if (!prevPostDetails) {
          return null
        }

        postCommentIdsRef.current.delete(comment.id)

        return {
          ...prevPostDetails,
          commentsCount: prevPostDetails.commentsCount - 1,
          commentIds: prevPostDetails.commentIds?.filter(
            (commentId) => commentId !== comment.id,
          ),
        }
      })

      setComments((prevComments) =>
        prevComments.filter((oldComment) => oldComment.id !== comment.id),
      )

      await deletePostComment(comment.id)
    } catch (error) {
      setPostDetails((prevPostDetails) => {
        if (!prevPostDetails) {
          return null
        }

        postCommentIdsRef.current.add(comment.id)

        return {
          ...prevPostDetails,
          commentsCount: prevPostDetails.commentsCount + 1,
          commentIds: prevPostDetails.commentIds
            ? [...prevPostDetails.commentIds, comment.id]
            : prevPostDetails.commentIds,
        }
      })

      setComments(oldComments)

      console.log('Error occured while removing comment', error)
      Alert.alert(
        'Failed to remove comment',
        'Something went wrong while removing comment. Please try again',
      )
    }
  }

  if (!postDetails || !userProfile) {
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
            <PostCard post={postDetails} router={router} isCommentClickable={false} />
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
              <Pressable
                style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.6 }]}
                onPress={addComment}
              >
                <Feather name="send" size={20} color={theme.colors.primary} />
              </Pressable>
            </View>
            <View style={styles.comments}>
              {comments.length === 0 && (
                <Text style={styles.emptyCommentMsg}>Be first to comment!</Text>
              )}
              {comments.map((postComment) => (
                <Comment
                  currentUser={userProfile}
                  key={postComment.id}
                  postUserId={postDetails.user.id}
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
