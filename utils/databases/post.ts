import { supabase } from '@/lib/supabase'

import { Database } from './types/database.types'

type PostPayload = Database['public']['Tables']['posts']['Insert']

export const createOrUpdate = async (payload: PostPayload) => {
  const { data, error } = await supabase.from('posts').upsert(payload).select().single()

  if (error) throw error

  return data
}
