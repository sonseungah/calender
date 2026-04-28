'use client'
import { useEffect, useState, useCallback } from 'react'

let showToastFn: ((msg: string) => void) | null = null

export function showToast(msg: string) {
  showToastFn?.(msg)
}

export function ToastProvider() {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)

  const show = useCallback((m: string) => {
    setMsg(m)
    setVisible(true)
    setTimeout(() => setVisible(false), 1800)
  }, [])

  useEffect(() => {
    showToastFn = show
    return () => { showToastFn = null }
  }, [show])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
        background: 'var(--ink)',
        color: '#fff',
        padding: '12px 22px',
        borderRadius: 30,
        fontSize: 12.5,
        fontWeight: 500,
        boxShadow: '0 6px 20px rgba(0,0,0,.2)',
        opacity: visible ? 1 : 0,
        pointerEvents: 'none',
        transition: 'all .25s',
        zIndex: 300,
        whiteSpace: 'nowrap',
      }}
    >
      {msg}
    </div>
  )
}
