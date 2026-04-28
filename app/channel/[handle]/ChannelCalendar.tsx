'use client'
import { useState } from 'react'
import { CalendarView } from '@/components/Calendar/CalendarView'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { StreamerEvent, Streamer, CATEGORIES, Category } from '@/types'
import { createClient } from '@/lib/supabase'
import { showToast } from '@/components/ui/Toast'

interface Props {
  streamer: Streamer
  initialEvents: StreamerEvent[]
  isOwner: boolean
}

interface FormState {
  open: boolean
  ds: string
  ev: StreamerEvent | null
}

export function ChannelCalendar({ streamer, initialEvents, isOwner }: Props) {
  const [events, setEvents] = useState<StreamerEvent[]>(initialEvents)
  const [form, setForm] = useState<FormState>({ open: false, ds: '', ev: null })
  const [detail, setDetail] = useState<StreamerEvent | null>(null)

  // ─── CRUD ───────────────────────────────────────────────────────

  async function saveEvent(data: {
    title: string; start_time: string; category: Category; description: string
  }) {
    const supabase = createClient()
    if (form.ev) {
      // 수정
      const { data: updated, error } = await supabase
        .from('events')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', form.ev.id)
        .select()
        .single()
      if (error) { showToast('저장에 실패했어요'); return }
      setEvents(evs => evs.map(e => e.id === updated.id ? updated : e))
      showToast('일정이 수정되었어요')
    } else {
      // 추가
      const { data: created, error } = await supabase
        .from('events')
        .insert({ streamer_id: streamer.id, date: form.ds, ...data })
        .select()
        .single()
      if (error) { showToast('저장에 실패했어요'); return }
      setEvents(evs => [...evs, created])
      showToast('일정이 추가되었어요 ✦')
    }
    setForm({ open: false, ds: '', ev: null })
  }

  async function deleteEvent(id: string) {
    if (!confirm('이 일정을 삭제할까요?')) return
    const supabase = createClient()
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) { showToast('삭제에 실패했어요'); return }
    setEvents(evs => evs.filter(e => e.id !== id))
    setDetail(null)
    showToast('일정이 삭제되었어요')
  }

  function downloadSingleICS(ev: StreamerEvent) {
    import('@/lib/ics').then(({ buildICSFile }) => {
      const content = buildICSFile(streamer, [ev])
      const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${ev.title.replace(/[^\w가-힣]/g, '_').slice(0, 30)}_${ev.date}.ics`
      document.body.appendChild(a); a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('일정 파일이 다운로드되었어요 ✦')
    })
  }

  return (
    <>
      {/* 캘린더 */}
      <CalendarView
        events={events}
        editable={isOwner}
        onEventClick={setDetail}
        onAddClick={ds => setForm({ open: true, ds, ev: null })}
      />

      {/* 일정 상세 모달 */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="방송 상세"
        footer={
          isOwner ? (
            <>
              <Button variant="default" onClick={() => { setForm({ open: true, ds: detail!.date, ev: detail }); setDetail(null) }}>수정</Button>
              <Button variant="default" onClick={() => deleteEvent(detail!.id)}>삭제</Button>
              <Button variant="primary" onClick={() => downloadSingleICS(detail!)}>↓ .ics 다운로드</Button>
            </>
          ) : (
            <>
              <Button variant="default" onClick={() => setDetail(null)}>닫기</Button>
              <Button variant="gold" onClick={() => downloadSingleICS(detail!)}>내 캘린더에 추가</Button>
            </>
          )
        }
      >
        {detail && <EventDetail ev={detail} />}
      </Modal>

      {/* 일정 추가/수정 폼 모달 */}
      <Modal
        open={form.open}
        onClose={() => setForm({ open: false, ds: '', ev: null })}
        title={form.ev ? '일정 수정' : '새 일정 추가'}
      >
        {form.open && (
          <EventForm
            ds={form.ds}
            ev={form.ev}
            onSave={saveEvent}
            onCancel={() => setForm({ open: false, ds: '', ev: null })}
          />
        )}
      </Modal>
    </>
  )
}

// ─── 상세 뷰 ───────────────────────────────────────────────────────
function EventDetail({ ev }: { ev: StreamerEvent }) {
  const cat = CATEGORIES[ev.category]
  const d = new Date(ev.date + 'T00:00:00')
  const WD_KO = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div>
      <span style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: 20,
        fontSize: 11, fontWeight: 600, marginBottom: 12,
        background: cat.color + '22', color: cat.color,
      }}>{cat.ko}</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 14, fontFamily: "'Cafe24Surround', sans-serif" }}>
        {ev.title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--ink-soft)' }}>
        <div><span style={{ color: 'var(--ink-light)', fontSize: 11, marginRight: 8 }}>날짜</span>
          {d.getFullYear()}년 {d.getMonth() + 1}월 {d.getDate()}일 ({WD_KO[d.getDay()]})</div>
        <div><span style={{ color: 'var(--ink-light)', fontSize: 11, marginRight: 8 }}>시간</span>
          {ev.start_time.slice(0, 5)} 시작</div>
      </div>
      {ev.description && (
        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {ev.description}
        </p>
      )}
    </div>
  )
}

// ─── 폼 ────────────────────────────────────────────────────────────
function EventForm({ ds, ev, onSave, onCancel }: {
  ds: string
  ev: StreamerEvent | null
  onSave: (d: { title: string; start_time: string; category: Category; description: string }) => Promise<void>
  onCancel: () => void
}) {
  const [title, setTitle] = useState(ev?.title ?? '')
  const [time, setTime] = useState(ev?.start_time.slice(0, 5) ?? '20:00')
  const [cat, setCat] = useState<Category>(ev?.category ?? 'game')
  const [desc, setDesc] = useState(ev?.description ?? '')
  const [saving, setSaving] = useState(false)

  const d = new Date(ds + 'T00:00:00')
  const WD_KO = ['일', '월', '화', '수', '목', '금', '토']
  const dateLabel = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${WD_KO[d.getDay()]})`

  async function submit() {
    if (!title.trim()) { showToast('제목을 입력해주세요'); return }
    setSaving(true)
    await onSave({ title: title.trim(), start_time: time, category: cat, description: desc.trim() })
    setSaving(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid var(--line)', borderRadius: 6,
    fontSize: 13, color: 'var(--ink)', background: 'var(--bg-card)',
    fontFamily: 'inherit', outline: 'none',
  } as React.CSSProperties

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 11, color: 'var(--ink-light)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
        {dateLabel}
      </p>

      <div>
        <label style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 500, display: 'block', marginBottom: 6 }}>제목</label>
        <input
          type="text" value={title} maxLength={60}
          onChange={e => setTitle(e.target.value)}
          placeholder="예: 발로란트 랭크 도전"
          style={inputStyle}
          autoFocus
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 500, display: 'block', marginBottom: 6 }}>시작 시간</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 500, display: 'block', marginBottom: 6 }}>분류</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(Object.keys(CATEGORIES) as Category[]).map(k => (
              <button
                key={k}
                type="button"
                onClick={() => setCat(k)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11.5,
                  fontWeight: 600, cursor: 'pointer', transition: 'all .1s',
                  border: cat === k ? `1.5px solid ${CATEGORIES[k].color}` : '1.5px solid var(--line)',
                  background: cat === k ? CATEGORIES[k].color + '20' : 'transparent',
                  color: cat === k ? CATEGORIES[k].color : 'var(--ink-soft)',
                }}
              >{CATEGORIES[k].ko}</button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 500, display: 'block', marginBottom: 6 }}>설명 (선택)</label>
        <textarea
          value={desc} maxLength={300}
          onChange={e => setDesc(e.target.value)}
          placeholder="팬들에게 보여줄 추가 설명"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
        <Button variant="default" onClick={onCancel}>취소</Button>
        <Button variant="primary" onClick={submit} disabled={saving}>
          {saving ? '저장 중…' : ev ? '저장' : '추가하기'}
        </Button>
      </div>
    </div>
  )
}
