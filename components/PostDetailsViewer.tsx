import React from 'react'
import { View } from 'react-native'
import RenderHtml, { HTMLSourceInline } from 'react-native-render-html'

import { theme } from '@/constants/theme'
import { heightPercentage, widthPercentage } from '@/helpers/common'

const baseStyle = {
  color: theme.colors.primaryDark,
  fontSize: heightPercentage(1.75),
  fontFamily: 'System',
  lineHeight: 22,
}

const PostDetailsViewer = ({
  html,
  containerWidth,
}: {
  containerWidth?: number
  html: HTMLSourceInline['html']
}) => {
  return (
    <View>
      <RenderHtml
        contentWidth={containerWidth}
        source={{ html }}
        baseStyle={baseStyle}
        tagsStyles={{
          div: {
            width: widthPercentage(100),
          },
          p: {
            marginVertical: 6,
            color: theme.colors.primaryDark,
            fontFamily: 'System',
            fontSize: heightPercentage(1.75),
          },
          h1: {
            fontSize: heightPercentage(2.5),
            fontWeight: 700,
            color: theme.colors.primaryDark,
            marginVertical: 10,
          },
          h4: {
            fontSize: heightPercentage(2),
            fontWeight: 600,
            color: theme.colors.primaryDark,
            marginVertical: 8,
          },
          b: { fontWeight: 700 },
          strong: { fontWeight: 700 },
          i: { fontStyle: 'italic' },
          em: { fontStyle: 'italic' },
          u: { textDecorationLine: 'underline' },
          s: { textDecorationLine: 'line-through' },
          strike: { textDecorationLine: 'line-through' },
          blockquote: {
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
            paddingLeft: 8,
            marginVertical: 8,
            fontStyle: 'italic',
            color: theme.colors.text,
          },
          pre: {
            backgroundColor: '#f5f5f5',
            padding: 6,
            borderRadius: 4,
            fontFamily: 'Courier',
          },
          code: {
            backgroundColor: '#f5f5f5',
            paddingHorizontal: 4,
            borderRadius: 4,
            fontFamily: 'Courier',
          },
          ul: { paddingLeft: 20, marginVertical: 4 },
          ol: { paddingLeft: 20, marginVertical: 4 },
          li: { marginVertical: 2 },
          hr: {
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.textLight,
            marginVertical: 8,
          },
        }}
      />
    </View>
  )
}

export default PostDetailsViewer
