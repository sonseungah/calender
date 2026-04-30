import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { Streamer, StreamerEvent } from '../types'
import { StreamerCard } from '../components/ui/StreamerCard'
import { CalendarView } from '../components/Calendar/CalendarView'

export function My() {
  const { auth } = useAuth()
  const [streamers, setStreamers] = useState<Streamer[]>([])
  const [events, setEvents] = useState<StreamerEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) { setLoading(false); return }
    async function load() {
      try {
        const { data: follows } = await api.get('/follows')
        setStreamers(follows)
        if (follows.length > 0) {
          const ids: number[] = follows.map((s: Streamer) => s.id)
          const today = new Date().toISOString().slice(0, 10)
          const future = new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10)
          const results = await Promise.all(
            ids.map(id => api.get('/events', { params: { streamer_id: id, from: today, to: future } }))
          )
          setEvents(results.flatMap(r => r.data))
        }
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [auth])

  if (!auth) return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 20 }}>♡</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>내 일정</h1>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 28 }}>팔로우한 스트리머들의 방송 일정을<br/>한 곳에서 확인할 수 있어요.</p>
      <Link to="/login" style={{ display:'inline-block', padding:'12px 28px', background:'var(--navy)', color:'#fff', borderRadius:6, textDecoration:'none', fontSize:13, fontWeight:600 }}>로그인하기</Link>
    </main>
  )

  if (loading) return <div style={{ textAlign:'center', padding:'80px 0', color:'var(--ink-light)' }}>불러오는 중…</div>

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 100px', width: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-light)', textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>My Calendar</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>내 일정</h1>
        <p style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-soft)' }}>팔로우한 스트리머 {streamers.length}명의 방송 일정</p>
      </div>

      {streamers.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--ink-light)' }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>∅</div>
          <p style={{ fontSize: 14, marginBottom: 20 }}>아직 팔로우한 스트리머가 없어요</p>
          <Link to="/" style={{ display:'inline-block', padding:'10px 22px', background:'var(--navy)', color:'#fff', borderRadius:6, textDecoration:'none', fontSize:13, fontWeight:600 }}>스트리머 탐색하기</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--ink-light)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 12 }}>통합 방송 일정</p>
            <CalendarView events={events} />
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--ink-light)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 12 }}>팔로우 중</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {streamers.map(s => <StreamerCard key={s.id} streamer={{ ...s, is_following: true }} />)}
            </div>
          </div>
          <div style={{ background:'var(--cream)', border:'1px solid #e8dcb8', borderRadius:10, padding:'20px 24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>전체 일정 구독하기</h3>
            <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 14 }}>팔로우한 모든 스트리머의 일정을 구글/애플 캘린더에 자동으로 받아보세요.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ padding:'9px 18px', borderRadius:6, fontSize:12.5, background:'var(--navy)', color:'#fff', fontWeight:600, cursor:'pointer' }}>📅 구글/애플 캘린더 구독</span>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
