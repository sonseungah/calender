import { Router, Request, Response } from 'express'
import { pool } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()

const VALID_CATS = ['game', 'chat', 'collab', 'member', 'off']

// GET /api/events?streamer_id=1&from=2025-01-01&to=2025-12-31
router.get('/', async (req: Request, res: Response) => {
  const { streamer_id, from, to } = req.query
  if (!streamer_id) { res.status(400).json({ message: 'streamer_id 필요' }); return }

  let sql = 'SELECT * FROM events WHERE streamer_id = ?'
  const params: any[] = [streamer_id]

  if (from) { sql += ' AND date >= ?'; params.push(from) }
  if (to)   { sql += ' AND date <= ?'; params.push(to) }
  sql += ' ORDER BY date, start_time'

  const [rows] = await pool.query(sql, params) as any[]
  res.json(rows)
})

// POST /api/events
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { date, start_time, title, category, description } = req.body
  const streamerId = req.user!.streamer_id

  if (!streamerId) { res.status(403).json({ message: '스트리머만 일정을 추가할 수 있어요' }); return }
  if (!date || !start_time || !title || !category) {
    res.status(400).json({ message: '필수 항목을 입력해주세요' }); return
  }
  if (!VALID_CATS.includes(category)) {
    res.status(400).json({ message: '유효하지 않은 카테고리예요' }); return
  }

  const [result] = await pool.query(
    'INSERT INTO events (streamer_id, date, start_time, title, category, description) VALUES (?, ?, ?, ?, ?, ?)',
    [streamerId, date, start_time, title, category, description ?? null]
  ) as any[]

  const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [(result as any).insertId]) as any[]
  res.status(201).json((rows as any[])[0])
})

// PUT /api/events/:id
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params
  const { date, start_time, title, category, description } = req.body
  const streamerId = req.user!.streamer_id

  const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [id]) as any[]
  const ev = (rows as any[])[0]
  if (!ev) { res.status(404).json({ message: '일정을 찾을 수 없어요' }); return }
  if (ev.streamer_id !== streamerId) { res.status(403).json({ message: '권한 없음' }); return }

  await pool.query(
    'UPDATE events SET date=?, start_time=?, title=?, category=?, description=?, updated_at=NOW() WHERE id=?',
    [date ?? ev.date, start_time ?? ev.start_time, title ?? ev.title,
     category ?? ev.category, description ?? ev.description, id]
  )
  const [updated] = await pool.query('SELECT * FROM events WHERE id = ?', [id]) as any[]
  res.json((updated as any[])[0])
})

// DELETE /api/events/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params
  const streamerId = req.user!.streamer_id

  const [rows] = await pool.query('SELECT streamer_id FROM events WHERE id = ?', [id]) as any[]
  const ev = (rows as any[])[0]
  if (!ev) { res.status(404).json({ message: '일정을 찾을 수 없어요' }); return }
  if (ev.streamer_id !== streamerId) { res.status(403).json({ message: '권한 없음' }); return }

  await pool.query('DELETE FROM events WHERE id = ?', [id])
  res.json({ message: '삭제됐어요' })
})

export default router
