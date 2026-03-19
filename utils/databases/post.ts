import { supabase } from '@/lib/supabase'

import { Database } from './types/database.types'

type PostPayload = Database['public']['Tables']['posts']['Insert']

type UserRow = Database['public']['Tables']['users']['Row']
export type PostRow = Pick<
  Database['public']['Tables']['posts']['Row'],
  'id' | 'body' | 'file' | 'createdAt'
> & {
  user: Pick<UserRow, 'id' | 'name' | 'image'>
}

export const createOrUpdatePost = async (payload: PostPayload) => {
  const { data, error } = await supabase.from('posts').upsert(payload).select().single()

  if (error) throw error

  return data
}

type getAllPostsResult =
  | {
      success: true
      data: PostRow[] | null
    }
  | {
      success: false
      message: string
    }

export const fetchPosts = async (offset = 0, limit = 20): Promise<getAllPostsResult> => {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id, body, file, createdAt,
      user: users (
        id,
        name,
        image
      )
    `,
    )
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.log(`Fetch posts error : ${error.message}`)
    return {
      success: false,
      message: 'Could not fetch the posts',
    }
  }

  return {
    success: true,
    data,
  }
}
