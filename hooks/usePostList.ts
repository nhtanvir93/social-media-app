import {
  RealtimePostgresChangesPayload,
  RealtimePostgresInsertPayload,
} from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'

import { supabase } from '@/lib/supabase'
import { fetchPosts, getPostListExtras, PostRowForList } from '@/utils/databases/post'
import { Database } from '@/utils/databases/types/database.types'

type PostRowWithoutUser = Database['public']['Tables']['posts']['Row']
type PostLikeRow = Database['public']['Tables']['postLikes']['Row']
type PostCommentRow = Database['public']['Tables']['comments']['Row']

const LIMIT = 2

const usePostList = ({
  userId,
  onlyMe = false,
}: {
  userId?: string
  onlyMe?: boolean
}) => {
  const [posts, setPosts] = useState<PostRowForList[]>([])
  const [hasMorePosts, setHasMorePosts] = useState(true)

  const postIdsRef = useRef(new Set<string>())
  const postLikeIdsRef = useRef(new Set<string>())
  const postCommentIdsRef = useRef(new Set<string>())

  const offsetRef = useRef(0)

  const getNewPostsOnly = (newUnfilteredPosts: PostRowForList[]) => {
    const newPosts: PostRowForList[] = []

    for (const post of newUnfilteredPosts) {
      if (!postIdsRef.current.has(post.id)) {
        postIdsRef.current.add(post.id)
        newPosts.push(post)

        post.likeIds.forEach((likeId) => postLikeIdsRef.current.add(likeId))
        post.commentIds.forEach((commentId) => postCommentIdsRef.current.add(commentId))
      }
    }

    return newPosts
  }

  const updatePosts = useCallback(async () => {
    if (!userId || !hasMorePosts) {
      return
    }

    const result = await fetchPosts(userId, offsetRef.current, LIMIT, onlyMe)

    if (!result.success) {
      setHasMorePosts(false)
      return
    }

    if (result.data.length > 0) {
      const newPosts = getNewPostsOnly(result.data)

      if (newPosts.length === 0) {
        return
      }

      offsetRef.current += newPosts.length
      setPosts((prev) => [...prev, ...newPosts])
    } else {
      setHasMorePosts(false)
    }
  }, [userId, hasMorePosts, onlyMe])

  const handlePostEvent = useCallback(
    async (payload: RealtimePostgresChangesPayload<PostRowWithoutUser>) => {
      const { eventType, new: newPost } = payload

      if (!('userId' in newPost)) return

      const extraInfo = await getPostListExtras(newPost.id, newPost.userId)

      if (!extraInfo.success) return

      const newPostWithExtras: PostRowForList = {
        ...newPost,
        ...extraInfo.data,
      }

      switch (eventType) {
        case 'INSERT':
          offsetRef.current++
          setPosts((prev) => [newPostWithExtras, ...prev])
          break
      }
    },
    [],
  )

  const handlePostLikeInsertEvent = useCallback(
    async (payload: RealtimePostgresInsertPayload<PostLikeRow>) => {
      const { new: newPostLike } = payload

      if (postLikeIdsRef.current.has(newPostLike.id)) {
        return
      }

      setPosts((prevPosts) =>
        prevPosts.map((prevPost) => {
          if (prevPost.id !== newPostLike.postId) {
            return prevPost
          }

          postLikeIdsRef.current.add(newPostLike.id)

          return {
            ...prevPost,
            likesCount: prevPost.likesCount + 1,
            isLiked: newPostLike.userId === userId ? true : prevPost.isLiked,
          }
        }),
      )
    },
    [setPosts, userId],
  )

  const handlePostLikeDeleteEvent = useCallback(
    async (payload: RealtimePostgresInsertPayload<PostLikeRow>) => {
      const { new: deletedPostLike } = payload

      if (!postLikeIdsRef.current.has(deletedPostLike.id)) {
        return
      }

      setPosts((prevPosts) =>
        prevPosts.map((prevPost) => {
          if (prevPost.id !== deletedPostLike.postId) {
            return prevPost
          }

          postLikeIdsRef.current.delete(deletedPostLike.id)

          return {
            ...prevPost,
            likesCount: prevPost.likesCount - 1,
            isLiked: deletedPostLike.userId === userId ? false : prevPost.isLiked,
          }
        }),
      )
    },
    [setPosts, userId],
  )

  const handlePostCommentInsertEvent = useCallback(
    async (payload: RealtimePostgresInsertPayload<PostCommentRow>) => {
      const { new: newPostComment } = payload

      if (postCommentIdsRef.current.has(newPostComment.id)) {
        return
      }

      setPosts((prevPosts) =>
        prevPosts.map((prevPost) => {
          if (prevPost.id !== newPostComment.postId) {
            return prevPost
          }

          postCommentIdsRef.current.add(newPostComment.id)

          return {
            ...prevPost,
            commentsCount: prevPost.commentsCount + 1,
            commentIds: [...prevPost.commentIds, newPostComment.id],
          }
        }),
      )
    },
    [setPosts],
  )

  const handlePostCommentDeleteEvent = useCallback(
    async (payload: RealtimePostgresInsertPayload<PostCommentRow>) => {
      const { new: deletedPostComment } = payload

      if (!postCommentIdsRef.current.has(deletedPostComment.id)) {
        return
      }

      setPosts((prevPosts) =>
        prevPosts.map((prevPost) => {
          if (prevPost.id !== deletedPostComment.postId) {
            return prevPost
          }

          postCommentIdsRef.current.delete(deletedPostComment.id)

          return {
            ...prevPost,
            commentsCount: prevPost.commentsCount - 1,
            commentIds: prevPost.commentIds.filter(
              (commentId) => commentId !== deletedPostComment.id,
            ),
          }
        }),
      )
    },
    [setPosts],
  )

  useEffect(() => {
    updatePosts()

    const channel = supabase
      .channel('realtime:posts-app')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        handlePostEvent,
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'postLikes' },
        handlePostLikeInsertEvent,
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'deletedPostLikes' },
        handlePostLikeDeleteEvent,
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        handlePostCommentInsertEvent,
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'deletedComments' },
        handlePostCommentDeleteEvent,
      )
      .subscribe((status) => {
        console.log('Realtime status (posts):', status)

        if (status === 'SUBSCRIBED') {
          console.log('✅ Connected to realtime (posts)')
        }

        if (status === 'CHANNEL_ERROR') {
          console.log('❌ Channel error (posts)')
        }

        if (status === 'TIMED_OUT') {
          console.log('⏱️ Subscription timed out (posts)')
        }

        if (status === 'CLOSED') {
          console.log('🔌 Channel closed (posts)')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [
    updatePosts,
    handlePostEvent,
    handlePostLikeInsertEvent,
    handlePostLikeDeleteEvent,
    handlePostCommentInsertEvent,
    handlePostCommentDeleteEvent,
  ])

  return {
    posts,
    updatePosts,
    hasMorePosts,
  }
}

export default usePostList
