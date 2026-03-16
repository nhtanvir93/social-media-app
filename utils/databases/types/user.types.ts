import { User } from '@supabase/supabase-js'

export type UserRow = {
  id: User['id']
  name: string
  email: string
  image: string | null
  bio: string | null
  phoneNumber: string | null
  address: string | null
}

export type UserInsert = {
  id: User['id']
  name: string
  email: string
  image?: string | null
  bio?: string | null
  phoneNumber?: string | null
  address?: string | null
}

export type UserUpdate = {
  name?: string
  email?: string
  image?: string | null
  bio?: string | null
  phoneNumber?: string | null
  address?: string | null
}
