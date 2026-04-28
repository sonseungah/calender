import { NavBar } from '@/components/ui/NavBar'
import { ToastProvider } from '@/components/ui/Toast'
import { StreamerCard } from '@/components/ui/StreamerCard'
import { CalendarView } from '@/components/Calendar/CalendarView'
import { MOCK_STREAMERS, MOCK_EVENTS } from '@/lib/mock'
import Link from 'next/link'

export default function MyPage() {
  // mock: 첫 두 스트리머를 팔로우 중인 것처럼 보여주기
  const followed = MOCK_STREAMERS.slice(0, 2).map(s => ({
    ...s,
    is_following: true,
    event_count: MOCK_EVENTS.filter(e => e.streamer_id === s.id).length,
  }))

  const followedIds = followed.map(s => s.id)
  const events = MOCK_EVENTS.filter(e => followedIds.includes(e.streamer_id))

  return (
    <>
      <NavBar />
      <ToastProvider />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 100px', width: '100%' }}>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-light)', textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>
            My Calendar
          </p>
          <h1 style={{ fontFamily: "'Cafe24Surround', sans-serif", fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            내 일정
          </h1>
          <p style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-soft)' }}>
            팔로우한 스트리머 {followed.length}명의 방송 일정
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* 통합 캘린더 */}
          <div>
            <p style={{ fontSize: 11, color: 'var(--ink-light)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 12 }}>
              통합 방송 일정
            </p>
            <CalendarView events={events} />
          </div>

          {/* 팔로우 목록 */}
          <div>
            <p style={{ fontSize: 11, color: 'var(--ink-light)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 12 }}>
              팔로우 중
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {followed.map(s => (
                <StreamerCard key={s.id} streamer={s} />
              ))}
            </div>
          </div>

          {/* 구독 안내 */}
          <div style={{
            background: 'var(--cream)', border: '1px solid #e8dcb8',
            borderRadius: 10, padding: '20px 24px',
          }}>
            <h3 style={{ fontFamily: "'Cafe24Surround', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              전체 일정 구독하기
            </h3>
            <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 14 }}>
              팔로우한 모든 스트리머의 일정을 구글/애플 캘린더에 자동으로 받아보세요.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                padding: '9px 18px', borderRadius: 6, fontSize: 12.5,
                background: 'var(--navy)', color: '#fff', fontWeight: 600, cursor: 'pointer',
              }}>
                📅 구글/애플 캘린더 구독
              </span>
              <span style={{
                padding: '9px 18px', borderRadius: 6, fontSize: 12.5,
                border: '1px solid var(--line)', background: 'var(--bg-card)',
                color: 'var(--ink)', fontWeight: 500, cursor: 'pointer',
              }}>
                ↓ .ics 파일 받기
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
