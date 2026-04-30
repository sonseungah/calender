import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { showToast } from '../components/ui/Toast'

export function Register() {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const nav = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await register(email, pw, name, handle)
      showToast(`${name}님 환영해요 ✦`)
      nav('/')
    } catch (err: any) {
      showToast(err.response?.data?.message ?? '가입에 실패했어요')
    } finally { setLoading(false) }
  }

  const inp: React.CSSProperties = { width:'100%', padding:'11px 13px', border:'1.5px solid var(--line)', borderRadius:7, fontSize:14, color:'var(--ink)', background:'var(--bg-card)', fontFamily:'inherit', outline:'none', marginTop:6 }

  return (
    <main style={{ maxWidth: 420, margin: '80px auto', padding: '0 16px' }}>
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--line)', borderRadius:12, padding:'36px 32px' }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'var(--ink)', marginBottom:6 }}>스트리머 가입</h1>
        <p style={{ fontSize:13, color:'var(--ink-soft)', marginBottom:28 }}>채널을 등록하고 방송 일정을 공유하세요.</p>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ fontSize:11, color:'var(--ink-soft)', fontWeight:500 }}>채널명</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="뭉그리" required style={inp} />
          </div>
          <div>
            <label style={{ fontSize:11, color:'var(--ink-soft)', fontWeight:500 }}>핸들 (@제외)</label>
            <input value={handle} onChange={e=>setHandle(e.target.value.replace(/[^a-z0-9_]/gi,'').toLowerCase())} placeholder="munggeuri" required style={inp} />
            {handle && <p style={{ fontSize:11, color:'var(--ink-light)', marginTop:4 }}>채널 URL: /channel/{handle}</p>}
          </div>
          <div>
            <label style={{ fontSize:11, color:'var(--ink-soft)', fontWeight:500 }}>이메일</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={inp} />
          </div>
          <div>
            <label style={{ fontSize:11, color:'var(--ink-soft)', fontWeight:500 }}>비밀번호</label>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} required minLength={6} style={inp} />
          </div>
          <button type="submit" disabled={loading} style={{ padding:'12px', background:'var(--navy)', color:'#fff', border:'none', borderRadius:7, fontSize:14, fontWeight:600, cursor:'pointer', marginTop:4 }}>
            {loading ? '가입 중…' : '가입하기'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--ink-soft)' }}>
          이미 계정이 있으신가요? <Link to="/login" style={{ color:'var(--navy)', fontWeight:600 }}>로그인</Link>
        </p>
      </div>
    </main>
  )
}
