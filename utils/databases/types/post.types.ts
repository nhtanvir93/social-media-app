export type PostRow = {
  id: string
  body?: string
  file?: string
  userId: string
  createdAt: string
}

export type PostPayload = {
  id?: string
  userId: string
} & ({ body: string; file?: string } | { body?: string; file: string })
