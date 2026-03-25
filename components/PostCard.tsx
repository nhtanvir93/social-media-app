import Entypo from '@expo/vector-icons/Entypo'
import Feather from '@expo/vector-icons/Feather'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { PostgrestError } from '@supabase/supabase-js'
import { ResizeMode, Video } from 'expo-av'
import { Image } from 'expo-image'
import { Router } from 'expo-router'
import * as Sharing from 'expo-sharing'
import React, { startTransition, useState } from 'react'
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native'
import { useWindowDimensions } from 'react-native'

import { theme } from '@/constants/theme'
import { heightPercentage, stripHtml } from '@/helpers/common'
import { formatPostDate } from '@/helpers/customDate'
import { createPostLike, deletePostLike, PostRowForList } from '@/utils/databases/post'
import { Database } from '@/utils/databases/types/database.types'
import { deleteFile, downloadFile } from '@/utils/fileUtil'

import Avatar from './Avatar'
import Loading from './Loading'
import PostDetailsViewer from './PostDetailsViewer'

type UserProfileRow = Database['public']['Tables']['users']['Row']

const PostCard = ({
  post,
  currentUser,
  router,
}: {
  post: PostRowForList
  currentUser: UserProfileRow
  router: Router
}) => {
  const { width } = useWindowDimensions()
  // console.log(router)

  const [likeInfo, setLikeInfo] = useState({
    isLiked: post.isLiked,
    likesCount: post.likesCount,
  })
  const [loading, setLoading] = useState(false)

  const handleToggleLike = async () => {
    const currentlyLiked = likeInfo.isLiked
    const oldLikesCount = likeInfo.likesCount

    startTransition(() => {
      setLikeInfo({
        isLiked: !currentlyLiked,
        likesCount: currentlyLiked ? oldLikesCount - 1 : oldLikesCount + 1,
      })
    })

    try {
      if (currentlyLiked) {
        await deletePostLike(post.id, currentUser.id)
      } else {
        await createPostLike({ postId: post.id, userId: currentUser.id })
      }
    } catch (err: unknown) {
      if (err instanceof PostgrestError && err.code === '23505') {
        console.warn('Like already exists, ignoring duplicate')
        return
      }

      console.error('Failed to toggle like', err)

      startTransition(() => {
        setLikeInfo({
          isLiked: currentlyLiked,
          likesCount: oldLikesCount,
        })
      })
    }
  }

  const handleShare = async () => {
    try {
      setLoading(true)

      if (post.file) {
        const localUri = await downloadFile(post.file)

        if (!localUri) {
          Alert.alert('Share File', 'Failed to share the file')
        } else if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(localUri, {
            dialogTitle: 'Share file',
          })

          await deleteFile(localUri)
        } else {
          console.warn('File sharing is not available on this device')
        }
      }

      if (post.body) {
        await Share.share({
          message: stripHtml(post.body),
        })
      }
    } catch (err) {
      console.error('Error sharing content', err)
    } finally {
      setLoading(false)
    }
  }

  const openPostDetails = () => {
    router.push(`/postDetails/${post.id}`)
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.publisherContainer}>
          <Avatar uri={post.user.image} size={heightPercentage(4.5)} />
          <View style={styles.publisherInfoDateContainer}>
            <Text style={styles.publisher}>{post.user.name}</Text>
            <Text style={styles.postDate}>{formatPostDate(post.createdAt)}</Text>
          </View>
        </View>
        <Pressable onPress={openPostDetails}>
          <Entypo name="dots-three-horizontal" size={16} color={theme.colors.textLight} />
        </Pressable>
      </View>

      {post.body && <PostDetailsViewer containerWidth={width} html={post.body} />}

      {post.file?.includes('image') && (
        <Image source={post.file} contentFit="cover" style={styles.filePreview} />
      )}

      {post.file?.includes('video') && (
        <Video
          source={{ uri: post.file }}
          style={styles.filePreview}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
        />
      )}

      <View style={styles.actionContainer}>
        <Pressable style={styles.actionInfo} onPress={handleToggleLike}>
          {likeInfo.isLiked ? (
            <Entypo name="heart" size={20} color={theme.colors.rose} />
          ) : (
            <Entypo name="heart-outlined" size={20} color={theme.colors.rose} />
          )}
          <Text style={styles.countText}>{likeInfo.likesCount}</Text>
        </Pressable>

        <Pressable style={styles.actionInfo}>
          <MaterialCommunityIcons
            name="comment-text-outline"
            size={20}
            color={theme.colors.text}
          />
          <Text style={styles.countText}>{post.commentsCount}</Text>
        </Pressable>

        <View>
          {loading ? (
            <Loading size="small" />
          ) : (
            <Pressable style={styles.actionInfo} onPress={handleShare}>
              <Feather name="share" size={18} color={theme.colors.primaryDark} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  )
}

export default PostCard

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: theme.radius.sm,
    borderWidth: 0.4,
    borderColor: theme.colors.textLight,
    gap: 8,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  publisherContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  publisherInfoDateContainer: {
    justifyContent: 'flex-start',
  },
  publisher: {
    fontSize: heightPercentage(1.6),
    letterSpacing: 2,
    color: theme.colors.text,
    fontWeight: theme.fonts.extraBold,
  },
  postDate: {
    fontSize: heightPercentage(1.5),
    letterSpacing: 2,
    color: theme.colors.textLight,
  },
  filePreview: {
    height: heightPercentage(30),
    width: '100%',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  countText: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
})
