import { supabase } from '@/lib/supabase'

import { Database } from './types/database.types'

type UserRow = Pick<Database['public']['Tables']['users']['Row'], 'id' | 'name' | 'image'>
type PostRow = Pick<
  Database['public']['Tables']['posts']['Row'],
  'id' | 'body' | 'file' | 'createdAt'
>

export type CommentRow = Pick<
  Database['public']['Tables']['comments']['Row'],
  'id' | 'text' | 'createdAt'
> & {
  author: UserRow
}

type PostPayload = Database['public']['Tables']['posts']['Insert']
type PostLikeInsert = Database['public']['Tables']['postLikes']['Insert']

export type PostRowListExtra = {
  isLiked: boolean
  likesCount: number
  commentsCount: number
}

export type PostRowForList = PostRow & {
  user: UserRow
} & PostRowListExtra

export type PostRowDetails = PostRowForList & {
  comments: CommentRow[]
}

export const createOrUpdatePost = async (payload: PostPayload) => {
  const { data, error } = await supabase.from('posts').upsert(payload).select().single()

  if (error) throw error

  return data
}

export const createPostLike = async (postLikeInsert: PostLikeInsert) => {
  const { data, error } = await supabase
    .from('postLikes')
    .upsert(postLikeInsert)
    .select()
    .single()

  if (error) throw error

  return data
}

export const deletePostLike = async (postId: string, userId: string) => {
  const { error } = await supabase
    .from('postLikes')
    .delete()
    .eq('postId', postId)
    .eq('userId', userId)

  if (error) throw error

  return { success: true }
}

type GetAllPostsResult =
  | {
      success: true
      data: PostRowForList[]
    }
  | {
      success: false
      message: string
    }

export const fetchPosts = async (
  userId: string,
  offset = 0,
  limit = 20,
): Promise<GetAllPostsResult> => {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id,
      body,
      file,
      createdAt,

      user: users (
        id,
        name,
        image
      ),

      postLikes(
        id,
        postId, 
        userId
      ),
      comments(count)
    `,
    )
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.log(`Fetch posts error : ${error.message}`)
    return { success: false, message: 'Could not fetch the posts' }
  }

  const formatted = (data ?? []).map((post) => ({
    id: post.id,
    body: post.body,
    file: post.file,
    createdAt: post.createdAt,

    user: post.user,

    likesCount: post.postLikes.length,
    commentsCount: post.comments[0]?.count ?? 0,
    isLiked: post.postLikes?.some((like) => like.userId === userId) ?? false,
  }))

  return {
    success: true,
    data: formatted,
  }
}

type getUserWithPostCommentCount =
  | {
      success: true
      data: PostRowListExtra & {
        user: UserRow
      }
    }
  | {
      success: false
      message: string
    }

export const getPostListExtras = async (
  postId: string,
  userId: string,
): Promise<getUserWithPostCommentCount> => {
  const { data: post, error } = await supabase
    .from('posts')
    .select(
      `
      user: users (
        id,
        name,
        image
      ),

      postLikes(
        id,
        postId, 
        userId
      ),
      comments(count)
    `,
    )
    .eq('id', postId)
    .single()

  if (error) {
    console.log(`Fetch posts error : ${error.message}`)
    return { success: false, message: 'Could not fetch the post extra info' }
  }

  const formatted = {
    user: post.user,

    likesCount: post.postLikes.length,
    commentsCount: post.comments[0]?.count ?? 0,
    isLiked: post.postLikes?.some((like) => like.userId === userId) ?? false,
  }

  return {
    success: true,
    data: formatted,
  }
}

type GetPostDetailsResult =
  | {
      success: true
      data: PostRowDetails
    }
  | {
      success: false
      message: string
    }

export const fetchPostDetails = async (
  postId: string,
  userId: string,
): Promise<GetPostDetailsResult> => {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id,
      body,
      file,
      createdAt,

      user: users (
        id,
        name,
        image
      ),

      postLikes (
        userId
      ),

      comments (
        id,
        text,
        createdAt,
        author: users (
          id,
          name,
          image
        )
      )
      `,
    )
    .eq('id', postId)
    .single()

  if (error || !data) {
    console.log(`Fetch post details error: ${error?.message}`)
    return { success: false, message: 'Could not fetch post details' }
  }

  const formatted: PostRowDetails = {
    id: data.id,
    body: data.body,
    file: data.file,
    createdAt: data.createdAt,

    user: data.user,

    likesCount: data.postLikes.length,
    isLiked: data.postLikes.some((like) => like.userId === userId),
    commentsCount: data.comments.length,

    comments: (data.comments ?? []).map((c) => ({
      id: c.id,
      text: c.text,
      createdAt: c.createdAt,
      author: c.author,
    })),
  }

  return {
    success: true,
    data: formatted,
  }
}
