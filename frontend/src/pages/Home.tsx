import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import type { Streamer } from '../types'
import { StreamerCard } from '../components/ui/StreamerCard'

export function Home() {
  const [streamers, setStreamers] = useState<Streamer[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/streamers', { params: q ? { q } : {} })
        setStreamers(data)
      } catch { setStreamers([]) }
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px 100px', width: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-light)', textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>Streamer Calendar</p>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>스케줄링</h1>
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--ink-soft)' }}>치지직 스트리머를 팔로우하고, 방송 일정을 내 캘린더에서 받아보세요.</p>
      </div>

      {/* 검색 */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-light)', fontSize: 16, pointerEvents: 'none' }}>⌕</span>
        <input
          type="search" value={q} onChange={e => setQ(e.target.value)}
          placeholder="스트리머 이름 또는 @핸들 검색"
          style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1.5px solid var(--line)', borderRadius: 8, background: 'var(--bg-card)', fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'inherit' }}
          onFocus={e => (e.target.style.borderColor = 'var(--navy)')}
          onBlur={e => (e.target.style.borderColor = 'var(--line)')}
        />
      </div>

      <p style={{ fontSize: 11, color: 'var(--ink-light)', marginBottom: 14, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
        {q ? `"${q}" 검색 결과 ${streamers.length}명` : '인기 스트리머'}
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-light)', fontSize: 13 }}>불러오는 중…</div>
      ) : streamers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-light)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>∅</div>
          <p style={{ fontSize: 13 }}>스트리머가 없어요</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {streamers.map(s => <StreamerCard key={s.id} streamer={s} />)}
        </div>
      )}

      {/* AdSense */}
      <div style={{ marginTop: 56, paddingTop: 28, borderTop: '1px solid var(--line)', textAlign: 'center' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-light)', textTransform: 'uppercase', marginBottom: 6 }}>Sponsored</div>
        <div style={{ maxWidth: 728, margin: '0 auto', minHeight: 90, background: 'var(--bg-soft)', border: '1px dashed var(--line)', borderRadius: 6, display: 'grid', placeItems: 'center', color: 'var(--ink-light)', fontSize: 11.5 }}>
          광고 영역 · Google AdSense (728×90)
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-light)', flexWrap: 'wrap', gap: 8 }}>
        <span>made with <strong style={{ color: 'var(--navy)' }}>스케줄링</strong></span>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ cursor: 'pointer' }}>이용약관</span>
          <span style={{ cursor: 'pointer' }}>개인정보처리방침</span>
          <span style={{ cursor: 'pointer' }}>문의</span>
        </div>
      </div>
    </main>
  )
}
