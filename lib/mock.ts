import { Streamer, StreamerEvent, StreamerWithFollow } from '@/types'

export const MOCK_STREAMERS: Streamer[] = [
  {
    id: 'str-1',
    channel_id: 'ch_munggeuri',
    name: '뭉그리',
    handle: '@munggeuri',
    avatar_url: null,
    follower_count: 28470,
    is_verified: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'str-2',
    channel_id: 'ch_fluffy42',
    name: '폭신냥이',
    handle: '@fluffy42',
    avatar_url: null,
    follower_count: 12300,
    is_verified: false,
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'str-3',
    channel_id: 'ch_cozy88',
    name: '포근곰돌',
    handle: '@cozy88',
    avatar_url: null,
    follower_count: 8500,
    is_verified: false,
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'str-4',
    channel_id: 'ch_star77',
    name: '별토끼',
    handle: '@star77',
    avatar_url: null,
    follower_count: 5200,
    is_verified: false,
    created_at: '2024-04-01T00:00:00Z',
  },
]

function offsetDate(days: number, time = '20:00') {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const MOCK_EVENTS: StreamerEvent[] = [
  // 뭉그리
  { id: 'ev-1', streamer_id: 'str-1', date: offsetDate(0), start_time: '21:00', title: '주간 잡담 라이브', category: 'chat', description: '한 주 마무리 잡담 시간 ☁️', created_at: '', updated_at: '' },
  { id: 'ev-2', streamer_id: 'str-1', date: offsetDate(1), start_time: '20:00', title: '발로란트 랭크 도전', category: 'game', description: '', created_at: '', updated_at: '' },
  { id: 'ev-3', streamer_id: 'str-1', date: offsetDate(3), start_time: '19:00', title: '합방 · 마인크래프트', category: 'collab', description: '구름 친구들과 건축 대회', created_at: '', updated_at: '' },
  { id: 'ev-4', streamer_id: 'str-1', date: offsetDate(5), start_time: '22:30', title: '멤버 전용 ASMR 게임밤', category: 'member', description: '멤버십 가입자 한정 야간 방송', created_at: '', updated_at: '' },
  { id: 'ev-5', streamer_id: 'str-1', date: offsetDate(7), start_time: '21:00', title: '발로란트 시즌 마무리', category: 'game', description: '', created_at: '', updated_at: '' },
  { id: 'ev-6', streamer_id: 'str-1', date: offsetDate(10), start_time: '20:00', title: '신작 게임 첫방', category: 'game', description: '발표 임박! 어떤 게임일까요', created_at: '', updated_at: '' },
  { id: 'ev-7', streamer_id: 'str-1', date: offsetDate(12), start_time: '19:30', title: '저챗 · Q&A', category: 'chat', description: '', created_at: '', updated_at: '' },
  // 폭신냥이
  { id: 'ev-8', streamer_id: 'str-2', date: offsetDate(0), start_time: '20:00', title: '리그오브레전드 다이아 도전', category: 'game', description: '', created_at: '', updated_at: '' },
  { id: 'ev-9', streamer_id: 'str-2', date: offsetDate(2), start_time: '21:00', title: '시청자 게임 대회', category: 'collab', description: '', created_at: '', updated_at: '' },
  { id: 'ev-10', streamer_id: 'str-2', date: offsetDate(6), start_time: '22:00', title: '새벽 감성 저챗', category: 'chat', description: '', created_at: '', updated_at: '' },
  // 포근곰돌
  { id: 'ev-11', streamer_id: 'str-3', date: offsetDate(1), start_time: '19:00', title: '스타크래프트 레전드 매치', category: 'game', description: '', created_at: '', updated_at: '' },
  { id: 'ev-12', streamer_id: 'str-3', date: offsetDate(4), start_time: '21:30', title: '공포게임 챌린지', category: 'game', description: '', created_at: '', updated_at: '' },
]

export function getMockStreamer(handle: string): Streamer | null {
  return MOCK_STREAMERS.find(s => s.handle === `@${handle}`) ?? null
}

export function getMockEvents(streamerId: string): StreamerEvent[] {
  return MOCK_EVENTS.filter(e => e.streamer_id === streamerId)
}

export function getMockStreamersWithFollow(q?: string): StreamerWithFollow[] {
  let list = MOCK_STREAMERS
  if (q) {
    const lq = q.toLowerCase()
    list = list.filter(s => s.name.includes(q) || s.handle.toLowerCase().includes(lq))
  }
  return list.map(s => ({
    ...s,
    is_following: false,
    event_count: MOCK_EVENTS.filter(e => e.streamer_id === s.id).length,
  }))
}
