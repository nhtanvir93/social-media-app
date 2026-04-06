import { useRouter } from 'expo-router'
import React from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'

import Avatar from '@/components/Avatar'
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import { heightPercentage } from '@/helpers/common'
import { useAuth } from '@/hooks/useAuth'
import useNotificationList from '@/hooks/useNotificationList'

type NotificationDataType = {
  postId: string
  commentId: string
}

const Notifications = () => {
  const { userProfile } = useAuth()
  const router = useRouter()
  const { updateNotifications, notifications, hasMoreNotifications } =
    useNotificationList({ userId: userProfile?.id, canUpdate: true })

  return (
    <ScreenWrapper withHeader={false}>
      <View>
        <Header title="Notifications" />
      </View>
      <View style={styles.container}>
        <FlatList
          data={notifications}
          keyExtractor={(notification) => notification.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listStyle,
            hasMoreNotifications && styles.emptyList,
          ]}
          renderItem={({ item: notification }) => (
            <Pressable
              style={styles.notification}
              onPress={() => {
                if (!notification.data) {
                  return
                }

                const data: NotificationDataType =
                  typeof notification.data === 'string'
                    ? JSON.parse(notification.data)
                    : notification.data

                router.push({
                  pathname: '/postDetails',
                  params: data,
                })
              }}
            >
              <Avatar uri={notification.sender.image} />
              <View>
                <Text style={styles.author}>{notification.sender.name}</Text>
                <Text style={styles.staticInfo}>commented on your post</Text>
              </View>
            </Pressable>
          )}
          onEndReached={updateNotifications}
          onEndReachedThreshold={0}
          ListFooterComponent={
            hasMoreNotifications ? (
              <View
                style={[
                  hasMoreNotifications ? styles.regularLoader : styles.centerLoader,
                ]}
              >
                <Loading />
              </View>
            ) : (
              <View style={styles.noNotificationMsgContainer}>
                <Text style={styles.noNotificationMsg}>No more notifications</Text>
              </View>
            )
          }
        />
      </View>
    </ScreenWrapper>
  )
}

export default Notifications

const styles = StyleSheet.create({
  container: {
    marginTop: heightPercentage(8),
    gap: heightPercentage(1.5),
    flex: 1,
  },
  notification: {
    padding: heightPercentage(2),
    borderWidth: 0.5,
    borderColor: theme.colors.textLight,
    borderRadius: theme.radius.xxl,
    flexDirection: 'row',
    gap: 10,
  },
  author: {
    fontSize: heightPercentage(1.7),
    fontWeight: theme.fonts.extraBold,
  },
  staticInfo: {
    fontSize: heightPercentage(1.4),
    color: theme.colors.textLight,
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
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  noNotificationMsgContainer: {
    marginVertical: 15,
  },
  noNotificationMsg: {
    color: theme.colors.text,
    fontSize: heightPercentage(2),
    textAlign: 'center',
  },
})
