import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import Button from '@/components/Button'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import { heightPercentage, widthPercentage } from '@/helpers/common'

const welcome = () => {
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
        <Button btnStyle={styles.btn} title="Get Started" onPress={() => {}} />
      </View>
    </ScreenWrapper>
  )
}

export default welcome

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: widthPercentage(4),
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
    fontSize: heightPercentage(2.2),
    paddingHorizontal: widthPercentage(10),
    textAlign: 'center',
  },
  btn: {
    width: widthPercentage(92),
  },
})
