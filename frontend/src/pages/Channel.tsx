import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { Streamer, StreamerEvent, Category } from '../types'
import { CATEGORIES } from '../types'
import { CalendarView } from '../components/Calendar/CalendarView'
import { FollowButton } from '../components/ui/FollowButton'
import { Modal } from '../components/ui/Modal'
import { showToast } from '../components/ui/Toast'

function Avatar({ name, url, size=72 }: { name: string; url: string | null; size?: number }) {
  const p = ['#a8c2eb,#6b8cce,#2a3556','#d4e8dc,#8ec0a0,#3a7a5a','#e0d4f0,#a890d4,#5a3a8a'].map(s=>s.split(','))
  const h = [...name].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,0)
  const [bg1,bg2,bg3] = p[h % p.length]
  if (url) return <img src={url} style={{ width:size,height:size,borderRadius:'50%',objectFit:'cover' }} />
  return <div style={{ width:size,height:size,borderRadius:'50%',background:`radial-gradient(circle at 35% 30%,${bg1},${bg2} 60%,${bg3})`,display:'grid',placeItems:'center',color:'#fff',fontWeight:700,fontSize:size*0.38,flexShrink:0 }}>{name[0]}</div>
}

export function Channel() {
  const { handle } = useParams<{ handle: string }>()
  const { auth } = useAuth()
  const [streamer, setStreamer] = useState<Streamer | null>(null)
  const [events, setEvents] = useState<StreamerEvent[]>([])
  const [detail, setDetail] = useState<StreamerEvent | null>(null)
  const [form, setForm] = useState<{ open: boolean; ds: string; ev: StreamerEvent | null }>({ open: false, ds: '', ev: null })
  const [loading, setLoading] = useState(true)

  const isOwner = !!auth && auth.user.streamer_id === streamer?.id

  useEffect(() => {
    async function load() {
      try {
        const { data: s } = await api.get(`/streamers/${handle}`)
        setStreamer(s)
        const { data: ev2 } = await api.get('/events', { params: { streamer_id: s.id } })
        setEvents(ev2)
      } catch { }
      finally { setLoading(false) }
    }
    load()
  }, [handle])

  async function saveEvent(data: { title: string; start_time: string; category: Category; description: string }) {
    try {
      if (form.ev) {
        const { data: updated } = await api.put(`/events/${form.ev.id}`, { date: form.ds, ...data })
        setEvents(evs => evs.map(e => e.id === updated.id ? updated : e))
        showToast('일정이 수정되었어요')
      } else {
        const { data: created } = await api.post('/events', { streamer_id: streamer!.id, date: form.ds, ...data })
        setEvents(evs => [...evs, created])
        showToast('일정이 추가되었어요 ✦')
      }
      setForm({ open: false, ds: '', ev: null })
    } catch { showToast('저장에 실패했어요') }
  }

  async function deleteEvent(id: number) {
    if (!confirm('이 일정을 삭제할까요?')) return
    try {
      await api.delete(`/events/${id}`)
      setEvents(evs => evs.filter(e => e.id !== id))
      setDetail(null)
      showToast('일정이 삭제되었어요')
    } catch { showToast('삭제에 실패했어요') }
  }

  if (loading) return <div style={{ textAlign:'center', padding:'80px 0', color:'var(--ink-light)' }}>불러오는 중…</div>
  if (!streamer) return <div style={{ textAlign:'center', padding:'80px 0', color:'var(--ink-light)' }}>스트리머를 찾을 수 없어요</div>

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 100px', width: '100%' }}>
      {/* 헤더 */}
      <header style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:28, paddingBottom:24, borderBottom:'1px solid var(--line)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <Avatar name={streamer.name} url={streamer.avatar_url} />
          <div>
            <p style={{ fontSize:10, letterSpacing:'0.18em', color:'var(--ink-light)', textTransform:'uppercase', fontWeight:500, marginBottom:4 }}>CHZZK · Live Calendar</p>
            <h1 style={{ fontSize:28, fontWeight:700, color:'var(--ink)', letterSpacing:'-0.02em', lineHeight:1.1 }}>
              {streamer.name}{streamer.is_verified && <span style={{ color:'var(--gold)', marginLeft:8, fontSize:16 }}>✦</span>}
            </h1>
            <p style={{ fontSize:13, color:'var(--ink-soft)', marginTop:4 }}>{streamer.handle}</p>
            <p style={{ fontSize:11, color:'var(--ink-light)', marginTop:6 }}>팔로워 {streamer.follower_count.toLocaleString()}명</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <a href={`/api/calendar/${handle}`} download style={{ padding:'8px 14px', borderRadius:6, fontSize:12.5, border:'1px solid var(--line)', background:'var(--bg-card)', color:'var(--ink)', textDecoration:'none', fontWeight:500 }}>↓ .ics</a>
          <FollowButton streamerId={streamer.id} initialFollowing={!!streamer.is_following} />
        </div>
      </header>

      <CalendarView events={events} editable={isOwner} onEventClick={setDetail} onAddClick={ds => setForm({ open:true, ds, ev:null })} />

      {/* 상세 모달 */}
      <Modal open={!!detail} onClose={()=>setDetail(null)} title="방송 상세"
        footer={isOwner
          ? <><Btn onClick={()=>{setForm({open:true,ds:detail!.date,ev:detail});setDetail(null)}}>수정</Btn><Btn onClick={()=>deleteEvent(detail!.id)}>삭제</Btn><Btn primary onClick={()=>dlICS(detail!)}>↓ .ics</Btn></>
          : <><Btn onClick={()=>setDetail(null)}>닫기</Btn><Btn gold onClick={()=>dlICS(detail!)}>내 캘린더에 추가</Btn></>
        }>
        {detail && <DetailView ev={detail} />}
      </Modal>

      {/* 폼 모달 */}
      <Modal open={form.open} onClose={()=>setForm({open:false,ds:'',ev:null})} title={form.ev?'일정 수정':'새 일정 추가'}>
        {form.open && <EventForm ds={form.ds} ev={form.ev} onSave={saveEvent} onCancel={()=>setForm({open:false,ds:'',ev:null})} />}
      </Modal>
    </main>
  )
}

function dlICS(ev: StreamerEvent) {
  const content = buildICS(ev)
  const url = URL.createObjectURL(new Blob([content], { type:'text/calendar' }))
  const a = Object.assign(document.createElement('a'), { href:url, download:`${ev.title.slice(0,20)}_${ev.date}.ics` })
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
  showToast('다운로드됐어요 ✦')
}

function buildICS(ev: StreamerEvent) {
  const [h,m]=ev.start_time.split(':').map(Number)
  const dt=(d:string)=>`${d.replace(/-/g,'')}T${String(h).padStart(2,'0')}${String(m).padStart(2,'0')}00`
  const catKo: Record<string,string>={game:'게임',chat:'저챗',collab:'합방',member:'멤버',off:'휴방'}
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//스케줄링//KO','BEGIN:VEVENT',
    `UID:ev-${ev.id}@scheduling.app`,`SUMMARY:${ev.title} [${catKo[ev.category]}]`,
    `DTSTART;TZID=Asia/Seoul:${dt(ev.date)}`,`DESCRIPTION:${ev.description??''}`,
    'END:VEVENT','END:VCALENDAR'].join('\r\n')
}

function Btn({ children, onClick, primary, gold }: { children: React.ReactNode; onClick?: ()=>void; primary?: boolean; gold?: boolean }) {
  return <button onClick={onClick} style={{ padding:'8px 14px', borderRadius:5, fontSize:12, fontWeight:500, cursor:'pointer', border: primary||gold ? 'none' : '1px solid var(--line)', background: primary?'var(--navy)':gold?'var(--gold)':'var(--bg-card)', color: primary?'#fff':gold?'var(--navy-deep)':'var(--ink)' }}>{children}</button>
}

function DetailView({ ev }: { ev: StreamerEvent }) {
  const cat = CATEGORIES[ev.category]
  const d = new Date(ev.date+'T00:00:00')
  const WD=['일','월','화','수','목','금','토']
  return (
    <div>
      <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, marginBottom:12, background:cat.color+'22', color:cat.color }}>{cat.ko}</span>
      <h2 style={{ fontSize:20, fontWeight:700, color:'var(--ink)', marginBottom:14 }}>{ev.title}</h2>
      <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize:13, color:'var(--ink-soft)' }}>
        <div><span style={{ color:'var(--ink-light)', fontSize:11, marginRight:8 }}>날짜</span>{d.getFullYear()}년 {d.getMonth()+1}월 {d.getDate()}일 ({WD[d.getDay()]})</div>
        <div><span style={{ color:'var(--ink-light)', fontSize:11, marginRight:8 }}>시간</span>{ev.start_time.slice(0,5)} 시작</div>
      </div>
      {ev.description && <p style={{ marginTop:14, fontSize:13, color:'var(--ink-soft)', lineHeight:1.6, whiteSpace:'pre-wrap' }}>{ev.description}</p>}
    </div>
  )
}

function EventForm({ ds, ev, onSave, onCancel }: { ds:string; ev:StreamerEvent|null; onSave:(d:any)=>Promise<void>; onCancel:()=>void }) {
  const [title, setTitle] = useState(ev?.title ?? '')
  const [time, setTime] = useState(ev?.start_time.slice(0,5) ?? '20:00')
  const [cat, setCat] = useState<Category>(ev?.category ?? 'game')
  const [desc, setDesc] = useState(ev?.description ?? '')
  const [saving, setSaving] = useState(false)
  const d = new Date(ds+'T00:00:00')
  const WD=['일','월','화','수','목','금','토']
  const inp: React.CSSProperties = { width:'100%', padding:'9px 11px', border:'1.5px solid var(--line)', borderRadius:6, fontSize:13, color:'var(--ink)', background:'var(--bg-card)', fontFamily:'inherit', outline:'none' }

  async function submit() {
    if (!title.trim()) { showToast('제목을 입력해주세요'); return }
    setSaving(true)
    await onSave({ title:title.trim(), start_time:time, category:cat, description:desc.trim() })
    setSaving(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <p style={{ fontSize:11, color:'var(--ink-light)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:500 }}>{d.getFullYear()}년 {d.getMonth()+1}월 {d.getDate()}일 ({WD[d.getDay()]})</p>
      <div><label style={{ fontSize:11, color:'var(--ink-soft)', fontWeight:500, display:'block', marginBottom:5 }}>제목</label><input type="text" value={title} maxLength={60} onChange={e=>setTitle(e.target.value)} placeholder="예: 발로란트 랭크 도전" style={inp} autoFocus /></div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div><label style={{ fontSize:11, color:'var(--ink-soft)', fontWeight:500, display:'block', marginBottom:5 }}>시작 시간</label><input type="time" value={time} onChange={e=>setTime(e.target.value)} style={inp} /></div>
        <div>
          <label style={{ fontSize:11, color:'var(--ink-soft)', fontWeight:500, display:'block', marginBottom:5 }}>분류</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {(Object.keys(CATEGORIES) as Category[]).map(k=>(
              <button key={k} type="button" onClick={()=>setCat(k)} style={{ padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer', border:cat===k?`1.5px solid ${CATEGORIES[k].color}`:'1.5px solid var(--line)', background:cat===k?CATEGORIES[k].color+'20':'transparent', color:cat===k?CATEGORIES[k].color:'var(--ink-soft)' }}>{CATEGORIES[k].ko}</button>
            ))}
          </div>
        </div>
      </div>
      <div><label style={{ fontSize:11, color:'var(--ink-soft)', fontWeight:500, display:'block', marginBottom:5 }}>설명 (선택)</label><textarea value={desc} maxLength={300} onChange={e=>setDesc(e.target.value)} placeholder="팬들에게 보여줄 추가 설명" rows={3} style={{ ...inp, resize:'vertical' }} /></div>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:8, paddingTop:4 }}>
        <Btn onClick={onCancel}>취소</Btn>
        <Btn primary onClick={submit}>{saving?'저장 중…':ev?'저장':'추가하기'}</Btn>
      </div>
    </div>
  )
}
