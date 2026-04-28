'use client'
import { useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: number
}

export function Modal({ open, onClose, title, children, footer, width = 480 }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(29,36,64,.45)',
        backdropFilter: 'blur(3px)',
        display: 'grid', placeItems: 'center',
        zIndex: 200, padding: 16,
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 10,
          width: '100%',
          maxWidth: width,
          boxShadow: '0 20px 60px rgba(0,0,0,.2)',
          overflow: 'hidden',
        }}
      >
        {title && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '18px 22px 14px',
            borderBottom: '1px solid var(--line)',
          }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{title}</span>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 20, color: 'var(--ink-light)', lineHeight: 1,
              }}
            >×</button>
          </div>
        )}
        <div style={{ padding: '20px 22px' }}>{children}</div>
        {footer && (
          <div style={{
            padding: '14px 22px',
            borderTop: '1px solid var(--line)',
            display: 'flex', justifyContent: 'flex-end', gap: 8,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
