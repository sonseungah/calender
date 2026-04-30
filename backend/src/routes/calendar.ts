import { Router, Request, Response } from 'express'
import { pool } from '../db'

const router = Router()

function pad(n: number) { return String(n).padStart(2, '0') }

function formatDT(date: string, time: string) {
  const [y, m, d] = date.split('-')
  const [hh, mm] = time.split(':')
  return `${y}${m}${d}T${hh}${mm}00`
}

function buildVEvent(ev: any): string {
  const [hh, mm] = ev.start_time.split(':').map(Number)
  const endH = pad(hh + 2 > 23 ? 23 : hh + 2)
  const endM = pad(mm)
  const catMap: Record<string, string> = {
    game: '게임', chat: '저챗', collab: '합방', member: '멤버', off: '휴방'
  }
  const summary = `${ev.title} [${catMap[ev.category] ?? ev.category}]`
  const desc = (ev.description ?? '').replace(/\n/g, '\\n')

  return [
    'BEGIN:VEVENT',
    `UID:ev-${ev.id}@scheduling.app`,
    `DTSTAMP:${formatDT(new Date().toISOString().slice(0, 10), `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`)}`,
    `DTSTART;TZID=Asia/Seoul:${formatDT(ev.date.toISOString?.()?.slice(0,10) ?? ev.date, ev.start_time.slice(0, 5))}`,
    `DTEND;TZID=Asia/Seoul:${formatDT(ev.date.toISOString?.()?.slice(0,10) ?? ev.date, `${endH}:${endM}`)}`,
    `SUMMARY:${summary}`,
    desc ? `DESCRIPTION:${desc}` : null,
    'END:VEVENT',
  ].filter(Boolean).join('\r\n')
}

function wrapCalendar(calName: string, vevents: string[]): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//스케줄링//Streamer Calendar//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calName}`,
    'X-WR-TIMEZONE:Asia/Seoul',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Seoul',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0900',
    'TZOFFSETTO:+0900',
    'TZNAME:KST',
    'DTSTART:19700101T000000',
    'END:STANDARD',
    'END:VTIMEZONE',
    ...vevents,
    'END:VCALENDAR',
  ].join('\r\n')
}

// GET /api/calendar/:handle  — 스트리머 전체 일정 ICS
router.get('/:handle', async (req: Request, res: Response) => {
  const handle = `@${req.params.handle}`
  const [streamers] = await pool.query('SELECT * FROM streamers WHERE handle = ?', [handle]) as any[]
  const streamer = (streamers as any[])[0]
  if (!streamer) { res.status(404).send('Not found'); return }

  const [events] = await pool.query(
    'SELECT * FROM events WHERE streamer_id = ? ORDER BY date, start_time', [streamer.id]
  ) as any[]

  const ics = wrapCalendar(`${streamer.name} 방송 일정`, (events as any[]).map(buildVEvent))
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.handle}.ics"`)
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.send(ics)
})

export default router
