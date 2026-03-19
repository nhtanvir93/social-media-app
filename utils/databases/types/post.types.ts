export type PostRow = {
  id: string
  body?: string
  file_url?: string
  user_id: string
  created_at: string
}

export type PostPayload = {
  id?: string
  user_id: string
} & ({ body: string; file_url?: string } | { body?: string; file_url: string })
