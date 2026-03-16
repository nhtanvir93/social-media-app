import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from 'react'

import { Database } from '@/utils/databases/types/database.types'

type UserProfile = Database['public']['Tables']['users']['Row']

type AuthContextType = {
  userProfile: UserProfile | null | undefined
  setUserProfile: Dispatch<SetStateAction<UserProfile | null | undefined>>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null | undefined>(
    undefined,
  )

  return (
    <AuthContext.Provider
      value={{
        userProfile,
        setUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
