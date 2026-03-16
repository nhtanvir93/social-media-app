import { UserInsert, UserRow, UserUpdate } from './user.types'

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserRow
        Insert: UserInsert
        Update: UserUpdate
        Relationships: []
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
