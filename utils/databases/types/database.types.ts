import { PostPayload, PostRow } from './post.types'
import { UserProfileInsert, UserProfileRow, UserProfileUpdate } from './userProfile.types'

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserProfileRow
        Insert: UserProfileInsert
        Update: UserProfileUpdate
        Relationships: []
      }
      posts: {
        Row: PostRow
        Insert: PostPayload
        Update: PostPayload
        Relationships: [
          {
            foreignKeyName: 'posts_userId_fkey'
            columns: ['userId']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Views: {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Functions: {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Enums: {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    CompositeTypes: {}
  }
}
