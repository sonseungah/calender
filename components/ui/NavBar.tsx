'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavBar() {
  const path = usePathname()

  const links = [
    { href: '/',    label: '탐색',    icon: '⊞' },
    { href: '/my',  label: '내 일정', icon: '♡' },
  ]

  return (
    <>
      {/* 데스크톱 상단 바 */}
      <nav
        className="hidden sm:flex items-center justify-between px-6 py-3 border-b"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--line)' }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Cafe24Surround', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: 'var(--navy)',
            letterSpacing: '-0.02em',
          }}>
            스케줄링
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{ textDecoration: 'none' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px',
                borderRadius: 5,
                fontSize: 13,
                fontWeight: 500,
                color: path === l.href ? 'var(--navy)' : 'var(--ink-soft)',
                background: path === l.href ? 'var(--bg-soft)' : 'transparent',
                transition: 'all .15s',
              }}>
                {l.icon} {l.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      {/* 모바일 하단 탭 바 */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 flex border-t z-50"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--line)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className="flex-1 flex flex-col items-center py-3 gap-0.5"
            style={{ textDecoration: 'none' }}
          >
            <span style={{ fontSize: 20 }}>{l.icon}</span>
            <span style={{
              fontSize: 10,
              fontWeight: 500,
              color: path === l.href ? 'var(--navy)' : 'var(--ink-light)',
            }}>
              {l.label}
            </span>
          </Link>
        ))}
      </nav>
    </>
  )
}
