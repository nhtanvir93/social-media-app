import AntDesign from '@expo/vector-icons/AntDesign'
import Entypo from '@expo/vector-icons/Entypo'
import Feather from '@expo/vector-icons/Feather'
import Fontisto from '@expo/vector-icons/Fontisto'
import Octicons from '@expo/vector-icons/Octicons'
import { router } from 'expo-router'
import React from 'react'
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Avatar from '@/components/Avatar'
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import PostCard from '@/components/PostCard'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import { heightPercentage } from '@/helpers/common'
import { useAuth } from '@/hooks/useAuth'
import usePostList from '@/hooks/usePostList'
import { supabase } from '@/lib/supabase'

const Profile = () => {
  const { userProfile } = useAuth()

  const { bottom } = useSafeAreaInsets()

  const { posts, hasMorePosts, updatePosts } = usePostList({
    userId: userProfile?.id,
    onlyMe: true,
  })

  return (
    <ScreenWrapper withHeader={false}>
      <UserHeader />
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <Avatar
            size={heightPercentage(16)}
            rounded={theme.radius.xxl}
            uri={userProfile?.image}
          />
          <View style={styles.shadowWrapper}>
            <Pressable
              onPress={() => router.push('/editProfile')}
              style={({ pressed }) => [
                styles.editIconContainer,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Feather name="edit-3" size={20} color={theme.colors.primary} />
            </Pressable>
          </View>
        </View>
        <Text style={styles.profileName}>{userProfile?.name}</Text>
        <FlatList
          data={posts}
          keyExtractor={(post) => post.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listStyle,
            { paddingBottom: bottom + 120 },
            posts.length === 0 && styles.emptyList,
          ]}
          ListHeaderComponent={
            <>
              <View style={styles.detailsContainer}>
                <View style={styles.infoSection}>
                  {userProfile?.email && (
                    <View style={styles.infoContainer}>
                      <Fontisto name="email" size={24} color={theme.colors.primary} />
                      <Text style={styles.infoText}>{userProfile.email}</Text>
                    </View>
                  )}
                  {userProfile?.phoneNumber && (
                    <View style={styles.infoContainer}>
                      <Entypo name="mobile" size={24} color={theme.colors.primary} />
                      <Text style={styles.infoText}>{userProfile.phoneNumber}</Text>
                    </View>
                  )}
                  {userProfile?.bio && (
                    <View style={styles.infoContainer}>
                      <Octicons name="quote" size={24} color={theme.colors.primary} />
                      <Text style={styles.infoText}>{userProfile.bio}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.infoSection}>
                  {userProfile?.address && (
                    <View style={styles.infoContainer}>
                      <Entypo name="address" size={24} color={theme.colors.primary} />
                      <Text style={styles.infoText}>{userProfile.address}</Text>
                    </View>
                  )}
                </View>
              </View>
            </>
          }
          renderItem={({ item: post }) => (
            <PostCard post={post} router={router} isCommentClickable={true} />
          )}
          onEndReached={updatePosts}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            hasMorePosts ? (
              <View style={styles.regularLoader}>
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

const UserHeader = () => {
  const { setUserProfile } = useAuth()

  const handleLogout = () => {
    Alert.alert('Confirm', 'Are you sure you want to log out ?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setUserProfile(null)
          const { error } = await supabase.auth.signOut()

          if (error) {
            Alert.alert('Sign Out', error.message)
          }
        },
      },
    ])
  }

  return (
    <View>
      <Header title="Profile">
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtnContainer}>
          <AntDesign name="logout" size={20} color={theme.colors.rose} />
        </TouchableOpacity>
      </Header>
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    marginTop: heightPercentage(12),
    gap: 10,
  },
  logoutBtnContainer: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#fecaca',
    padding: 6,
    borderRadius: theme.radius.xxl,
  },
  profileName: {
    textAlign: 'center',
    fontSize: heightPercentage(3),
    fontWeight: theme.fonts.bold,
    letterSpacing: 2,
    color: theme.colors.text,
  },
  detailsContainer: {
    marginVertical: heightPercentage(2),
    gap: 20,
  },
  infoSection: {
    gap: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: theme.colors.textDark,
    letterSpacing: 2,
    fontSize: heightPercentage(2),
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  shadowWrapper: {
    height: 40,
    width: 40,
    borderRadius: 999,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    position: 'absolute',
    right: -12,
    bottom: -7,
  },
  editIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listStyle: {
    gap: 10,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
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
