import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const formatPostDate = (date: string | null) => {
  if (date === null) {
    return ''
  }

  const now = dayjs()
  const postDate = dayjs(date)

  const diffInDays = now.diff(postDate, 'day')

  if (diffInDays < 3) {
    return postDate.fromNow()
  }

  return postDate.format('DD MMM, YYYY')
}
