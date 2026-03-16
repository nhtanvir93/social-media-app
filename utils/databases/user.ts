import { supabase } from '@/lib/supabase'

export const createUserProfile = async ({
  id,
  email,
  name,
}: {
  id: string
  email: string
  name: string
}) => {
  const { error } = await supabase.from('users').insert({ id, email, name })

  if (error) throw error
  return true
}

export const getCurrentUser = async () => {
  const {
    error,
    data: { user },
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}
