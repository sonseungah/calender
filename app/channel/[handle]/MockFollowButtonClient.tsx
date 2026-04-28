'use client'
import { useState } from 'react'
import { showToast } from '@/components/ui/Toast'

export function MockFollowButtonClient() {
  const [following, setFollowing] = useState(false)

  function toggle() {
    setFollowing(f => !f)
    showToast(following ? '팔로우를 취소했어요' : '팔로우했어요 ✦')
  }

  return (
    <button
      onClick={toggle}
      style={{
        padding: '8px 20px',
        borderRadius: 20,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all .15s',
        border: following ? '1.5px solid var(--line)' : '1.5px solid var(--navy)',
        background: following ? 'var(--bg-soft)' : 'var(--navy)',
        color: following ? 'var(--ink-soft)' : '#fff',
        minWidth: 88,
      }}
    >
      {following ? '팔로잉' : '+ 팔로우'}
    </button>
  )
}
