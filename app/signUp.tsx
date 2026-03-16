import Feather from '@expo/vector-icons/Feather'
import Fontisto from '@expo/vector-icons/Fontisto'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'

import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Input from '@/components/Input'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import { heightPercentage } from '@/helpers/common'
import { supabase } from '@/lib/supabase'

const SignUp = () => {
  const router = useRouter()

  const nameRef = useRef<string>('')
  const emailRef = useRef<string>('')
  const passwordRef = useRef<string>('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    const name = nameRef.current?.trim()
    const email = emailRef.current?.trim()
    const password = passwordRef.current?.trim()

    if (!name || !email || !password) {
      Alert.alert('Sign Up', 'Please fill all the fields!')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error('User not returned after signup.')
      }

      console.log('Signed up user:', data.user)

      Alert.alert('Sign Up', 'Account created successfully!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      console.error('Signup error:', err)
      Alert.alert('Sign Up', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenWrapper withHeader={false}>
      <View style={styles.container}>
        <BackButton router={router} />
        <View>
          <Text style={styles.welcomeText}>Hey,</Text>
          <Text style={styles.welcomeText}>Get Started</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.formHeader}>
            Please fill the fields to create an account
          </Text>
          <Input
            placeholder="Enter your name"
            onChangeText={(value) => (nameRef.current = value)}
            icon={<Feather name="user" size={24} color={theme.colors.textLight} />}
          />
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
          <Button title="Sign Up" loading={loading} onPress={onSubmit} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account ?</Text>
          <Pressable onPress={() => router.push('/login')}>
            <Text style={styles.signUpBtn}>Login</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default SignUp

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
