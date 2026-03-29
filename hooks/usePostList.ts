import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useCallback, useEffect, useOptimistic, useRef, useState } from 'react'

import { supabase } from '@/lib/supabase'
import { fetchPosts, getPostListExtras, PostRowForList } from '@/utils/databases/post'
import { Database } from '@/utils/databases/types/database.types'

type PostRowWithoutUser = Database['public']['Tables']['posts']['Row']

const LIMIT = 2

const usePostList = ({
  userId,
  onlyMe = false,
}: {
  userId?: string
  onlyMe?: boolean
}) => {
  const [posts, setPosts] = useState<PostRowForList[]>([])
  const [postOptimistics, setPostOptimistics] = useOptimistic(posts)
  const [hasMorePosts, setHasMorePosts] = useState(true)

  const postIdsRef = useRef(new Set<string>())
  const offsetRef = useRef(0)

  const getNewPostsOnly = (newUnfilteredPosts: PostRowForList[]) => {
    const newPosts: PostRowForList[] = []

    for (const post of newUnfilteredPosts) {
      if (!postIdsRef.current.has(post.id)) {
        postIdsRef.current.add(post.id)
        newPosts.push(post)
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

  useEffect(() => {
    updatePosts()

    const channel = supabase
      .channel('realtime:posts-app')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        handlePostEvent,
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
  }, [updatePosts, handlePostEvent])

  return {
    posts: postOptimistics,
    updatePosts,
    hasMorePosts,
  }
}

export default usePostList
