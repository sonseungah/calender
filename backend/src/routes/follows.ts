import { Router, Request, Response } from 'express'
import { pool } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()

// GET /api/follows — 내가 팔로우한 스트리머 목록
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id
  const [rows] = await pool.query(`
    SELECT s.*,
      (SELECT COUNT(*) FROM events e WHERE e.streamer_id = s.id AND e.date >= CURDATE()) AS upcoming_count,
      f.followed_at
    FROM follows f
    JOIN streamers s ON s.id = f.streamer_id
    WHERE f.user_id = ?
    ORDER BY f.followed_at DESC
  `, [userId]) as any[]
  res.json(rows)
})

// POST /api/follows/:streamerId
router.post('/:streamerId', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id
  const streamerId = Number(req.params.streamerId)

  const [existing] = await pool.query(
    'SELECT 1 FROM follows WHERE user_id = ? AND streamer_id = ?', [userId, streamerId]
  ) as any[]
  if ((existing as any[]).length > 0) {
    res.status(409).json({ message: '이미 팔로우 중이에요' }); return
  }

  await pool.query(
    'INSERT INTO follows (user_id, streamer_id) VALUES (?, ?)', [userId, streamerId]
  )
  res.status(201).json({ message: '팔로우했어요 ✦' })
})

// DELETE /api/follows/:streamerId
router.delete('/:streamerId', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id
  const streamerId = Number(req.params.streamerId)

  await pool.query(
    'DELETE FROM follows WHERE user_id = ? AND streamer_id = ?', [userId, streamerId]
  )
  res.json({ message: '팔로우를 취소했어요' })
})

export default router
