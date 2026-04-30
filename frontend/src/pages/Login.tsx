import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { showToast } from '../components/ui/Toast'

export function Login() {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, pw)
      showToast('로그인됐어요 ✦')
      nav('/')
    } catch {
      showToast('이메일 또는 비밀번호가 틀렸어요')
    } finally { setLoading(false) }
  }

  const inp: React.CSSProperties = { width:'100%', padding:'11px 13px', border:'1.5px solid var(--line)', borderRadius:7, fontSize:14, color:'var(--ink)', background:'var(--bg-card)', fontFamily:'inherit', outline:'none', marginTop:6 }

  return (
    <main style={{ maxWidth: 420, margin: '80px auto', padding: '0 16px' }}>
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--line)', borderRadius:12, padding:'36px 32px' }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'var(--ink)', marginBottom:6 }}>로그인</h1>
        <p style={{ fontSize:13, color:'var(--ink-soft)', marginBottom:28 }}>스케줄링 계정으로 로그인하세요.</p>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={{ fontSize:11, color:'var(--ink-soft)', fontWeight:500 }}>이메일</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" required style={inp} />
          </div>
          <div>
            <label style={{ fontSize:11, color:'var(--ink-soft)', fontWeight:500 }}>비밀번호</label>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" required style={inp} />
          </div>
          <button type="submit" disabled={loading} style={{ padding:'12px', background:'var(--navy)', color:'#fff', border:'none', borderRadius:7, fontSize:14, fontWeight:600, cursor:'pointer', marginTop:4 }}>
            {loading ? '로그인 중…' : '로그인'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--ink-soft)' }}>
          계정이 없으신가요? <Link to="/register" style={{ color:'var(--navy)', fontWeight:600 }}>스트리머로 가입</Link>
        </p>
      </div>
    </main>
  )
}
