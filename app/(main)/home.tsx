import Feather from '@expo/vector-icons/Feather'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Avatar from '@/components/Avatar'
import Button from '@/components/Button'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import { heightPercentage, widthPercentage } from '@/helpers/common'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const Home = () => {
  const router = useRouter()
  const { userProfile, setUserProfile } = useAuth()
  const { top } = useSafeAreaInsets()

  const handleLogout = async () => {
    setUserProfile(null)
    const { error } = await supabase.auth.signOut()

    if (error) {
      Alert.alert('Sign Out', error.message)
    }
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
            <Avatar uri={userProfile?.image} />
          </Pressable>
        </View>
      </View>
      <View style={{ top: heightPercentage(3) + top }}>
        <Button title="Sign Out" onPress={handleLogout} />
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
})
