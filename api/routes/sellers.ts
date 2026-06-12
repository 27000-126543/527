import { Router, type Request, type Response } from 'express'
import {
  users, qualifications, products, appeals, complaints,
  getNextQualificationId, getNextProductId, getNextAppealId,
  checkInfringement, calculateRefundRatio, addNotification,
  getNextRefundRequestId, refundRequests,
} from '../db.js'
import type { Qualification, Product, Appeal, RefundRequest } from '../db.js'

const router = Router()

router.get('/dashboard', (req: Request, res: Response): void => {
  const userId = Number(req.query.user_id)
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少user_id参数' })
    return
  }
  const user = users.find(u => u.id === userId && u.role === 'seller')
  if (!user) {
    res.status(404).json({ success: false, error: '卖家不存在' })
    return
  }
  const sellerProducts = products.filter(p => p.seller_id === userId)
  const sellerAppeals = appeals.filter(a => a.seller_id === userId)
  const pendingItems = sellerProducts.filter(p => p.status === 'locked').length +
    sellerAppeals.filter(a => a.status === 'pending' || a.status === 'under_review').length
  res.json({
    success: true,
    data: {
      total_products: sellerProducts.length,
      pending_items: pendingItems,
      reputation_score: user.reputation_score,
    },
  })
})

router.get('/profile', (req: Request, res: Response): void => {
  const userId = Number(req.query.user_id)
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少user_id参数' })
    return
  }
  const user = users.find(u => u.id === userId)
  if (!user || user.role !== 'seller') {
    res.status(404).json({ success: false, error: '卖家不存在' })
    return
  }
  const { password, ...userData } = user
  void password
  res.json({ success: true, data: userData })
})

router.post('/qualification', (req: Request, res: Response): void => {
  const { user_id, documents } = req.body
  if (!user_id || !documents) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const user = users.find(u => u.id === user_id && u.role === 'seller')
  if (!user) {
    res.status(404).json({ success: false, error: '卖家不存在' })
    return
  }
  const dbMatchScore = Math.round((Math.random() * 0.45 + 0.5) * 100) / 100
  const status: Qualification['status'] = dbMatchScore > 0.8 ? 'auto_verified' : 'manual_review'
  const verificationResult = `企业信息匹配度${Math.round(dbMatchScore * 100)}%`
  const qualification: Qualification = {
    id: getNextQualificationId(),
    user_id,
    documents,
    verification_result: verificationResult,
    db_match_score: dbMatchScore,
    status,
    reviewed_by: null,
    review_comment: '',
    created_at: new Date().toISOString(),
  }
  qualifications.push(qualification)
  if (status === 'manual_review') {
    const reviewers = users.filter(u => u.role === 'reviewer')
    for (const reviewer of reviewers) {
      addNotification(reviewer.id, 'review', '新资质待审核', `卖家"${user.company_name}"提交了企业资质，请审核`, qualification.id, 'qualification')
    }
  }
  res.json({ success: true, data: qualification })
})

router.get('/qualifications', (req: Request, res: Response): void => {
  const userId = Number(req.query.user_id)
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少user_id参数' })
    return
  }
  const sellerQualifications = qualifications.filter(q => q.user_id === userId)
  res.json({ success: true, data: sellerQualifications })
})

router.get('/products', (req: Request, res: Response): void => {
  const userId = Number(req.query.user_id)
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少user_id参数' })
    return
  }
  const sellerProducts = products.filter(p => p.seller_id === userId)
  res.json({ success: true, data: sellerProducts })
})

router.post('/products', (req: Request, res: Response): void => {
  const { seller_id, title, description, images, category, price } = req.body
  if (!seller_id || !title || !category || price === undefined) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const user = users.find(u => u.id === seller_id && u.role === 'seller')
  if (!user) {
    res.status(404).json({ success: false, error: '卖家不存在' })
    return
  }
  const infringement = checkInfringement(title, description || '', category)
  const product: Product = {
    id: getNextProductId(),
    seller_id,
    title,
    description: description || '',
    images: images || '',
    category,
    price: Number(price),
    status: infringement.flag ? 'locked' : 'normal',
    infringement_flag: infringement.flag,
    infringement_detail: infringement.detail,
    complaint_rate: 0,
    created_at: new Date().toISOString(),
  }
  products.push(product)
  if (infringement.flag) {
    const reviewers = users.filter(u => u.role === 'reviewer')
    for (const reviewer of reviewers) {
      addNotification(reviewer.id, 'review', '侵权复审待处理', `商品"${title}"命中侵权库，请复审`, product.id, 'product')
    }
    addNotification(seller_id, 'complaint', '商品被锁定', `您的商品"${title}"因疑似侵权已被锁定`, product.id, 'product')
  }
  res.json({ success: true, data: product })
})

router.get('/appeals', (req: Request, res: Response): void => {
  const userId = Number(req.query.user_id)
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少user_id参数' })
    return
  }
  const sellerAppeals = appeals.filter(a => a.seller_id === userId)
  res.json({ success: true, data: sellerAppeals })
})

router.post('/appeals', (req: Request, res: Response): void => {
  const { complaint_id, seller_id, product_id, evidence, reason, description } = req.body
  if (!complaint_id || !seller_id || !product_id || !description) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const complaint = complaints.find(c => c.id === complaint_id)
  if (!complaint) {
    res.status(404).json({ success: false, error: '投诉不存在' })
    return
  }
  const appeal: Appeal = {
    id: getNextAppealId(),
    complaint_id,
    seller_id,
    product_id,
    reason: reason || '对侵权判定有异议',
    evidence: evidence || '',
    description,
    status: 'pending',
    arbitrated_by: null,
    arbitration_comment: '',
    created_at: new Date().toISOString(),
  }
  appeals.push(appeal)
  complaint.status = 'appealed'
  const reviewers = users.filter(u => u.role === 'reviewer')
  for (const reviewer of reviewers) {
    addNotification(reviewer.id, 'appeal', '申诉待仲裁', `卖家对投诉#${complaint_id}提起申诉，请仲裁`, appeal.id, 'appeal')
  }
  const complaintOwner = users.find(u => u.id === complaint.owner_id)
  if (complaintOwner) {
    addNotification(complaintOwner.id, 'appeal', '卖家提起申诉', `投诉#${complaint_id}的卖家已提起申诉，请关注`, complaint_id, 'complaint')
  }
  res.json({ success: true, data: appeal })
})

router.get('/deposit', (req: Request, res: Response): void => {
  const userId = Number(req.query.user_id)
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少user_id参数' })
    return
  }
  const user = users.find(u => u.id === userId && u.role === 'seller')
  if (!user) {
    res.status(404).json({ success: false, error: '卖家不存在' })
    return
  }
  res.json({
    success: true,
    data: {
      deposit_balance: user.deposit_balance,
      deposit_frozen: user.deposit_frozen,
      available: user.deposit_balance - user.deposit_frozen,
    },
  })
})

router.post('/deposit/refund', (req: Request, res: Response): void => {
  const { seller_id, amount } = req.body
  if (!seller_id || !amount) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const user = users.find(u => u.id === seller_id && u.role === 'seller')
  if (!user) {
    res.status(404).json({ success: false, error: '卖家不存在' })
    return
  }
  const available = user.deposit_balance - user.deposit_frozen
  if (Number(amount) > available) {
    res.status(400).json({ success: false, error: '退还金额超过可用余额' })
    return
  }
  const { ratio, detail } = calculateRefundRatio(user, products)
  const refundRequest: RefundRequest = {
    id: getNextRefundRequestId(),
    seller_id,
    amount: Number(amount),
    refundable_ratio: ratio,
    calculation_detail: detail,
    status: 'pending',
    approved_by: null,
    comment: '',
    created_at: new Date().toISOString(),
  }
  refundRequests.push(refundRequest)
  const financeUsers = users.filter(u => u.role === 'finance')
  for (const fu of financeUsers) {
    addNotification(fu.id, 'refund', '新退还申请', `卖家"${user.company_name}"提交了保证金退还申请`, refundRequest.id, 'refund')
  }
  res.json({ success: true, data: refundRequest })
})

export default router
