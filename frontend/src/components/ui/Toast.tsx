import { create } from 'zustand'

interface ToastStore { msg: string; show: boolean; showToast: (m: string) => void }
export const useToastStore = create<ToastStore>((set) => ({
  msg: '', show: false,
  showToast: (m) => {
    set({ msg: m, show: true })
    setTimeout(() => set({ show: false }), 1800)
  },
}))

export function showToast(m: string) { useToastStore.getState().showToast(m) }

export function Toast() {
  const { msg, show } = useToastStore()
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%',
      transform: `translateX(-50%) translateY(${show ? 0 : 20}px)`,
      background: 'var(--ink)', color: '#fff',
      padding: '11px 22px', borderRadius: 30,
      fontSize: 12.5, fontWeight: 500,
      boxShadow: '0 6px 20px rgba(0,0,0,.2)',
      opacity: show ? 1 : 0, pointerEvents: 'none',
      transition: 'all .25s', zIndex: 300, whiteSpace: 'nowrap',
    }}>
      {msg}
    </div>
  )
}
