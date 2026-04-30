import { Link } from 'react-router-dom'
import type { Streamer } from '../../types'
import { FollowButton } from './FollowButton'

const PALETTES = [
  ['#a8c2eb','#6b8cce','#2a3556'], ['#f5d8da','#e8b8bd','#8a3a40'],
  ['#d4e8dc','#8ec0a0','#3a7a5a'], ['#f5ebd4','#d8b87a','#8a6d2c'],
  ['#e0d4f0','#a890d4','#5a3a8a'], ['#ffd89b','#f5a07a','#a85230'],
]
function hashName(n: string) {
  let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h
}

function Avatar({ name, avatarUrl, size = 52 }: { name: string; avatarUrl: string | null; size?: number }) {
  if (avatarUrl) return <img src={avatarUrl} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  const p = PALETTES[hashName(name) % PALETTES.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `radial-gradient(circle at 35% 30%, ${p[0]}, ${p[1]} 60%, ${p[2]})`,
      display: 'grid', placeItems: 'center', color: '#fff',
      fontWeight: 700, fontSize: size * 0.4,
    }}>{name.slice(0, 1)}</div>
  )
}

export function StreamerCard({ streamer }: { streamer: Streamer }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: 10,
      padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <Link to={`/channel/${streamer.handle.replace('@', '')}`}
        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
        <Avatar name={streamer.name} avatarUrl={streamer.avatar_url} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>
            {streamer.name}
            {streamer.is_verified && <span style={{ color: 'var(--gold)', marginLeft: 6, fontSize: 12 }}>✦</span>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>{streamer.handle}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 4, display: 'flex', gap: 10 }}>
            <span>팔로워 {streamer.follower_count.toLocaleString()}</span>
            {streamer.upcoming_count !== undefined && <span>예정 {streamer.upcoming_count}건</span>}
          </div>
        </div>
      </Link>
      <FollowButton streamerId={streamer.id} initialFollowing={!!streamer.is_following} />
    </div>
  )
}
