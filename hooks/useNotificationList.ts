import { RealtimePostgresInsertPayload } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'

import { supabase } from '@/lib/supabase'
import {
  fetchNotifications,
  NotificationWithSenderRow,
} from '@/utils/databases/notification'
import { Database } from '@/utils/databases/types/database.types'
import { getUserProfile } from '@/utils/databases/userProfile'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

const LIMIT = 20

const useNotificationList = ({
  userId,
  canUpdate = false,
}: {
  userId?: string
  canUpdate?: boolean
}) => {
  const [notifications, setNotifications] = useState<NotificationWithSenderRow[]>([])
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true)
  const [newNotificationCount, setNewNotificationCount] = useState(0)

  const notificationIdsRef = useRef(new Set<string>())

  const offsetRef = useRef(0)

  const updateNotifications = useCallback(async () => {
    if (!canUpdate) {
      return
    }

    if (!userId || !hasMoreNotifications) {
      return
    }

    const result = await fetchNotifications(userId, offsetRef.current, LIMIT)

    if (!result.success) {
      setHasMoreNotifications(false)
      return
    }

    if (result.data.length > 0) {
      const newNotifications = result.data.filter((newNotification) => {
        const found = notificationIdsRef.current.has(newNotification.id)
        notificationIdsRef.current.add(newNotification.id)

        return found === false
      })

      if (newNotifications.length === 0) {
        return
      }

      offsetRef.current += newNotifications.length
      setNotifications((prev) => [...prev, ...newNotifications])
    } else {
      setHasMoreNotifications(false)
    }
  }, [userId, hasMoreNotifications, canUpdate])

  const handleNotificationInsertEvent = useCallback(
    async (payload: RealtimePostgresInsertPayload<NotificationRow>) => {
      const { new: newNotification } = payload

      if (notificationIdsRef.current.has(newNotification.id)) {
        return
      }

      const sender = await getUserProfile(newNotification.senderId)

      if (!sender) {
        return
      }

      const updatedNotification = {
        id: newNotification.id,
        title: newNotification.title,
        data: newNotification.data,
        receiverId: newNotification.receiverId,
        createdAt: newNotification.createdAt,
        sender,
      }

      setNotifications((prev) => [updatedNotification, ...prev])
      setNewNotificationCount((prev) => prev + 1)
    },
    [setNotifications],
  )

  const clearNewNotification = useCallback(() => {
    setNewNotificationCount(0)
  }, [])

  useEffect(() => {
    updateNotifications()

    const channel = supabase
      .channel('realtime:posts-app')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        handleNotificationInsertEvent,
      )
      .subscribe((status) => {
        console.log('Realtime status (posts):', status)

        if (status === 'SUBSCRIBED') {
          console.log('✅ Connected to realtime (posts)')
        }

        if (status === 'CHANNEL_ERROR') {
          console.log('❌ Channel error (posts)')
        }

        if (status === 'TIMED_OUT') {
          console.log('⏱️ Subscription timed out (posts)')
        }

        if (status === 'CLOSED') {
          console.log('🔌 Channel closed (posts)')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [updateNotifications, handleNotificationInsertEvent])

  return {
    notifications,
    newNotificationCount,
    hasMoreNotifications,
    updateNotifications,
    clearNewNotification,
  }
}

export default useNotificationList
