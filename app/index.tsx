import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

import Button from '@/components/Button'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import { heightPercentage, widthPercentage } from '@/helpers/common'

const Welcome = () => {
  const router = useRouter()

  return (
    <ScreenWrapper withHeader={false} bgColor="#fff">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Image
          style={styles.welcomeImg}
          resizeMode="contain"
          source={require('../assets/images/welcome.png')}
        />
        <View style={styles.brandTextContainer}>
          <Text style={styles.title}>LinkUp!</Text>
          <Text style={styles.punchLine}>
            Where every thought finds a home and every image tells a story.
          </Text>
        </View>
        <View style={styles.footer}>
          <Button btnStyle={styles.btn} title="Get Started" onPress={() => {}} />
          <View style={styles.bottomTextContainer}>
            <Text style={styles.bottomText}>Already have an account!</Text>
            <Pressable onPress={() => router.push('/login')}>
              <Text style={[styles.loginText, styles.bottomText]}>Login</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Welcome

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  welcomeImg: {
    width: widthPercentage(100),
    height: heightPercentage(50),
    alignSelf: 'center',
  },
  brandTextContainer: {
    gap: 10,
  },
  title: {
    color: theme.colors.text,
    fontSize: heightPercentage(5),
    textAlign: 'center',
    fontWeight: theme.fonts.extraBold,
  },
  punchLine: {
    color: theme.colors.text,
    fontSize: heightPercentage(2),
    paddingHorizontal: widthPercentage(10),
    textAlign: 'center',
  },
  footer: {
    gap: 30,
    width: '100%',
  },
  bottomTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  bottomText: {
    fontSize: heightPercentage(2),
  },
  loginText: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.semibold,
  },
})
