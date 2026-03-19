import Feather from '@expo/vector-icons/Feather'
import Ionicons from '@expo/vector-icons/Ionicons'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Avatar from '@/components/Avatar'
import PostCard from '@/components/PostCard'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import { heightPercentage, widthPercentage } from '@/helpers/common'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { fetchPosts, PostRow } from '@/utils/databases/post'
import { PostRow as PostRowWithoutUser } from '@/utils/databases/types/post.types'
import { getUserProfile } from '@/utils/databases/userProfile'

const LIMIT = 20

const Home = () => {
  const [posts, setPosts] = useState<PostRow[]>([])
  let { current: offset } = useRef(0)

  const router = useRouter()
  const { userProfile } = useAuth()
  const { top } = useSafeAreaInsets()

  const handlePostEvent = useCallback(
    async (payload: RealtimePostgresChangesPayload<PostRowWithoutUser>) => {
      const { eventType, new: newPost } = payload

      if (!('userId' in newPost)) return

      const author = await getUserProfile(newPost.userId)

      if (!author) return

      const newPostWithUser: PostRow = {
        ...newPost,
        user: author,
      }

      switch (eventType) {
        case 'INSERT':
          offset++
          setPosts((prev) => [newPostWithUser, ...prev])
          break
      }
    },
    [offset],
  )

  const updatePosts = useCallback(async () => {
    const result = await fetchPosts(offset, LIMIT)

    if (!result.success || !result.data) {
      return
    }

    if (result.data !== null) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      offset += result.data.length
      setPosts((prev) => [...prev, ...result.data])
    }
  }, [])

  useEffect(() => {
    updatePosts()

    const postChannel = supabase
      .channel('posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        handlePostEvent,
      )
      .subscribe()

    return () => {
      ;(async () => {
        await supabase.removeChannel(postChannel)
      })()
    }
  }, [updatePosts, handlePostEvent])

  if (!userProfile) {
    return null
  }

  return (
    <ScreenWrapper withHeader={false}>
      <View style={[styles.header, { top }]}>
        <Text style={styles.brandTitle}>LinkUp</Text>
        <View style={styles.headerIcons}>
          <Pressable
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications" size={24} color={theme.colors.primary} />
          </Pressable>
          <Pressable
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            onPress={() => router.push('/createPost')}
          >
            <Feather name="plus-square" size={24} color={theme.colors.primary} />
          </Pressable>
          <Pressable
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            onPress={() => router.push('/profile')}
          >
            <Avatar uri={userProfile?.image} rounded={theme.radius.xxl} />
          </Pressable>
        </View>
      </View>
      <View style={{ marginTop: heightPercentage(8.5) }}>
        <FlatList
          data={posts}
          keyExtractor={(post) => post.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          renderItem={({ item: post }) => (
            <PostCard post={post} currentUser={userProfile} router={router} />
          )}
        />
      </View>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: widthPercentage(4),
    paddingVertical: heightPercentage(1.5),
    borderColor: theme.colors.primary,
    borderBottomWidth: 0.2,
  },
  brandTitle: {
    fontSize: heightPercentage(3.5),
    fontWeight: theme.fonts.extraBold,
    color: theme.colors.primary,
    letterSpacing: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  listStyle: {
    gap: 10,
  },
})
