import { useEffect, useRef } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({ open, onClose, title, children, footer }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null
  return (
    <div ref={ref} onClick={e => { if (e.target === ref.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(29,36,64,.45)',
        backdropFilter: 'blur(3px)', display: 'grid', placeItems: 'center',
        zIndex: 200, padding: 16,
      }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 10, width: '100%',
        maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,.2)', overflow: 'hidden',
      }}>
        {title && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px 12px', borderBottom: '1px solid var(--line)',
          }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--ink-light)' }}>×</button>
          </div>
        )}
        <div style={{ padding: '18px 20px' }}>{children}</div>
        {footer && (
          <div style={{
            padding: '12px 20px', borderTop: '1px solid var(--line)',
            display: 'flex', justifyContent: 'flex-end', gap: 8,
          }}>{footer}</div>
        )}
      </div>
    </div>
  )
}
