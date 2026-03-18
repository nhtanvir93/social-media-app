import React, { useRef } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { RichEditor } from 'react-native-pell-rich-editor'

import Avatar from '@/components/Avatar'
import Header from '@/components/Header'
import RichTextEditor from '@/components/RichTextEditor'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import { heightPercentage } from '@/helpers/common'
import { useAuth } from '@/hooks/useAuth'

const CreatePost = () => {
  const editorRef = useRef<RichEditor>(null)
  const bodyRef = useRef('')

  const { userProfile } = useAuth()

  return (
    <ScreenWrapper withHeader={false}>
      <View>
        <Header title="Create Post" />
      </View>
      <View style={styles.container}>
        <View style={styles.publisherContainer}>
          <Avatar uri={userProfile?.image} size={heightPercentage(6.5)} />
          <View>
            <Text style={styles.publisher}>{userProfile?.name}</Text>
            <Text style={styles.publisherTag}>Public</Text>
          </View>
        </View>
        <RichTextEditor
          editorRef={editorRef}
          onChange={(html) => (bodyRef.current = html)}
        />
      </View>
    </ScreenWrapper>
  )
}

export default CreatePost

const styles = StyleSheet.create({
  container: {
    marginTop: heightPercentage(10),
    gap: 10,
  },
  publisherContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  publisher: {
    height: heightPercentage(2.2),
    letterSpacing: 2,
    color: theme.colors.text,
    fontWeight: theme.fonts.extraBold,
  },
  publisherTag: {
    height: heightPercentage(1.7),
    letterSpacing: 2,
    color: theme.colors.textLight,
  },
})
