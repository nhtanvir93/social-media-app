import { supabase } from '@/lib/supabase'

import { Database } from './types/database.types'

type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
type NotificationRow = Database['public']['Tables']['notifications']['Row']
type UserRow = Database['public']['Tables']['users']['Row']

export type NotificationWithSenderRow = Omit<NotificationRow, 'senderId'> & {
  sender: Pick<UserRow, 'id' | 'name' | 'image'>
}

type NotificationPayload = Pick<
  NotificationInsert,
  'senderId' | 'receiverId' | 'title' | 'data'
>

export const createNotification = async (payload: NotificationPayload) => {
  const { error } = await supabase.from('notifications').insert(payload)

  if (error) throw error

  return true
}

type GetAllNotificationResult =
  | {
      success: true
      data: NotificationWithSenderRow[]
    }
  | {
      success: false
      message: string
    }

export const fetchNotifications = async (
  userId: string,
  offset = 0,
  limit = 20,
): Promise<GetAllNotificationResult> => {
  const { data, error } = await supabase
    .from('notifications')
    .select(
      `
      id,
      title,
      data,
      receiverId,
      createdAt,

      sender:users!notifications_senderId_fkey (
        id,
        name,
        image
      )
    `,
    )
    .eq('receiverId', userId)
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.log(`Fetch notifications error : ${error.message}`)
    return { success: false, message: 'Could not fetch the notifications' }
  }

  return {
    success: true,
    data,
  }
}
