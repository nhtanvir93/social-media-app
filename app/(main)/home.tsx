import Feather from '@expo/vector-icons/Feather'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import React from 'react'
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

const Home = () => {
  const { userProfile } = useAuth()

  const { posts, hasMorePosts, updatePosts } = usePostList({
    userId: userProfile?.id,
  })

  const router = useRouter()
  const { top } = useSafeAreaInsets()

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
})
