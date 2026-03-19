import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import Octicons from '@expo/vector-icons/Octicons'
import React, { RefObject } from 'react'
import { StyleSheet, View } from 'react-native'
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor'

import { theme } from '@/constants/theme'

type Props = {
  editorRef: RefObject<RichEditor | null>
  value?: string
  onChange: (html: string) => void
}

const RichTextEditor = ({ value = '', onChange, editorRef }: Props) => {
  return (
    <View style={styles.container}>
      <RichToolbar
        editor={editorRef}
        style={styles.toolbar}
        iconSize={22}
        actions={[
          // TEXT STYLE
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.setStrikethrough,
          actions.code,

          // PARAGRAPH / LIST
          actions.blockquote,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.heading1,
          actions.heading4,

          // FORMAT
          actions.removeFormat,
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,
          actions.line,

          // HISTORY
          actions.undo,
          actions.redo,
        ]}
        iconMap={{
          heading1: ({ tintColor }: { tintColor: string }) => (
            <FontAwesome6 name="heading" size={22} color={tintColor} />
          ),
          heading4: ({ tintColor }: { tintColor: string }) => (
            <Octicons name="heading" size={22} color={tintColor} />
          ),
        }}
        selectedIconTint={theme.colors.primary}
      />
      <RichEditor
        ref={editorRef}
        initialContentHTML={value}
        placeholder="What's in your mind ?"
        containerStyle={styles.editor}
        editorStyle={styles.editorContent}
        onChange={onChange}
      />
    </View>
  )
}

export default RichTextEditor

const styles = StyleSheet.create({
  container: {
    minHeight: 285,
  },
  toolbar: {
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    borderColor: theme.colors.textLight,
    borderWidth: 0.4,
  },
  editor: {
    minHeight: 240,
    flex: 1,
    borderWidth: 0.4,
    borderTopWidth: 0,
    borderColor: theme.colors.textLight,
    borderBottomLeftRadius: theme.radius.lg,
    borderBottomRightRadius: theme.radius.lg,
    padding: 5,
  },
  editorContent: {
    color: theme.colors.primaryDark,
  },
})
