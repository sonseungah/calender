import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { buildICSFile } from '@/lib/ics'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params
  const supabase = await createServerSupabase()

  const { data: streamer } = await supabase
    .from('streamers')
    .select('*')
    .eq('handle', `@${handle}`)
    .single()

  if (!streamer) {
    return new NextResponse('Not found', { status: 404 })
  }

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('streamer_id', streamer.id)
    .order('date')
    .order('start_time')

  const ics = buildICSFile(streamer, events ?? [])

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${handle}.ics"`,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
