import { Dimensions } from 'react-native'

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window')

export const heightPercentage = (percentage: number) => {
  return (deviceHeight * percentage) / 100
}

export const widthPercentage = (percentage: number) => {
  return (deviceWidth * percentage) / 100
}

export const stripHtml = (html: string): string => {
  if (!html) return ''

  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n\s*\n/g, '\n')
    .trim()
}
