import Link from 'next/link'
import { StreamerWithFollow } from '@/types'
import { StreamerAvatar } from './StreamerAvatar'
import { FollowButton } from './FollowButton'

interface Props {
  streamer: StreamerWithFollow
}

export function StreamerCard({ streamer }: Props) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        transition: 'box-shadow .15s',
      }}
    >
      <Link href={`/channel/${streamer.handle.replace('@', '')}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
        <StreamerAvatar name={streamer.name} avatarUrl={streamer.avatar_url} size={52} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)', fontFamily: "'Cafe24Surround', sans-serif" }}>
              {streamer.name}
            </span>
            {streamer.is_verified && (
              <span style={{ color: 'var(--gold)', fontSize: 12 }}>✦</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
            {streamer.handle}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 4, display: 'flex', gap: 10 }}>
            <span>팔로워 {streamer.follower_count.toLocaleString()}</span>
            {streamer.event_count !== undefined && (
              <span>예정 방송 {streamer.event_count}건</span>
            )}
          </div>
        </div>
      </Link>
      <FollowButton
        streamerId={streamer.id}
        initialFollowing={streamer.is_following ?? false}
      />
    </div>
  )
}
