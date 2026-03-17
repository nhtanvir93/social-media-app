import Fontisto from '@expo/vector-icons/Fontisto'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'

import Button from '@/components/Button'
import Input from '@/components/Input'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import { heightPercentage } from '@/helpers/common'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { getCurrentUserProfile } from '@/utils/databases/userProfile'

const Login = () => {
  const emailRef = useRef<string>('')
  const passwordRef = useRef<string>('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { setUserProfile } = useAuth()

  const onSubmit = async () => {
    const email = emailRef.current?.trim()
    const password = passwordRef.current?.trim()

    if (!email || !password) {
      Alert.alert('Login', 'Please fill all the fields!')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      Alert.alert(error.message)
      return
    }

    const userProfile = await getCurrentUserProfile()

    if (userProfile) {
      setUserProfile(userProfile)
    }

    setLoading(false)
  }

  return (
    <ScreenWrapper withHeader={false}>
      <View style={styles.container}>
        <View>
          <Text style={styles.welcomeText}>Hey,</Text>
          <Text style={styles.welcomeText}>Welcome Back</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.formHeader}>Please login to continue</Text>
          <Input
            placeholder="Enter your email"
            onChangeText={(value) => (emailRef.current = value)}
            icon={<Fontisto name="email" size={24} color={theme.colors.textLight} />}
          />
          <Input
            secureTextEntry
            placeholder="Enter your password"
            onChangeText={(value) => (passwordRef.current = value)}
            icon={
              <MaterialIcons name="password" size={24} color={theme.colors.textLight} />
            }
          />
          <Text style={styles.forgotPassword}>Forgot Password</Text>
          <Button title="Login" loading={loading} onPress={onSubmit} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account ?</Text>
          <Pressable onPress={() => router.replace('/signUp')}>
            <Text style={styles.signUpBtn}>Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
  },
  welcomeText: {
    fontSize: heightPercentage(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  formHeader: {
    fontSize: heightPercentage(2),
    color: theme.colors.text,
  },
  forgotPassword: {
    textAlign: 'right',
    fontWeight: theme.fonts.extraBold,
    marginRight: 4,
    color: theme.colors.primaryDark,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    color: theme.colors.primaryDark,
  },
  signUpBtn: {
    fontWeight: theme.fonts.extraBold,
    color: theme.colors.primary,
  },
})
