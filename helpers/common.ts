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

export function generatePostgresTimestamp() {
  const now = new Date()

  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')

  const hours = String(now.getUTCHours()).padStart(2, '0')
  const minutes = String(now.getUTCMinutes()).padStart(2, '0')
  const seconds = String(now.getUTCSeconds()).padStart(2, '0')

  const milliseconds = now.getUTCMilliseconds() // 0-999
  const microseconds = String(
    milliseconds * 1000 + Math.floor(Math.random() * 1000),
  ).padStart(6, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${microseconds}+00`
}
