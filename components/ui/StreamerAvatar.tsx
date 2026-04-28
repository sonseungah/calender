import Image from 'next/image'

interface Props {
  name: string
  avatarUrl: string | null
  size?: number
}

const PALETTES = [
  ['#a8c2eb', '#6b8cce', '#2a3556'],
  ['#f5d8da', '#e8b8bd', '#8a3a40'],
  ['#d4e8dc', '#8ec0a0', '#3a7a5a'],
  ['#f5ebd4', '#d8b87a', '#8a6d2c'],
  ['#e0d4f0', '#a890d4', '#5a3a8a'],
  ['#ffd89b', '#f5a07a', '#a85230'],
]

function hashName(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return h
}

export function StreamerAvatar({ name, avatarUrl, size = 64 }: Props) {
  if (avatarUrl) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        overflow: 'hidden', flexShrink: 0,
        boxShadow: '0 4px 14px rgba(42,53,86,.15)',
      }}>
        <Image src={avatarUrl} alt={name} width={size} height={size} style={{ objectFit: 'cover' }} />
      </div>
    )
  }

  const h = hashName(name)
  const p = PALETTES[h % PALETTES.length]
  const initials = name.slice(0, 1)

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle at 35% 30%, ${p[0]}, ${p[1]} 60%, ${p[2]})`,
      display: 'grid', placeItems: 'center', flexShrink: 0,
      boxShadow: '0 4px 14px rgba(42,53,86,.15)',
      color: '#fff', fontWeight: 700,
      fontSize: size * 0.38,
      fontFamily: "'Cafe24Surround', sans-serif",
    }}>
      {initials}
    </div>
  )
}
