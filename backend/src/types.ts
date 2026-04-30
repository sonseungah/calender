export interface Streamer {
  id: number
  channel_id: string
  name: string
  handle: string
  avatar_url: string | null
  follower_count: number
  is_verified: boolean
  created_at: string
}

export interface StreamerEvent {
  id: number
  streamer_id: number
  date: string
  start_time: string
  title: string
  category: 'game' | 'chat' | 'collab' | 'member' | 'off'
  description: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  email: string
  password_hash: string
  streamer_id: number | null
  created_at: string
}

// Express Request에 user 추가
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; streamer_id: number | null }
    }
  }
}
