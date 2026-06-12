import { Router, type Request, type Response } from 'express'
import { users, refundRequests, monthlyReports, addNotification } from '../db.js'

const router = Router()

router.get('/refund-requests', (req: Request, res: Response): void => {
  const status = req.query.status as string | undefined
  let result = refundRequests
  if (status) {
    result = refundRequests.filter(r => r.status === status)
  }
  const enriched = result.map(r => {
    const seller = users.find(u => u.id === r.seller_id)
    return {
      ...r,
      seller_name: seller?.company_name || '',
      seller_username: seller?.username || '',
    }
  })
  res.json({ success: true, data: enriched })
})

router.post('/refund-requests/:id/approve', (req: Request, res: Response): void => {
  const id = Number(req.params.id)
  const { finance_id, comment } = req.body
  if (!finance_id) {
    res.status(400).json({ success: false, error: '缺少finance_id' })
    return
  }
  const financeUser = users.find(u => u.id === finance_id && u.role === 'finance')
  if (!financeUser) {
    res.status(403).json({ success: false, error: '无审批权限' })
    return
  }
  const refund = refundRequests.find(r => r.id === id)
  if (!refund) {
    res.status(404).json({ success: false, error: '退还申请不存在' })
    return
  }
  if (refund.status !== 'pending') {
    res.status(400).json({ success: false, error: '该申请已处理' })
    return
  }
  refund.status = 'approved'
  refund.approved_by = finance_id
  refund.comment = comment || '批准退还'
  const seller = users.find(u => u.id === refund.seller_id)
  if (seller) {
    const refundAmount = Math.round(refund.amount * refund.refundable_ratio * 100) / 100
    seller.deposit_balance -= refundAmount
    addNotification(seller.id, 'refund', '保证金退还审批通过', `您的保证金退还申请已通过，退还金额：${refundAmount}元`, id, 'refund')
  }
  res.json({ success: true, data: refund })
})

router.post('/refund-requests/:id/reject', (req: Request, res: Response): void => {
  const id = Number(req.params.id)
  const { finance_id, comment } = req.body
  if (!finance_id) {
    res.status(400).json({ success: false, error: '缺少finance_id' })
    return
  }
  const financeUser = users.find(u => u.id === finance_id && u.role === 'finance')
  if (!financeUser) {
    res.status(403).json({ success: false, error: '无审批权限' })
    return
  }
  const refund = refundRequests.find(r => r.id === id)
  if (!refund) {
    res.status(404).json({ success: false, error: '退还申请不存在' })
    return
  }
  if (refund.status !== 'pending') {
    res.status(400).json({ success: false, error: '该申请已处理' })
    return
  }
  refund.status = 'rejected'
  refund.approved_by = finance_id
  refund.comment = comment || '拒绝退还'
  addNotification(refund.seller_id, 'refund', '保证金退还申请被拒绝', `您的保证金退还申请未通过，原因：${refund.comment}`, id, 'refund')
  res.json({ success: true, data: refund })
})

router.get('/reports', (req: Request, res: Response): void => {
  const region = req.query.region as string | undefined
  const month = req.query.month ? Number(req.query.month) : undefined
  const year = req.query.year ? Number(req.query.year) : undefined
  let result = monthlyReports
  if (region) result = result.filter(r => r.region === region)
  if (month !== undefined) result = result.filter(r => r.month === month)
  if (year !== undefined) result = result.filter(r => r.year === year)
  res.json({ success: true, data: result })
})

export default router
