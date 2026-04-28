import { notFound } from 'next/navigation'
import { NavBar } from '@/components/ui/NavBar'
import { ToastProvider } from '@/components/ui/Toast'
import { StreamerAvatar } from '@/components/ui/StreamerAvatar'
import { ChannelCalendar } from './ChannelCalendar'
import { getMockStreamer, getMockEvents } from '@/lib/mock'

interface Props {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: Props) {
  const { handle } = await params
  const streamer = getMockStreamer(handle)
  if (!streamer) return { title: '스케줄링' }
  return {
    title: `${streamer.name} 방송 일정 · 스케줄링`,
    description: `${streamer.handle} 의 방송 일정을 확인하고 내 캘린더에 추가하세요`,
  }
}

export default async function ChannelPage({ params }: Props) {
  const { handle } = await params
  const streamer = getMockStreamer(handle)
  if (!streamer) notFound()

  const events = getMockEvents(streamer.id)

  return (
    <>
      <NavBar />
      <ToastProvider />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 100px', width: '100%' }}>

        {/* 채널 헤더 */}
        <header style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16, marginBottom: 28,
          paddingBottom: 24, borderBottom: '1px solid var(--line)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <StreamerAvatar name={streamer.name} avatarUrl={streamer.avatar_url} size={72} />
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-light)', textTransform: 'uppercase', fontWeight: 500, marginBottom: 4 }}>
                CHZZK · Live Calendar
              </p>
              <h1 style={{ fontFamily: "'Cafe24Surround', sans-serif", fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {streamer.name}
                {streamer.is_verified && <span style={{ color: 'var(--gold)', marginLeft: 8, fontSize: 16 }}>✦</span>}
              </h1>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>{streamer.handle}</p>
              <p style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 6 }}>
                팔로워 {streamer.follower_count.toLocaleString()}명
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <a
              href={`/api/calendar/${handle}`}
              download
              style={{
                padding: '8px 16px', borderRadius: 6, fontSize: 12.5,
                border: '1px solid var(--line)', background: 'var(--bg-card)',
                color: 'var(--ink)', textDecoration: 'none', fontWeight: 500,
              }}
            >
              ↓ .ics
            </a>
            {/* 팔로우 버튼 — mock에서는 로그인 없이 토스트만 표시 */}
            <MockFollowButton />
          </div>
        </header>

        {/* 캘린더 — mock 모드에서는 읽기 전용 */}
        <ChannelCalendar
          streamer={streamer}
          initialEvents={events}
          isOwner={false}
        />

      </main>
    </>
  )
}

function MockFollowButton() {
  return (
    // 클라이언트 상호작용이므로 별도 컴포넌트로 분리
    <MockFollowButtonClient />
  )
}

// 서버 컴포넌트에서 직접 'use client' 불가 → 인라인 래퍼
import { MockFollowButtonClient } from './MockFollowButtonClient'
