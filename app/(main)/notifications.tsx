import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import Avatar from '@/components/Avatar'
import Header from '@/components/Header'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import { heightPercentage } from '@/helpers/common'
import { useAuth } from '@/hooks/useAuth'

const Notifications = () => {
  const { userProfile } = useAuth()

  return (
    <ScreenWrapper withHeader={false}>
      <View>
        <Header title="Notifications" />
      </View>
      <View style={styles.container}>
        <View style={styles.notification}>
          <Avatar uri={userProfile?.image} />
          <View>
            <Text style={styles.author}>{userProfile?.name}</Text>
            <Text style={styles.staticInfo}>commented on your post</Text>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Notifications

const styles = StyleSheet.create({
  container: {
    marginTop: heightPercentage(8),
    gap: heightPercentage(1.5),
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
})
