import Entypo from '@expo/vector-icons/Entypo'
import Feather from '@expo/vector-icons/Feather'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Router } from 'expo-router'
import * as Sharing from 'expo-sharing'
import React, { useEffect, useState } from 'react'
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native'
import { useWindowDimensions } from 'react-native'

import { theme } from '@/constants/theme'
import { heightPercentage, stripHtml } from '@/helpers/common'
import { formatPostDate } from '@/helpers/customDate'
import { useAuth } from '@/hooks/useAuth'
import { createPostLike, deletePostLike, PostRowForList } from '@/utils/databases/post'
import { Database } from '@/utils/databases/types/database.types'
import { deleteFile, downloadFile } from '@/utils/fileUtil'

import Avatar from './Avatar'
import FilePreview from './FilePreview'
import Loading from './Loading'
import PostDetailsViewer from './PostDetailsViewer'

type UserProfile = Database['public']['Tables']['users']['Row']

type BaseProps = {
  post: PostRowForList
  router: Router
  isCommentClickable?: boolean
}

type WithIcons = {
  showIcons: true
  onEdit: () => void
  onDelete: () => void
}

type WithoutIcons = {
  showIcons?: false
  onEdit?: never
  onDelete?: never
}

type PostCardProps = BaseProps & (WithIcons | WithoutIcons)

const PostCard = (props: PostCardProps) => {
  const { userProfile } = useAuth()

  if (!userProfile || !props.post) {
    return null
  }

  return <PostCardContainer {...props} currentUser={userProfile} />
}

type PostCardContainerProps = PostCardProps & {
  currentUser: UserProfile
}

const PostCardContainer = ({
  post,
  currentUser,
  isCommentClickable,
  router,
  showIcons,
  onEdit,
  onDelete,
}: PostCardContainerProps) => {
  const { width } = useWindowDimensions()
  // console.log(router)
  const [loading, setLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likesCount)
  const [commentsCount, setCommentsCount] = useState(post.commentsCount)

  const handleToggleLikeOptimistic = async () => {
    const wasLiked = isLiked

    setIsLiked((prev) => !prev)
    setLikesCount((prev) => prev + (wasLiked ? -1 : 1))

    try {
      if (wasLiked) {
        await deletePostLike(post.id, currentUser.id)
      } else {
        await createPostLike({
          postId: post.id,
          userId: currentUser.id,
        })
      }
    } catch (err) {
      console.error('Like failed', err)

      setIsLiked(wasLiked)
      setLikesCount((prev) => prev + (wasLiked ? 1 : -1))
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
    router.push({
      pathname: '/postDetails',
      params: { postId: post.id },
    })
  }

  useEffect(() => {
    setIsLiked(post.isLiked)
    setLikesCount(post.likesCount)
    setCommentsCount(post.commentsCount)
  }, [post.isLiked, post.likesCount, post.commentsCount])

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
        <View style={styles.actionsContainer}>
          {showIcons && post.user.id === currentUser.id && (
            <View style={styles.actionIcons}>
              <Pressable
                onPress={onEdit}
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <Feather name="edit-2" size={16} color={theme.colors.primaryDark} />
              </Pressable>
              <Pressable
                onPress={onDelete}
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={18}
                  color={theme.colors.roseLight}
                />
              </Pressable>
            </View>
          )}
          {!showIcons && (
            <Pressable onPress={openPostDetails}>
              <Entypo
                name="dots-three-horizontal"
                size={18}
                color={theme.colors.textLight}
              />
            </Pressable>
          )}
        </View>
      </View>

      {post.body && <PostDetailsViewer containerWidth={width} html={post.body} />}

      <FilePreview fileUrl={post.file} />

      <View style={styles.actionContainer}>
        <Pressable style={styles.actionInfo} onPress={handleToggleLikeOptimistic}>
          {isLiked ? (
            <Entypo name="heart" size={20} color={theme.colors.rose} />
          ) : (
            <Entypo name="heart-outlined" size={20} color={theme.colors.rose} />
          )}
          <Text style={styles.countText}>{likesCount}</Text>
        </Pressable>

        <Pressable
          style={styles.actionInfo}
          onPress={() => isCommentClickable && openPostDetails()}
        >
          <MaterialCommunityIcons
            name="comment-text-outline"
            size={20}
            color={theme.colors.text}
          />
          <Text style={styles.countText}>{commentsCount}</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
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
