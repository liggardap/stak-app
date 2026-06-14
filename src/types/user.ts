export interface UserResource {
  id: number
  email: string
  locale: 'en-US' | 'nl' | 'id' | 'jv'
  roles: string[]
  firstName: string
  lastName: string
  initials: string
  avatarColor: string
  avatarUrl: string | null
  avatarThumbUrl: string | null
}
