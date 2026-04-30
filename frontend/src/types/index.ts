export type Category = 'game' | 'chat' | 'collab' | 'member' | 'off'

export const CATEGORIES: Record<Category, { ko: string; color: string }> = {
  game:   { ko: '게임',   color: '#6b8cce' },
  chat:   { ko: '저챗',   color: '#d4a574' },
  collab: { ko: '합방',   color: '#c97676' },
  member: { ko: '멤버',   color: '#c9a961' },
  off:    { ko: '휴방',   color: '#a8a8a8' },
}

export interface Streamer {
  id: number
  channel_id: string
  name: string
  handle: string
  avatar_url: string | null
  follower_count: number
  is_verified: boolean
  is_following?: boolean
  upcoming_count?: number
  created_at: string
}

export interface StreamerEvent {
  id: number
  streamer_id: number
  date: string
  start_time: string
  title: string
  category: Category
  description: string | null
  created_at: string
  updated_at: string
}

export interface AuthState {
  token: string
  user: { id?: number; email: string; streamer_id: number | null; name?: string; handle?: string }
}
