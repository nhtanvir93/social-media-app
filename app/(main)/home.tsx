import Feather from '@expo/vector-icons/Feather'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useIsFocused } from '@react-navigation/native'
import { RealtimePostgresInsertPayload } from '@supabase/supabase-js'
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
import usePostList from '@/hooks/usePostList'
import { supabase } from '@/lib/supabase'
import { Database } from '@/utils/databases/types/database.types'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

const Home = () => {
  const isActive = useIsFocused()
  const { userProfile } = useAuth()

  const notificationIdsRef = useRef(new Set<string>())

  const { posts, hasMorePosts, updatePosts } = usePostList({
    userId: userProfile?.id,
  })

  const [newNotificationCount, setNewNotificationCount] = useState(0)

  const router = useRouter()
  const { top } = useSafeAreaInsets()

  const handleNotificationCount = () => {
    setNewNotificationCount(0)
    router.push('/notifications')
  }

  useEffect(() => {
    console.log(`newNotificationCount : ${newNotificationCount}`)
  }, [newNotificationCount])

  const handleNotificationInsertEvent = useCallback(
    async (payload: RealtimePostgresInsertPayload<NotificationRow>) => {
      console.log(`Home Active ? ${isActive}`)
      if (!isActive) {
        return
      }

      console.log('New Notification Added -> Home', payload)

      const { new: newNotification } = payload

      if (notificationIdsRef.current.has(newNotification.id)) {
        return
      }
      setNewNotificationCount((prev) => prev + 1)
    },
    [isActive, setNewNotificationCount],
  )

  useEffect(() => {
    const channel = supabase
      .channel(`realtime:home:notifications:userId:${userProfile?.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `receiverId=eq.${userProfile?.id}`,
        },
        handleNotificationInsertEvent,
      )
      .subscribe((status) => {
        console.log('Realtime status (home -> notifications):', status)

        if (status === 'SUBSCRIBED') {
          console.log('✅ Connected to realtime (home -> notifications)')
        }

        if (status === 'CHANNEL_ERROR') {
          console.log('❌ Channel error (home -> notifications)')
        }

        if (status === 'TIMED_OUT') {
          console.log('⏱️ Subscription timed out (home -> notifications)')
        }

        if (status === 'CLOSED') {
          console.log('🔌 Channel closed (home -> notifications)')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [handleNotificationInsertEvent, userProfile?.id])

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
            onPress={handleNotificationCount}
          >
            <Ionicons name="notifications" size={24} color={theme.colors.primary} />
            {newNotificationCount > 0 && (
              <View style={styles.newNotificationAlert}>
                <Text style={styles.newNotificationText}>
                  {newNotificationCount > 99 ? '99+' : newNotificationCount}
                </Text>
              </View>
            )}
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
            <PostCard post={post} router={router} isCommentClickable={true} />
          )}
          onEndReached={updatePosts}
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
  newNotificationAlert: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: 'red',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newNotificationText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
})
