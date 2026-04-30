import { useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { showToast } from './Toast'

interface Props {
  streamerId: number
  initialFollowing: boolean
}

export function FollowButton({ streamerId, initialFollowing }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const { auth } = useAuth()

  async function toggle() {
    if (!auth) { showToast('로그인 후 팔로우할 수 있어요'); return }
    setLoading(true)
    try {
      if (following) {
        await api.delete(`/follows/${streamerId}`)
        setFollowing(false)
        showToast('팔로우를 취소했어요')
      } else {
        await api.post(`/follows/${streamerId}`)
        setFollowing(true)
        showToast('팔로우했어요 ✦')
      }
    } catch {
      showToast('오류가 발생했어요')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={toggle} disabled={loading} style={{
      padding: '7px 18px', borderRadius: 20, fontSize: 12.5, fontWeight: 600,
      cursor: 'pointer', transition: 'all .15s', minWidth: 88,
      border: following ? '1.5px solid var(--line)' : '1.5px solid var(--navy)',
      background: following ? 'var(--bg-soft)' : 'var(--navy)',
      color: following ? 'var(--ink-soft)' : '#fff',
    }}>
      {loading ? '…' : following ? '팔로잉' : '+ 팔로우'}
    </button>
  )
}
