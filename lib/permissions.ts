import { User } from './auth'

export type UserType = 'User1' | 'User2' | 'User3' | 'User4'

export function hasPermission(user: User | null, requiredType: UserType | UserType[]): boolean {
  if (!user) return false
  
  const requiredTypes = Array.isArray(requiredType) ? requiredType : [requiredType]
  return requiredTypes.includes(user.userType as UserType)
}

export function canViewZapis(user: User | null): boolean {
  return hasPermission(user, ['User1', 'User2', 'User3', 'User4'])
}

export function canEditZapis(user: User | null): boolean {
  return hasPermission(user, ['User1', 'User3'])
}

export function canCreateZapis(user: User | null): boolean {
  return hasPermission(user, ['User1', 'User3'])
}

export function canDeleteZapis(user: User | null): boolean {
  return hasPermission(user, ['User1'])
}

export function canAccessViewDb(user: User | null): boolean {
  return hasPermission(user, ['User1'])
}

export function canViewOnlyOwnZapis(user: User | null): boolean {
  return hasPermission(user, ['User4'])
}
