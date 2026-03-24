import Feather from '@expo/vector-icons/Feather'
import Ionicons from '@expo/vector-icons/Ionicons'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Avatar from '@/components/Avatar'
import Loading from '@/components/Loading'
import PostCard from '@/components/PostCard'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import { heightPercentage, widthPercentage } from '@/helpers/common'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { fetchPosts, getPostListExtras, PostRowWithExtras } from '@/utils/databases/post'
import { Database } from '@/utils/databases/types/database.types'

type PostRowWithoutUser = Database['public']['Tables']['posts']['Row']

const LIMIT = 20

const Home = () => {
  const [posts, setPosts] = useState<PostRowWithExtras[]>([])
  const [hasMorePosts, setHasMorePosts] = useState(true)

  const offsetRef = useRef(0)

  const router = useRouter()
  const { userProfile } = useAuth()
  const { top } = useSafeAreaInsets()

  const handlePostEvent = useCallback(
    async (payload: RealtimePostgresChangesPayload<PostRowWithoutUser>) => {
      const { eventType, new: newPost } = payload

      if (!('userId' in newPost)) return

      const extraInfo = await getPostListExtras(newPost.id, newPost.userId)

      if (!extraInfo.success) return

      const newPostWithExtras: PostRowWithExtras = {
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

  const updatePosts = useCallback(async () => {
    if (!userProfile) {
      return
    }

    const result = await fetchPosts(userProfile.id, offsetRef.current, LIMIT)

    if (!result.success || !result.data) {
      setHasMorePosts(false)
      return
    }

    if (result.data !== null) {
      offsetRef.current += result.data.length
      setPosts((prev) => [...prev, ...result.data])

      if (result.data.length < LIMIT) {
        setHasMorePosts(false)
      }
    }
  }, [userProfile])

  useEffect(() => {
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
  }, [handlePostEvent])

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
      <View style={[styles.contentContainer, { marginTop: heightPercentage(7) }]}>
        <FlatList
          data={posts}
          keyExtractor={(post) => post.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listStyle,
            posts.length === 0 && styles.emptyList,
          ]}
          renderItem={({ item: post }) => (
            <PostCard post={post} currentUser={userProfile} router={router} />
          )}
          onEndReached={() => hasMorePosts && updatePosts()}
          onEndReachedThreshold={0}
          ListFooterComponent={
            hasMorePosts ? (
              <View style={[hasMorePosts ? styles.regularLoader : styles.centerLoader]}>
                <Loading />
              </View>
            ) : (
              <View style={styles.noPostMsgContainer}>
                <Text style={styles.noPostMsg}>No more posts</Text>
              </View>
            )
          }
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
  contentContainer: {
    flex: 1,
  },
  listStyle: {
    gap: 10,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centerLoader: {
    alignItems: 'center',
  },
  regularLoader: {
    marginTop: 20,
    alignItems: 'center',
  },
  noPostMsgContainer: {
    marginVertical: 15,
  },
  noPostMsg: {
    color: theme.colors.text,
    fontSize: heightPercentage(2),
    textAlign: 'center',
  },
})
