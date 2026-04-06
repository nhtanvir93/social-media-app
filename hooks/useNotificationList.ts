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

    const newNotifications = result.data.filter((newNotification) => {
      const found = notificationIdsRef.current.has(newNotification.id)
      notificationIdsRef.current.add(newNotification.id)

      return found === false
    })

    if (newNotifications.length > 0) {
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
      console.log('New Notification Added', payload)

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
    },
    [setNotifications],
  )

  useEffect(() => {
    updateNotifications()

    const channel = supabase
      .channel(`realtime:notifications:userId:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `receiverId=eq.${userId}`,
        },
        handleNotificationInsertEvent,
      )
      .subscribe((status) => {
        console.log('Realtime status (notifications):', status)

        if (status === 'SUBSCRIBED') {
          console.log('✅ Connected to realtime (notifications)')
        }

        if (status === 'CHANNEL_ERROR') {
          console.log('❌ Channel error (notifications)')
        }

        if (status === 'TIMED_OUT') {
          console.log('⏱️ Subscription timed out (notifications)')
        }

        if (status === 'CLOSED') {
          console.log('🔌 Channel closed (notifications)')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [updateNotifications, handleNotificationInsertEvent, userId])

  return {
    notifications,
    hasMoreNotifications,
    updateNotifications,
  }
}

export default useNotificationList
