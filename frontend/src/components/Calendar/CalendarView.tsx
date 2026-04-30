import { useState, useMemo } from 'react'
import type { StreamerEvent } from '../../types'
import { CATEGORIES } from '../../types'

type View = 'month' | 'week' | 'day'
const WD = ['일','월','화','수','목','금','토']
const WD_S = ['SUN','MON','TUE','WED','THU','FRI','SAT']

function iso(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
function addDays(d: Date, n: number) { const r=new Date(d); r.setDate(r.getDate()+n); return r }
function startOfWeek(d: Date) { const r=new Date(d); r.setDate(r.getDate()-r.getDay()); return r }
function isToday(d: Date) { const t=new Date(); return d.toDateString()===t.toDateString() }

interface Props {
  events: StreamerEvent[]
  editable?: boolean
  onEventClick?: (ev: StreamerEvent) => void
  onAddClick?: (ds: string) => void
}

export function CalendarView({ events, editable, onEventClick, onAddClick }: Props) {
  const [view, setView] = useState<View>('month')
  const [cur, setCur] = useState(new Date())

  const evMap = useMemo(() => {
    const m: Record<string, StreamerEvent[]> = {}
    events.forEach(e => { (m[e.date] ??= []).push(e) })
    Object.values(m).forEach(a => a.sort((a,b) => a.start_time.localeCompare(b.start_time)))
    return m
  }, [events])

  function nav(dir: -1|1) {
    if (view==='month') setCur(d=>new Date(d.getFullYear(),d.getMonth()+dir,1))
    else if (view==='week') setCur(d=>addDays(d,dir*7))
    else setCur(d=>addDays(d,dir))
  }

  const label = view==='month'
    ? `${cur.getFullYear()}년 ${cur.getMonth()+1}월`
    : view==='week'
    ? (() => { const s=startOfWeek(cur),e=addDays(s,6); return s.getMonth()===e.getMonth()?`${s.getMonth()+1}월 ${s.getDate()}일 — ${e.getDate()}일`:`${s.getMonth()+1}월 ${s.getDate()}일 — ${e.getMonth()+1}월 ${e.getDate()}일` })()
    : `${cur.getMonth()+1}월 ${cur.getDate()}일 (${WD[cur.getDay()]})`

  const btn = (label: string, active: boolean, onClick: ()=>void) => (
    <button onClick={onClick} style={{
      background: active ? 'var(--bg-card)' : 'none', border:'none', borderRadius:4,
      padding:'7px 14px', fontSize:12.5, fontWeight:500, cursor:'pointer',
      color: active ? 'var(--ink)' : 'var(--ink-soft)',
      boxShadow: active ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
    }}>{label}</button>
  )

  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--line)', borderRadius:8, overflow:'hidden' }}>
      {/* 툴바 */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid var(--line)', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'inline-flex', background:'var(--bg-soft)', padding:3, borderRadius:6 }}>
          {btn('월간',view==='month',()=>setView('month'))}
          {btn('주간',view==='week',()=>setView('week'))}
          {btn('일간',view==='day',()=>setView('day'))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={()=>setCur(new Date())} style={{ border:'1px solid var(--line)', background:'var(--bg-card)', color:'var(--ink-soft)', padding:'5px 10px', borderRadius:4, fontSize:11, cursor:'pointer' }}>TODAY</button>
          {(['‹','›'] as const).map((a,i)=>(
            <button key={a} onClick={()=>nav(i===0?-1:1)} style={{ width:28,height:28,borderRadius:'50%', border:'1px solid var(--line)',background:'var(--bg-card)',cursor:'pointer',color:'var(--ink-soft)',fontSize:14 }}>{a}</button>
          ))}
          <span style={{ fontSize:15, minWidth:130, textAlign:'center', color:'var(--ink)' }}>{label}</span>
        </div>
      </div>

      {view==='month' && <MonthView cur={cur} evMap={evMap} editable={editable} onEventClick={onEventClick} onAddClick={onAddClick} setCur={setCur} setView={setView}/>}
      {view==='week'  && <WeekView  cur={cur} evMap={evMap} editable={editable} onEventClick={onEventClick} onAddClick={onAddClick}/>}
      {view==='day'   && <DayView   cur={cur} evMap={evMap} editable={editable} onEventClick={onEventClick} onAddClick={onAddClick}/>}
    </div>
  )
}

function MonthView({ cur, evMap, editable, onEventClick, onAddClick, setCur, setView }:
  { cur:Date, evMap:Record<string,StreamerEvent[]>, editable?:boolean, onEventClick?:(e:StreamerEvent)=>void, onAddClick?:(ds:string)=>void, setCur:(d:Date)=>void, setView:(v:View)=>void }) {
  const ms = new Date(cur.getFullYear(),cur.getMonth(),1)
  const gs = addDays(ms,-ms.getDay())
  const cells = Array.from({length:42},(_,i)=>addDays(gs,i))
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:'var(--bg-soft)', borderBottom:'1px solid var(--line)' }}>
        {WD_S.map(w=><div key={w} style={{ padding:'8px 0', textAlign:'center', fontSize:10, fontWeight:600, color:'var(--ink-soft)', letterSpacing:'0.1em' }}>{w}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
        {cells.map((d,i)=>{
          const ds=iso(d), muted=d.getMonth()!==cur.getMonth(), today=isToday(d), evs=evMap[ds]??[]
          return (
            <div key={i} onClick={()=>{ if(editable&&onAddClick)onAddClick(ds); else{setCur(d);setView('day')} }}
              style={{ minHeight:88, borderRight:(i+1)%7===0?'none':'1px solid var(--line)', borderBottom:i<35?'1px solid var(--line)':'none', padding:'5px 5px 3px', cursor:'pointer', background:today?'rgba(42,53,86,.04)':'transparent' }}
              onMouseEnter={e=>{if(!today)(e.currentTarget as HTMLElement).style.background='var(--bg-soft)'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=today?'rgba(42,53,86,.04)':'transparent'}}>
              <span style={{ display:'inline-flex',width:20,height:20,alignItems:'center',justifyContent:'center',borderRadius:'50%',fontSize:11.5,fontWeight:today?700:400,background:today?'var(--navy)':'transparent',color:today?'#fff':muted?'var(--ink-light)':'var(--ink)' }}>{d.getDate()}</span>
              {evs.slice(0,3).map(ev=>(
                <div key={ev.id} className={`ev-pill ${ev.category}`} onClick={e=>{e.stopPropagation();onEventClick?.(ev)}}>
                  {ev.start_time.slice(0,5)} {ev.title}
                </div>
              ))}
              {evs.length>3&&<div style={{ fontSize:10,color:'var(--ink-light)',paddingLeft:4,marginTop:2 }}>+{evs.length-3}개 더</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WeekView({ cur, evMap, editable, onEventClick, onAddClick }:
  { cur:Date, evMap:Record<string,StreamerEvent[]>, editable?:boolean, onEventClick?:(e:StreamerEvent)=>void, onAddClick?:(ds:string)=>void }) {
  const days = Array.from({length:7},(_,i)=>addDays(startOfWeek(cur),i))
  return (
    <div>
      {days.map((d,i)=>{
        const ds=iso(d), evs=evMap[ds]??[], today=isToday(d)
        return (
          <div key={i} style={{ display:'grid',gridTemplateColumns:'72px 1fr',borderBottom:i<6?'1px solid var(--line)':'none',background:today?'rgba(42,53,86,.03)':'transparent' }}>
            <div style={{ padding:'12px 8px',borderRight:'1px solid var(--line)',textAlign:'center' }}>
              <div style={{ fontSize:9,color:'var(--ink-light)',fontWeight:600,letterSpacing:'0.1em' }}>{WD_S[d.getDay()]}</div>
              <div style={{ fontSize:20,fontWeight:today?700:400,color:today?'var(--navy)':'var(--ink)' }}>{d.getDate()}</div>
            </div>
            <div style={{ padding:'8px 12px',display:'flex',flexDirection:'column',gap:5 }}>
              {evs.length===0
                ? <div onClick={()=>editable&&onAddClick?.(ds)} style={{ fontSize:12,color:'var(--ink-light)',fontStyle:'italic',padding:'6px 0',cursor:editable?'pointer':'default' }}>{editable?'+ 일정 추가':'— 휴방 —'}</div>
                : evs.map(ev=><EventRow key={ev.id} ev={ev} onClick={()=>onEventClick?.(ev)}/>)
              }
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DayView({ cur, evMap, editable, onEventClick, onAddClick }:
  { cur:Date, evMap:Record<string,StreamerEvent[]>, editable?:boolean, onEventClick?:(e:StreamerEvent)=>void, onAddClick?:(ds:string)=>void }) {
  const ds=iso(cur), evs=evMap[ds]??[]
  return (
    <div style={{ padding:20 }}>
      <div style={{ marginBottom:18,paddingBottom:14,borderBottom:'1px solid var(--line)' }}>
        <div style={{ fontSize:10,color:'var(--ink-light)',fontWeight:600,letterSpacing:'0.1em' }}>{WD_S[cur.getDay()]}</div>
        <div style={{ fontSize:26,fontWeight:700,color:'var(--ink)' }}>{cur.getMonth()+1}월 {cur.getDate()}일</div>
        <div style={{ fontSize:12,color:'var(--ink-light)',marginTop:4 }}>{isToday(cur)?'오늘 · ':''} 예정 {evs.length}건</div>
      </div>
      {evs.length===0
        ? <div style={{ textAlign:'center',padding:'40px 0',color:'var(--ink-light)' }}>
            <div style={{ fontSize:28 }}>∅</div>
            <p style={{ fontSize:13,marginTop:8 }}>이 날은 휴방이에요</p>
            {editable&&<button onClick={()=>onAddClick?.(ds)} style={{ marginTop:12,padding:'8px 16px',background:'var(--bg-soft)',border:'1px solid var(--line)',borderRadius:6,fontSize:12,cursor:'pointer',color:'var(--ink)' }}>+ 일정 추가</button>}
          </div>
        : <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {evs.map(ev=>(
              <div key={ev.id} onClick={()=>onEventClick?.(ev)} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 14px',border:'1px solid var(--line)',borderRadius:8,cursor:'pointer',background:'var(--bg-card)' }}
                onMouseEnter={e=>(e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,.08)')}
                onMouseLeave={e=>(e.currentTarget.style.boxShadow='none')}>
                <div style={{ width:4,alignSelf:'stretch',borderRadius:2,background:CATEGORIES[ev.category].color,flexShrink:0 }}/>
                <div>
                  <div style={{ fontSize:12,color:'var(--ink-soft)',marginBottom:3 }}>{ev.start_time.slice(0,5)} · {CATEGORIES[ev.category].ko}</div>
                  <div style={{ fontSize:15,fontWeight:600,color:'var(--ink)' }}>{ev.title}</div>
                  {ev.description&&<div style={{ fontSize:12,color:'var(--ink-soft)',marginTop:4 }}>{ev.description}</div>}
                </div>
              </div>
            ))}
            {editable&&<button onClick={()=>onAddClick?.(ds)} style={{ padding:'10px',border:'1px dashed var(--line)',borderRadius:6,fontSize:12,cursor:'pointer',color:'var(--ink-light)',background:'none',width:'100%' }}>+ 이 날 일정 더 추가</button>}
          </div>
      }
    </div>
  )
}

function EventRow({ ev, onClick }: { ev: StreamerEvent; onClick: ()=>void }) {
  const cat = CATEGORIES[ev.category]
  return (
    <div onClick={onClick} style={{ display:'flex',alignItems:'center',gap:8,padding:'7px 8px',borderRadius:5,background:'var(--bg-soft)',cursor:'pointer' }}>
      <div style={{ width:3,alignSelf:'stretch',borderRadius:2,background:cat.color,flexShrink:0 }}/>
      <span style={{ fontSize:11,color:'var(--ink-soft)',minWidth:36 }}>{ev.start_time.slice(0,5)}</span>
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:12.5,fontWeight:500,color:'var(--ink)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{ev.title}</div>
        <div style={{ fontSize:10.5,color:'var(--ink-light)' }}>{cat.ko}</div>
      </div>
    </div>
  )
}
