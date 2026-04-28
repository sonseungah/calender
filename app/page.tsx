import { NavBar } from '@/components/ui/NavBar'
import { ToastProvider } from '@/components/ui/Toast'
import { StreamerCard } from '@/components/ui/StreamerCard'
import { HomeSearch } from './HomeSearch'
import { getMockStreamersWithFollow } from '@/lib/mock'

interface SearchProps {
  searchParams: Promise<{ q?: string }>
}

export default async function HomePage({ searchParams }: SearchProps) {
  const { q } = await searchParams
  const enriched = getMockStreamersWithFollow(q)

  return (
    <>
      <NavBar />
      <ToastProvider />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px 100px', width: '100%' }}>

        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-light)', textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>
            Streamer Calendar
          </p>
          <h1 style={{ fontFamily: "'Cafe24Surround', sans-serif", fontSize: 30, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            스케줄링
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--ink-soft)' }}>
            치지직 스트리머를 팔로우하고, 방송 일정을 내 캘린더에서 받아보세요.
          </p>
        </div>

        <HomeSearch defaultValue={q ?? ''} />

        <div style={{ marginTop: 8 }}>
          {q && (
            <p style={{ fontSize: 12, color: 'var(--ink-light)', marginBottom: 16 }}>
              &ldquo;{q}&rdquo; 검색 결과 {enriched.length}명
            </p>
          )}
          {!q && (
            <p style={{ fontSize: 12, color: 'var(--ink-light)', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
              인기 스트리머
            </p>
          )}

          {enriched.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-light)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>∅</div>
              <p style={{ fontSize: 13 }}>&ldquo;{q}&rdquo;에 해당하는 스트리머가 없어요</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {enriched.map(s => (
                <StreamerCard key={s.id} streamer={s} />
              ))}
            </div>
          )}
        </div>

        {/* AdSense */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--line)', textAlign: 'center' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-light)', textTransform: 'uppercase', marginBottom: 6 }}>Sponsored</div>
          <div style={{
            maxWidth: 728, margin: '0 auto', minHeight: 90,
            background: 'var(--bg-soft)', border: '1px dashed var(--line)',
            borderRadius: 6, display: 'grid', placeItems: 'center',
            color: 'var(--ink-light)', fontSize: 11.5,
          }}>
            광고 영역 · Google AdSense (728×90)
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-light)', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontFamily: "'Cafe24Surround', sans-serif" }}>
            made with <strong style={{ color: 'var(--navy)' }}>스케줄링</strong>
          </span>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ cursor: 'pointer' }}>이용약관</span>
            <span style={{ cursor: 'pointer' }}>개인정보처리방침</span>
            <span style={{ cursor: 'pointer' }}>문의</span>
          </div>
        </div>
      </main>
    </>
  )
}
