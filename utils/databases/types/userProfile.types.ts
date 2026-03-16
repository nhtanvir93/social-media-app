import { User } from '@supabase/supabase-js'

export type UserProfileRow = {
  id: User['id']
  name: string
  email: string
  image: string | null
  bio: string | null
  phoneNumber: string | null
  address: string | null
}

export type UserProfileInsert = {
  id: User['id']
  name: string
  email: string
  image?: string | null
  bio?: string | null
  phoneNumber?: string | null
  address?: string | null
}

export type UserProfileUpdate = {
  name?: string
  email?: string
  image?: string | null
  bio?: string | null
  phoneNumber?: string | null
  address?: string | null
}
