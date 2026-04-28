'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useRef, useTransition } from 'react'

export function HomeSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams()
        if (val.trim()) params.set('q', val.trim())
        router.push(val.trim() ? `${pathname}?${params}` : pathname)
      })
    }, 300)
  }

  return (
    <div style={{ position: 'relative', marginBottom: 24 }}>
      <span style={{
        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
        color: 'var(--ink-light)', fontSize: 16, pointerEvents: 'none',
      }}>
        ⌕
      </span>
      <input
        type="search"
        placeholder="스트리머 이름 또는 @핸들 검색"
        defaultValue={defaultValue}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '12px 14px 12px 40px',
          border: '1.5px solid var(--line)',
          borderRadius: 8,
          background: 'var(--bg-card)',
          fontSize: 14,
          color: 'var(--ink)',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color .15s',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--navy)')}
        onBlur={e => (e.target.style.borderColor = 'var(--line)')}
      />
      {pending && (
        <span style={{
          position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--ink-light)', fontSize: 12,
        }}>
          검색 중…
        </span>
      )}
    </div>
  )
}
