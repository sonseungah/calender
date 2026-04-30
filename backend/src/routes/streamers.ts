import { Router, Request, Response } from 'express'
import { pool } from '../db'
import { optionalAuth } from '../middleware/auth'

const router = Router()

// GET /api/streamers?q=검색어
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  const q = (req.query.q as string | undefined)?.trim()
  const userId = req.user?.id

  let sql = `
    SELECT s.*,
      (SELECT COUNT(*) FROM events e WHERE e.streamer_id = s.id AND e.date >= CURDATE()) AS upcoming_count
    FROM streamers s
  `
  const params: any[] = []

  if (q) {
    sql += ' WHERE s.name LIKE ? OR s.handle LIKE ?'
    params.push(`%${q}%`, `%${q}%`)
  }
  sql += ' ORDER BY s.follower_count DESC LIMIT 30'

  const [streamers] = await pool.query(sql, params) as any[]

  // 팔로우 여부
  let followSet = new Set<number>()
  if (userId) {
    const [follows] = await pool.query(
      'SELECT streamer_id FROM follows WHERE user_id = ?', [userId]
    ) as any[]
    followSet = new Set((follows as any[]).map(f => f.streamer_id))
  }

  const result = (streamers as any[]).map(s => ({
    ...s,
    is_following: followSet.has(s.id),
  }))

  res.json(result)
})

// GET /api/streamers/:handle
router.get('/:handle', optionalAuth, async (req: Request, res: Response) => {
  const handle = `@${req.params.handle}`
  const userId = req.user?.id

  const [rows] = await pool.query(
    'SELECT * FROM streamers WHERE handle = ?', [handle]
  ) as any[]

  const streamer = (rows as any[])[0]
  if (!streamer) { res.status(404).json({ message: '스트리머를 찾을 수 없어요' }); return }

  let isFollowing = false
  if (userId) {
    const [f] = await pool.query(
      'SELECT 1 FROM follows WHERE user_id = ? AND streamer_id = ?', [userId, streamer.id]
    ) as any[]
    isFollowing = (f as any[]).length > 0
  }

  res.json({ ...streamer, is_following: isFollowing })
})

export default router
