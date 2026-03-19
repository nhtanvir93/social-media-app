import Entypo from '@expo/vector-icons/Entypo'
import Feather from '@expo/vector-icons/Feather'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { ResizeMode, Video } from 'expo-av'
import { Image } from 'expo-image'
import { Router } from 'expo-router'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useWindowDimensions } from 'react-native'
import RenderHtml from 'react-native-render-html'

import { theme } from '@/constants/theme'
import { heightPercentage } from '@/helpers/common'
import { formatPostDate } from '@/helpers/customDate'
import { PostRow } from '@/utils/databases/post'
import { UserProfileRow } from '@/utils/databases/types/userProfile.types'

import Avatar from './Avatar'

const baseStyle = {
  color: theme.colors.primaryDark,
  fontSize: heightPercentage(1.75),
  fontFamily: 'System',
  lineHeight: 22,
}

const PostCard = ({
  post,
}: {
  post: PostRow
  currentUser: UserProfileRow
  router: Router
}) => {
  const { width } = useWindowDimensions()

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
        <Entypo name="dots-three-horizontal" size={16} color={theme.colors.textLight} />
      </View>
      {post.body && (
        <View>
          <RenderHtml
            contentWidth={width}
            source={{ html: post.body }}
            baseStyle={baseStyle}
            tagsStyles={{
              p: {
                marginVertical: 6,
                color: theme.colors.primaryDark,
                fontFamily: 'System',
                fontSize: heightPercentage(1.75),
              },
              h1: {
                fontSize: heightPercentage(2.5),
                fontWeight: 700,
                color: theme.colors.primaryDark,
                marginVertical: 10,
              },
              h4: {
                fontSize: heightPercentage(2),
                fontWeight: 600,
                color: theme.colors.primaryDark,
                marginVertical: 8,
              },
              b: { fontWeight: 700 },
              strong: { fontWeight: 700 },
              i: { fontStyle: 'italic' },
              em: { fontStyle: 'italic' },
              u: { textDecorationLine: 'underline' },
              s: { textDecorationLine: 'line-through' },
              strike: { textDecorationLine: 'line-through' },
              blockquote: {
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.primary,
                paddingLeft: 8,
                marginVertical: 8,
                fontStyle: 'italic',
                color: theme.colors.text,
              },
              pre: {
                backgroundColor: '#f5f5f5',
                padding: 6,
                borderRadius: 4,
                fontFamily: 'Courier',
              },
              code: {
                backgroundColor: '#f5f5f5',
                paddingHorizontal: 4,
                borderRadius: 4,
                fontFamily: 'Courier',
              },
              ul: { paddingLeft: 20, marginVertical: 4 },
              ol: { paddingLeft: 20, marginVertical: 4 },
              li: { marginVertical: 2 },
              '.ql-align-left': { textAlign: 'left' },
              '.ql-align-center': { textAlign: 'center' },
              '.ql-align-right': { textAlign: 'right' },
              hr: {
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.textLight,
                marginVertical: 8,
              },
            }}
            ignoredStyles={['fontFamily', 'fontSize', 'lineHeight']}
          />
        </View>
      )}
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
        <Pressable style={styles.actionInfo}>
          <Entypo name="heart-outlined" size={20} color={theme.colors.rose} />
          <Text style={styles.countText}>0</Text>
        </Pressable>
        <Pressable style={styles.actionInfo}>
          <MaterialCommunityIcons
            name="comment-text-outline"
            size={20}
            color={theme.colors.text}
          />
          <Text style={styles.countText}>0</Text>
        </Pressable>
        <Pressable style={styles.actionInfo}>
          <Feather name="share" size={20} color={theme.colors.primaryDark} />
          <Text style={styles.countText}>0</Text>
        </Pressable>
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
    borderRadius: theme.radius.lg,
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
