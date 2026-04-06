import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import React from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'

import { theme } from '@/constants/theme'
import { heightPercentage } from '@/helpers/common'
import { formatPostDate } from '@/helpers/customDate'
import { CommentRow } from '@/utils/databases/post'
import { Database } from '@/utils/databases/types/database.types'

import Avatar from './Avatar'

type UserProfileRow = Database['public']['Tables']['users']['Row']

const Comment = ({
  postUserId,
  currentUser,
  comment,
  onDelete,
  highlight,
}: {
  postUserId: string
  currentUser: UserProfileRow
  comment: CommentRow
  onDelete: (comment: CommentRow) => void
  highlight: boolean
}) => {
  const removeComment = () => {
    Alert.alert('Confirm', 'Are you sure you want to delete this comment ?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          onDelete(comment)
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <Avatar uri={comment.author.image} />
      <View style={[styles.commentContainer, highlight && styles.primaryBorder]}>
        <View style={styles.authorCommentInfo}>
          <Text>
            <Text style={styles.author}>{comment.author.name}</Text>
            {' • '}
            <Text style={styles.commentTime}>{formatPostDate(comment.createdAt)}</Text>
          </Text>
          {(comment.author.id === currentUser.id || postUserId === currentUser.id) && (
            <Pressable onPress={removeComment}>
              <MaterialCommunityIcons
                name="delete"
                size={16}
                color={theme.colors.roseLight}
              />
            </Pressable>
          )}
        </View>
        <Text>{comment.text}</Text>
      </View>
    </View>
  )
}

export default Comment

const styles = StyleSheet.create({
  primaryBorder: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  container: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'flex-start',
  },
  commentContainer: {
    flex: 1,
    backgroundColor: theme.colors.gray,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
    gap: 6,
  },
  authorCommentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontSize: heightPercentage(1.7),
    fontWeight: theme.fonts.extraBold,
    lineHeight: heightPercentage(1.5),
  },
  commentTime: {
    fontSize: heightPercentage(1.4),
    lineHeight: heightPercentage(1.5),
    color: theme.colors.textLight,
  },
})
