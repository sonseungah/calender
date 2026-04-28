'use client'
import { useState, useMemo } from 'react'
import { StreamerEvent, CATEGORIES, Category } from '@/types'

type View = 'month' | 'week' | 'day'

const WD_KO = ['일', '월', '화', '수', '목', '금', '토']
const WD_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}
function startOfWeek(d: Date) {
  const r = new Date(d); r.setDate(r.getDate() - r.getDay()); return r
}
function isToday(d: Date) {
  const t = new Date()
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate()
}

interface Props {
  events: StreamerEvent[]
  onEventClick?: (ev: StreamerEvent) => void
  onDayClick?: (ds: string) => void
  /** 스트리머 모드일 때만 true */
  editable?: boolean
  onAddClick?: (ds: string) => void
}

export function CalendarView({ events, onEventClick, onDayClick, editable, onAddClick }: Props) {
  const [view, setView] = useState<View>('month')
  const [cur, setCur] = useState(new Date())

  const evMap = useMemo(() => {
    const m: Record<string, StreamerEvent[]> = {}
    events.forEach(e => {
      if (!m[e.date]) m[e.date] = []
      m[e.date].push(e)
    })
    Object.values(m).forEach(arr => arr.sort((a, b) => a.start_time.localeCompare(b.start_time)))
    return m
  }, [events])

  // ─── Nav ───
  function nav(dir: -1 | 1) {
    if (view === 'month') setCur(d => new Date(d.getFullYear(), d.getMonth() + dir, 1))
    else if (view === 'week') setCur(d => addDays(d, dir * 7))
    else setCur(d => addDays(d, dir))
  }

  function navLabel() {
    if (view === 'month') return `${cur.getFullYear()}년 ${cur.getMonth() + 1}월`
    if (view === 'week') {
      const s = startOfWeek(cur)
      const e = addDays(s, 6)
      return s.getMonth() === e.getMonth()
        ? `${s.getMonth() + 1}월 ${s.getDate()}일 — ${e.getDate()}일`
        : `${s.getMonth() + 1}월 ${s.getDate()}일 — ${e.getMonth() + 1}월 ${e.getDate()}일`
    }
    return `${cur.getMonth() + 1}월 ${cur.getDate()}일 (${WD_KO[cur.getDay()]})`
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
      {/* 툴바 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap', gap: 10,
      }}>
        {/* 뷰 탭 */}
        <div style={{ display: 'inline-flex', background: 'var(--bg-soft)', padding: 3, borderRadius: 6 }}>
          {(['month', 'week', 'day'] as View[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                background: view === v ? 'var(--bg-card)' : 'none',
                border: 'none', borderRadius: 4,
                padding: '7px 14px', fontSize: 12.5,
                color: view === v ? 'var(--ink)' : 'var(--ink-soft)',
                cursor: 'pointer', fontWeight: 500,
                boxShadow: view === v ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
              }}
            >
              {{ month: '월간', week: '주간', day: '일간' }[v]}
            </button>
          ))}
        </div>
        {/* 날짜 이동 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setCur(new Date())}
            style={{
              border: '1px solid var(--line)', background: 'var(--bg-card)',
              color: 'var(--ink-soft)', padding: '6px 12px', borderRadius: 4,
              fontSize: 11, fontWeight: 500, cursor: 'pointer', letterSpacing: '0.05em',
            }}
          >TODAY</button>
          {(['‹', '›'] as const).map((arrow, i) => (
            <button
              key={arrow}
              onClick={() => nav(i === 0 ? -1 : 1)}
              style={{
                width: 30, height: 30, borderRadius: '50%',
                border: '1px solid var(--line)', background: 'var(--bg-card)',
                cursor: 'pointer', color: 'var(--ink-soft)', fontSize: 15,
              }}
            >{arrow}</button>
          ))}
          <span style={{
            fontFamily: "'Cafe24Surround', sans-serif",
            fontSize: 16, color: 'var(--ink)', minWidth: 140, textAlign: 'center',
          }}>
            {navLabel()}
          </span>
        </div>
      </div>

      {/* 뷰 렌더 */}
      {view === 'month' && (
        <MonthView cur={cur} evMap={evMap} editable={editable}
          onEventClick={onEventClick} onDayClick={onDayClick} onAddClick={onAddClick}
          setCur={setCur} setView={setView} />
      )}
      {view === 'week' && (
        <WeekView cur={cur} evMap={evMap} editable={editable}
          onEventClick={onEventClick} onAddClick={onAddClick} />
      )}
      {view === 'day' && (
        <DayView cur={cur} evMap={evMap} editable={editable}
          onEventClick={onEventClick} onAddClick={onAddClick} />
      )}
    </div>
  )
}

// ─── Month ───────────────────────────────────────────────────────
function MonthView({ cur, evMap, editable, onEventClick, onDayClick, onAddClick, setCur, setView }: {
  cur: Date, evMap: Record<string, StreamerEvent[]>, editable?: boolean,
  onEventClick?: (e: StreamerEvent) => void, onDayClick?: (ds: string) => void,
  onAddClick?: (ds: string) => void,
  setCur: (d: Date) => void, setView: (v: View) => void,
}) {
  const monthStart = new Date(cur.getFullYear(), cur.getMonth(), 1)
  const gridStart = addDays(monthStart, -monthStart.getDay())
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: 'var(--bg-soft)', borderBottom: '1px solid var(--line)' }}>
        {WD_SHORT.map(w => (
          <div key={w} style={{ padding: '10px 0', textAlign: 'center', fontSize: 10.5, fontWeight: 600, color: 'var(--ink-soft)', letterSpacing: '0.1em' }}>{w}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
        {cells.map((d, i) => {
          const ds = isoDate(d)
          const muted = d.getMonth() !== cur.getMonth()
          const today = isToday(d)
          const evs = evMap[ds] ?? []
          return (
            <div
              key={i}
              onClick={() => {
                if (editable && onAddClick) onAddClick(ds)
                else { setCur(d); setView('day'); onDayClick?.(ds) }
              }}
              style={{
                minHeight: 90,
                borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid var(--line)',
                borderBottom: i < 35 ? '1px solid var(--line)' : 'none',
                padding: '6px 6px 4px',
                cursor: 'pointer',
                background: today ? 'rgba(42,53,86,.04)' : 'transparent',
                transition: 'background .1s',
              }}
              onMouseEnter={e => { if (!today)(e.currentTarget.style.background = 'var(--bg-soft)') }}
              onMouseLeave={e => { e.currentTarget.style.background = today ? 'rgba(42,53,86,.04)' : 'transparent' }}
            >
              <span style={{
                display: 'inline-flex', width: 22, height: 22,
                alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                fontSize: 12, fontWeight: today ? 700 : 400,
                background: today ? 'var(--navy)' : 'transparent',
                color: today ? '#fff' : muted ? 'var(--ink-light)' : 'var(--ink)',
              }}>{d.getDate()}</span>
              <div style={{ marginTop: 2 }}>
                {evs.slice(0, 3).map(ev => (
                  <div
                    key={ev.id}
                    className={`ev-pill cat-${ev.category}`}
                    onClick={e => { e.stopPropagation(); onEventClick?.(ev) }}
                  >
                    {ev.start_time.slice(0, 5)} {ev.title}
                  </div>
                ))}
                {evs.length > 3 && (
                  <div style={{ fontSize: 10, color: 'var(--ink-light)', paddingLeft: 4, marginTop: 2 }}>
                    +{evs.length - 3}개 더
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Week ────────────────────────────────────────────────────────
function WeekView({ cur, evMap, editable, onEventClick, onAddClick }: {
  cur: Date, evMap: Record<string, StreamerEvent[]>, editable?: boolean,
  onEventClick?: (e: StreamerEvent) => void, onAddClick?: (ds: string) => void,
}) {
  const start = startOfWeek(cur)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))

  return (
    <div>
      {days.map((d, i) => {
        const ds = isoDate(d)
        const evs = evMap[ds] ?? []
        const today = isToday(d)
        return (
          <div
            key={i}
            style={{
              display: 'grid', gridTemplateColumns: '80px 1fr',
              borderBottom: i < 6 ? '1px solid var(--line)' : 'none',
              background: today ? 'rgba(42,53,86,.03)' : 'transparent',
            }}
          >
            <div style={{ padding: '14px 12px', borderRight: '1px solid var(--line)', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--ink-light)', fontWeight: 600, letterSpacing: '0.1em' }}>{WD_SHORT[d.getDay()]}</div>
              <div style={{
                fontSize: 20, fontWeight: today ? 700 : 400,
                color: today ? 'var(--navy)' : 'var(--ink)',
                fontFamily: "'Cafe24Surround', sans-serif",
              }}>{d.getDate()}</div>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {evs.length === 0 ? (
                <div
                  onClick={() => editable && onAddClick?.(ds)}
                  style={{
                    fontSize: 12, color: 'var(--ink-light)',
                    fontStyle: 'italic', padding: '8px 0',
                    cursor: editable ? 'pointer' : 'default',
                  }}
                >
                  {editable ? '+ 일정 추가' : '— 휴방 —'}
                </div>
              ) : (
                evs.map(ev => (
                  <EventRow key={ev.id} ev={ev} onClick={() => onEventClick?.(ev)} />
                ))
              )}
              {editable && evs.length > 0 && (
                <button
                  onClick={() => onAddClick?.(ds)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 11, color: 'var(--ink-light)', textAlign: 'left', padding: '4px 0',
                  }}
                >+ 추가</button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Day ─────────────────────────────────────────────────────────
function DayView({ cur, evMap, editable, onEventClick, onAddClick }: {
  cur: Date, evMap: Record<string, StreamerEvent[]>, editable?: boolean,
  onEventClick?: (e: StreamerEvent) => void, onAddClick?: (ds: string) => void,
}) {
  const ds = isoDate(cur)
  const evs = evMap[ds] ?? []

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
        <div style={{ fontSize: 10, color: 'var(--ink-light)', letterSpacing: '0.1em', fontWeight: 600 }}>{WD_SHORT[cur.getDay()]}</div>
        <div style={{ fontFamily: "'Cafe24Surround', sans-serif", fontSize: 26, fontWeight: 700, color: 'var(--ink)' }}>
          {cur.getMonth() + 1}월 <em style={{ fontStyle: 'normal', color: isToday(cur) ? 'var(--navy)' : 'var(--ink)' }}>{cur.getDate()}일</em>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 4 }}>
          {isToday(cur) ? '오늘 · ' : ''} 예정 {evs.length}건
        </div>
      </div>
      {evs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-light)' }}>
          <div style={{ fontSize: 28 }}>∅</div>
          <p style={{ fontSize: 13, marginTop: 8 }}>이 날은 휴방이에요</p>
          {editable && (
            <button
              onClick={() => onAddClick?.(ds)}
              style={{
                marginTop: 14, background: 'var(--bg-soft)', border: '1px solid var(--line)',
                borderRadius: 6, padding: '8px 16px', fontSize: 12,
                cursor: 'pointer', color: 'var(--ink)',
              }}
            >+ 일정 추가</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {evs.map(ev => (
            <DayEventCard key={ev.id} ev={ev} onClick={() => onEventClick?.(ev)} />
          ))}
          {editable && (
            <button
              onClick={() => onAddClick?.(ds)}
              style={{
                marginTop: 4, background: 'none', border: '1px dashed var(--line)',
                borderRadius: 6, padding: '10px', fontSize: 12,
                cursor: 'pointer', color: 'var(--ink-light)', width: '100%',
              }}
            >+ 이 날 일정 더 추가</button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── 공통 이벤트 행 ───────────────────────────────────────────────
function EventRow({ ev, onClick }: { ev: StreamerEvent, onClick: () => void }) {
  const cat = CATEGORIES[ev.category]
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px', borderRadius: 6,
        background: 'var(--bg-soft)', cursor: 'pointer',
        transition: 'background .1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-soft)')}
    >
      <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: cat.color, flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: 'var(--ink-soft)', minWidth: 40 }}>{ev.start_time.slice(0, 5)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>{cat.ko}</div>
      </div>
    </div>
  )
}

function DayEventCard({ ev, onClick }: { ev: StreamerEvent, onClick: () => void }) {
  const cat = CATEGORIES[ev.category]
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', borderRadius: 8,
        border: '1px solid var(--line)', cursor: 'pointer',
        background: 'var(--bg-card)', transition: 'box-shadow .15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, background: cat.color, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 3 }}>{ev.start_time.slice(0, 5)} · {cat.ko}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{ev.title}</div>
        {ev.description && (
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.5 }}>{ev.description}</div>
        )}
      </div>
    </div>
  )
}
