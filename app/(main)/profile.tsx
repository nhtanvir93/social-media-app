import AntDesign from '@expo/vector-icons/AntDesign'
import React from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'

import Header from '@/components/Header'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const Profile = () => {
  return (
    <ScreenWrapper withHeader={false}>
      <UserHeader />
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
  logoutBtnContainer: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#fecaca',
    padding: 6,
    borderRadius: theme.radius.xxl,
  },
})
