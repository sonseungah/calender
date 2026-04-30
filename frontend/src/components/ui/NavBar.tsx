import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth'

export function NavBar() {
  const { pathname } = useLocation()
  const { auth, logout } = useAuth()

  const links = [
    { to: '/',    label: '탐색',    icon: '⊞' },
    { to: '/my',  label: '내 일정', icon: '♡' },
  ]

  return (
    <>
      {/* 데스크톱 */}
      <nav className="hidden sm:flex items-center justify-between px-6 py-3 border-b"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--line)' }}>
        <Link to="/" className="no-underline"
          style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 18, color: 'var(--navy)' }}>
          스케줄링
        </Link>
        <div className="flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} className="no-underline" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 5, fontSize: 13, fontWeight: 500,
              color: pathname === l.to ? 'var(--navy)' : 'var(--ink-soft)',
              background: pathname === l.to ? 'var(--bg-soft)' : 'transparent',
            }}>
              {l.icon} {l.label}
            </Link>
          ))}
          {auth ? (
            <button onClick={logout} style={{
              marginLeft: 8, padding: '7px 14px', borderRadius: 5, fontSize: 12,
              border: '1px solid var(--line)', background: 'none',
              color: 'var(--ink-soft)', cursor: 'pointer',
            }}>
              로그아웃
            </button>
          ) : (
            <Link to="/login" className="no-underline" style={{
              marginLeft: 8, padding: '7px 16px', borderRadius: 5, fontSize: 12,
              background: 'var(--navy)', color: '#fff', fontWeight: 600,
            }}>
              로그인
            </Link>
          )}
        </div>
      </nav>

      {/* 모바일 하단 탭 */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 flex border-t z-50"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--line)' }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} className="flex-1 flex flex-col items-center py-3 gap-0.5 no-underline">
            <span style={{ fontSize: 20 }}>{l.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: pathname === l.to ? 'var(--navy)' : 'var(--ink-light)' }}>
              {l.label}
            </span>
          </Link>
        ))}
        {auth ? (
          <button onClick={logout} className="flex-1 flex flex-col items-center py-3 gap-0.5"
            style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            <span style={{ fontSize: 20 }}>⊗</span>
            <span style={{ fontSize: 10, color: 'var(--ink-light)' }}>로그아웃</span>
          </button>
        ) : (
          <Link to="/login" className="flex-1 flex flex-col items-center py-3 gap-0.5 no-underline">
            <span style={{ fontSize: 20 }}>⊙</span>
            <span style={{ fontSize: 10, color: 'var(--ink-light)' }}>로그인</span>
          </Link>
        )}
      </nav>
    </>
  )
}
