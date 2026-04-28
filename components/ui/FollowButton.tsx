'use client'
import { useState, useTransition } from 'react'
import { showToast } from './Toast'

interface Props {
  streamerId: string
  initialFollowing: boolean
  onToggle?: (following: boolean) => void
}

export function FollowButton({ streamerId, initialFollowing, onToggle }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [pending, startTransition] = useTransition()

  async function toggle() {
    startTransition(async () => {
      // mock 모드: Supabase 없이 로컬 상태만 토글
      const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') ||
        process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('YOUR_PROJECT')

      if (isMock) {
        setFollowing(f => !f)
        onToggle?.(!following)
        showToast(following ? '팔로우를 취소했어요' : '팔로우했어요 ✦')
        return
      }

      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        showToast('로그인 후 팔로우할 수 있어요')
        return
      }

      if (following) {
        await supabase.from('follows').delete()
          .eq('fan_id', user.id)
          .eq('streamer_id', streamerId)
        setFollowing(false)
        onToggle?.(false)
        showToast('팔로우를 취소했어요')
      } else {
        await supabase.from('follows').insert({ fan_id: user.id, streamer_id: streamerId })
        setFollowing(true)
        onToggle?.(true)
        showToast('팔로우했어요 ✦')
      }
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      style={{
        padding: '7px 16px',
        borderRadius: 20,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all .15s',
        border: following ? '1.5px solid var(--line)' : '1.5px solid var(--navy)',
        background: following ? 'var(--bg-soft)' : 'var(--navy)',
        color: following ? 'var(--ink-soft)' : '#fff',
        minWidth: 80,
      }}
    >
      {pending ? '…' : following ? '팔로잉' : '+ 팔로우'}
    </button>
  )
}
