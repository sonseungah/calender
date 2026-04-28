import { StreamerEvent, Streamer, CATEGORIES } from '@/types'

function pad(n: number) { return String(n).padStart(2, '0') }

function formatICSDate(dateStr: string, timeStr: string) {
  const [y, m, d] = dateStr.split('-')
  const [hh, mm] = timeStr.split(':')
  return `${y}${m}${d}T${hh}${mm}00`
}

function buildVEvent(ev: StreamerEvent): string {
  const [hh, mm] = ev.start_time.split(':').map(Number)
  const endDate = new Date(`${ev.date}T${ev.start_time}`)
  endDate.setHours(endDate.getHours() + 2)

  const endTime = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`
  const catLabel = CATEGORIES[ev.category]?.ko ?? ev.category
  const summary = `${ev.title} [${catLabel}]`
  const desc = (ev.description ?? '').replace(/\n/g, '\\n')

  return [
    'BEGIN:VEVENT',
    `UID:${ev.id}@scheduling.app`,
    `DTSTAMP:${formatICSDate(new Date().toISOString().slice(0,10), pad(new Date().getHours())+':'+pad(new Date().getMinutes()))}`,
    `DTSTART;TZID=Asia/Seoul:${formatICSDate(ev.date, ev.start_time)}`,
    `DTEND;TZID=Asia/Seoul:${formatICSDate(ev.date, endTime)}`,
    `SUMMARY:${summary}`,
    desc ? `DESCRIPTION:${desc}` : null,
    'END:VEVENT',
  ].filter(Boolean).join('\r\n')
}

export function buildICSFile(streamer: Streamer, events: StreamerEvent[]): string {
  const vevents = events.map(buildVEvent)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//스케줄링//Streamer Calendar//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${streamer.name} 방송 일정`,
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
