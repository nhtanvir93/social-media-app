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
