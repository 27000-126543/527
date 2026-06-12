import { Router, type Request, type Response } from 'express'
import { notifications } from '../db.js'

const router = Router()

router.get('/list', (req: Request, res: Response): void => {
  const userId = Number(req.query.user_id)
  const type = req.query.type as string | undefined
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少user_id参数' })
    return
  }
  let result = notifications.filter(n => n.user_id === userId)
  if (type) {
    result = result.filter(n => n.type === type)
  }
  result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  res.json({ success: true, data: result })
})

router.post('/read', (req: Request, res: Response): void => {
  const notificationId = req.body.id || req.body.notification_id
  if (!notificationId) {
    res.status(400).json({ success: false, error: '缺少通知ID' })
    return
  }
  const notification = notifications.find(n => n.id === Number(notificationId))
  if (!notification) {
    res.status(404).json({ success: false, error: '通知不存在' })
    return
  }
  notification.is_read = true
  res.json({ success: true, data: notification })
})

router.post('/read-all', (req: Request, res: Response): void => {
  const { user_id } = req.body
  if (!user_id) {
    res.status(400).json({ success: false, error: '缺少user_id' })
    return
  }
  const userNotifications = notifications.filter(n => n.user_id === user_id)
  for (const n of userNotifications) {
    n.is_read = true
  }
  res.json({ success: true, data: { updated_count: userNotifications.length } })
})

router.get('/unread-count', (req: Request, res: Response): void => {
  const userId = Number(req.query.user_id)
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少user_id参数' })
    return
  }
  const count = notifications.filter(n => n.user_id === userId && !n.is_read).length
  res.json({ success: true, data: { unread_count: count } })
})

export default router
