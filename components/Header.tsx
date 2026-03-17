import { useRouter } from 'expo-router'
import React, { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { theme } from '@/constants/theme'
import { heightPercentage } from '@/helpers/common'

import BackButton from './BackButton'

const Header = ({
  title,
  showBackButton = true,
  children,
}: {
  title: string
  showBackButton?: boolean
  children: ReactNode
}) => {
  const router = useRouter()

  return (
    <View style={[styles.container]}>
      {showBackButton && (
        <View style={styles.backBtnContainer}>
          <BackButton router={router} />
        </View>
      )}
      <Text style={[styles.title, { color: theme.colors.primary }]}>{title}</Text>
      {children}
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: heightPercentage(1.5),
  },
  backBtnContainer: {
    position: 'absolute',
    left: 0,
  },
  title: {
    fontSize: heightPercentage(4),
    fontWeight: theme.fonts.extraBold,
    letterSpacing: 2,
  },
})
