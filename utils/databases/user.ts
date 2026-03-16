import { supabase } from '@/lib/supabase'

import { Database } from './types/database.types'

type UserProfile = Database['public']['Tables']['users']['Row']
type UserProfileInsert = Database['public']['Tables']['users']['Insert']

export const getCurrentUser = async () => {
  const {
    error,
    data: { user },
  } = await supabase.auth.getUser()

  if (error || !user) return null

  return user
}

export const createUserProfile = async (payload: UserProfileInsert) => {
  const { error } = await supabase.from('users').insert(payload)

  if (error) throw error

  return true
}

export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  const user = await getCurrentUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null

  return data
}
