export type Category = 'game' | 'chat' | 'collab' | 'member' | 'off'

export const CATEGORIES: Record<Category, { ko: string; color: string }> = {
  game:   { ko: '게임',     color: '#6b8cce' },
  chat:   { ko: '저챗',     color: '#d4a574' },
  collab: { ko: '합방',     color: '#c97676' },
  member: { ko: '멤버',     color: '#c9a961' },
  off:    { ko: '휴방',     color: '#a8a8a8' },
}

export interface Streamer {
  id: string
  channel_id: string
  name: string
  handle: string
  avatar_url: string | null
  follower_count: number
  is_verified: boolean
  created_at: string
}

export interface StreamerEvent {
  id: string
  streamer_id: string
  date: string          // 'YYYY-MM-DD'
  start_time: string    // 'HH:MM'
  title: string
  category: Category
  description: string | null
  created_at: string
  updated_at: string
}

export interface Follow {
  fan_id: string
  streamer_id: string
  followed_at: string
}

// 팔로우 정보 포함된 스트리머 (목록/검색용)
export interface StreamerWithFollow extends Streamer {
  is_following?: boolean
  event_count?: number
}
