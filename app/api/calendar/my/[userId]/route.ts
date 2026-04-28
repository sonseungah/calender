import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { buildICSFile } from '@/lib/ics'
import { Streamer, StreamerEvent } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const supabase = await createServerSupabase()

  // 팔로우한 스트리머 조회
  const { data: follows } = await supabase
    .from('follows')
    .select('streamer_id, streamers(*)')
    .eq('fan_id', userId)

  if (!follows || follows.length === 0) {
    return new NextResponse('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR', {
      headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
    })
  }

  const streamers: Streamer[] = follows.map((f: any) => f.streamers as Streamer)
  const streamerIds = streamers.map((s: Streamer) => s.id)

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .in('streamer_id', streamerIds)
    .order('date')
    .order('start_time')

  // 통합 ICS: 스트리머별로 그룹핑
  const evByStreamer: Record<string, StreamerEvent[]> = {}
  ;(events ?? []).forEach((ev: StreamerEvent) => {
    if (!evByStreamer[ev.streamer_id]) evByStreamer[ev.streamer_id] = []
    evByStreamer[ev.streamer_id].push(ev)
  })

  // 모든 VEVENT를 하나의 캘린더에 합치기
  const allVEvents: string[] = []
  streamers.forEach(s => {
    const sevs = evByStreamer[s.id] ?? []
    // buildICSFile 안의 VEVENT만 추출
    const ics = buildICSFile(s, sevs)
    const vevents = ics
      .split('\r\n')
      .join('\n')
      .split(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g)
    // 정규식으로 추출
    const matches = ics.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? []
    allVEvents.push(...matches)
  })

  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//스케줄링//My Calendar//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:스케줄링 · 내 방송 일정',
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
    ...allVEvents,
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(calendar, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="my-schedule.ics"',
      'Cache-Control': 'private, max-age=1800',
    },
  })
}
