import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db'

const router = Router()
const SECRET = process.env.JWT_SECRET ?? 'secret'
const EXPIRES = process.env.JWT_EXPIRES_IN ?? '7d'

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, name, handle } = req.body
  if (!email || !password || !name || !handle) {
    res.status(400).json({ message: '모든 필드를 입력해주세요' })
    return
  }

  const conn = await pool.getConnection()
  try {
    const [existing] = await conn.query(
      'SELECT id FROM users WHERE email = ?', [email]
    ) as any[]
    if ((existing as any[]).length > 0) {
      res.status(409).json({ message: '이미 사용 중인 이메일이에요' })
      return
    }

    const [handleExisting] = await conn.query(
      'SELECT id FROM streamers WHERE handle = ?', [`@${handle}`]
    ) as any[]
    if ((handleExisting as any[]).length > 0) {
      res.status(409).json({ message: '이미 사용 중인 핸들이에요' })
      return
    }

    await conn.beginTransaction()

    const [streamerResult] = await conn.query(
      'INSERT INTO streamers (channel_id, name, handle) VALUES (?, ?, ?)',
      [email, name, `@${handle}`]
    ) as any[]
    const streamerId = (streamerResult as any).insertId

    const hash = await bcrypt.hash(password, 10)
    const [userResult] = await conn.query(
      'INSERT INTO users (email, password_hash, streamer_id) VALUES (?, ?, ?)',
      [email, hash, streamerId]
    ) as any[]
    const userId = (userResult as any).insertId

    await conn.commit()

    const token = jwt.sign(
      { id: userId, email, streamer_id: streamerId },
      SECRET,
      { expiresIn: EXPIRES } as any
    )
    res.status(201).json({ token, streamer_id: streamerId, name, handle: `@${handle}` })
  } catch (err) {
    await conn.rollback()
    console.error(err)
    res.status(500).json({ message: '서버 오류가 발생했어요' })
  } finally {
    conn.release()
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요' })
    return
  }

  const [rows] = await pool.query(
    'SELECT u.*, s.name, s.handle FROM users u LEFT JOIN streamers s ON s.id = u.streamer_id WHERE u.email = ?',
    [email]
  ) as any[]

  const user = (rows as any[])[0]
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ message: '이메일 또는 비밀번호가 틀렸어요' })
    return
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, streamer_id: user.streamer_id },
    SECRET,
    { expiresIn: EXPIRES } as any
  )
  res.json({ token, streamer_id: user.streamer_id, name: user.name, handle: user.handle })
})

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) { res.status(401).json({ message: '비로그인' }); return }
  try {
    const payload = jwt.verify(token, SECRET) as any
    const [rows] = await pool.query(
      'SELECT u.id, u.email, u.streamer_id, s.name, s.handle, s.follower_count FROM users u LEFT JOIN streamers s ON s.id = u.streamer_id WHERE u.id = ?',
      [payload.id]
    ) as any[]
    res.json((rows as any[])[0])
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰' })
  }
})

export default router
