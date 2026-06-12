import { Router, type Request, type Response } from 'express'
import { users, getNextUserId } from '../db.js'
import type { User } from '../db.js'

const router = Router()

router.post('/register', (req: Request, res: Response): void => {
  const { username, password, role, company_name, region } = req.body
  if (!username || !password || !role || !company_name) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const existing = users.find(u => u.username === username)
  if (existing) {
    res.status(409).json({ success: false, error: '用户名已存在' })
    return
  }
  const validRoles: User['role'][] = ['seller', 'reviewer', 'inspector', 'ip_owner', 'finance']
  if (!validRoles.includes(role)) {
    res.status(400).json({ success: false, error: '无效的角色类型' })
    return
  }
  const newUser: User = {
    id: getNextUserId(),
    username,
    password,
    role,
    company_name,
    reputation_score: 80,
    deposit_balance: 0,
    deposit_frozen: 0,
    status: 'active',
    region: region || '',
    created_at: new Date().toISOString(),
  }
  users.push(newUser)
  const { password: _pwd1, ...userData } = newUser
  void _pwd1
  res.json({ success: true, data: userData })
})

router.post('/login', (req: Request, res: Response): void => {
  const { username, password, role } = req.body
  if (!username || !password || !role) {
    res.status(400).json({ success: false, error: '缺少用户名、密码或角色' })
    return
  }
  const user = users.find(u => u.username === username && u.password === password && u.role === role)
  if (!user) {
    res.status(401).json({ success: false, error: '用户名、密码或角色不匹配' })
    return
  }
  if (user.status === 'banned') {
    res.status(403).json({ success: false, error: '账号已被封禁' })
    return
  }
  const { password: _pwd2, ...userData } = user
  void _pwd2
  res.json({ success: true, data: userData })
})

router.get('/me', (req: Request, res: Response): void => {
  const userId = Number(req.query.user_id)
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少user_id参数' })
    return
  }
  const user = users.find(u => u.id === userId)
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }
  const { password: _pwd3, ...userData } = user
  void _pwd3
  res.json({ success: true, data: userData })
})

export default router
