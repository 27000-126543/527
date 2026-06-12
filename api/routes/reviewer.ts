import { Router, type Request, type Response } from 'express'
import {
  users, qualifications, products, appeals, complaints,
  addNotification,
} from '../db.js'

const router = Router()

router.get('/dashboard', (req: Request, res: Response): void => {
  const pendingQualifications = qualifications.filter(q => q.status === 'manual_review').length
  const pendingInfringement = products.filter(p => p.infringement_flag && p.status !== 'delisted').length
  const pendingAppeals = appeals.filter(a => a.status === 'pending' || a.status === 'under_review').length
  res.json({
    success: true,
    data: {
      pending_qualifications: pendingQualifications,
      pending_infringement: pendingInfringement,
      pending_appeals: pendingAppeals,
    },
  })
})

router.get('/qualification-queue', (req: Request, res: Response): void => {
  const pending = qualifications.filter(q => q.status === 'manual_review')
  const queue = pending.map(q => {
    const seller = users.find(u => u.id === q.user_id)
    return { ...q, seller_name: seller?.company_name || '' }
  })
  res.json({ success: true, data: queue })
})

router.get('/infringement-queue', (req: Request, res: Response): void => {
  const flagged = products.filter(p => p.infringement_flag && p.status !== 'delisted')
  res.json({ success: true, data: flagged })
})

router.get('/appeal-queue', (req: Request, res: Response): void => {
  const pending = appeals.filter(a => a.status === 'pending' || a.status === 'under_review')
  const queue = pending.map(a => {
    const seller = users.find(u => u.id === a.seller_id)
    const product = products.find(p => p.id === a.product_id)
    const complaint = complaints.find(c => c.id === a.complaint_id)
    return {
      ...a,
      evidence: a.evidence ? a.evidence.split(/[、,]/).filter(Boolean) : [],
      seller_name: seller?.company_name || '',
      product_title: product?.title || '',
      complaint_reason: complaint?.reason || '',
      complaint_detail: complaint?.description || '',
      appeal_reason: a.reason || '对侵权判定有异议',
      appeal_description: a.description || '',
      complaint_status: complaint?.status || '',
    }
  })
  res.json({ success: true, data: queue })
})

router.post('/review/qualification', (req: Request, res: Response): void => {
  const { qualification_id, reviewer_id, status, comment } = req.body
  if (!qualification_id || !reviewer_id || !status) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const qualification = qualifications.find(q => q.id === qualification_id)
  if (!qualification) {
    res.status(404).json({ success: false, error: '资质记录不存在' })
    return
  }
  const reviewer = users.find(u => u.id === reviewer_id && u.role === 'reviewer')
  if (!reviewer) {
    res.status(403).json({ success: false, error: '无审核权限' })
    return
  }
  if (status !== 'approved' && status !== 'rejected') {
    res.status(400).json({ success: false, error: '无效的审核状态' })
    return
  }
  qualification.status = status
  qualification.reviewed_by = reviewer_id
  qualification.review_comment = comment || ''
  const seller = users.find(u => u.id === qualification.user_id)
  if (seller) {
    const title = status === 'approved' ? '资质审核通过' : '资质审核未通过'
    const content = status === 'approved'
      ? `您的企业资质已通过审核`
      : `您的企业资质未通过审核，原因：${comment || '无'}`
    addNotification(seller.id, 'review', title, content, qualification_id, 'qualification')
  }
  res.json({ success: true, data: qualification })
})

router.post('/review/infringement', (req: Request, res: Response): void => {
  const { product_id, reviewer_id, action, comment: _comment } = req.body
  void _comment
  if (!product_id || !reviewer_id || !action) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const product = products.find(p => p.id === product_id)
  if (!product) {
    res.status(404).json({ success: false, error: '商品不存在' })
    return
  }
  const reviewer = users.find(u => u.id === reviewer_id && u.role === 'reviewer')
  if (!reviewer) {
    res.status(403).json({ success: false, error: '无审核权限' })
    return
  }
  if (action === 'confirm') {
    product.status = 'locked'
    addNotification(product.seller_id, 'complaint', '侵权确认通知', `您的商品"${product.title}"经审核确认侵权，已被锁定`, product_id, 'product')
  } else if (action === 'dismiss') {
    product.infringement_flag = false
    product.infringement_detail = ''
    product.status = 'normal'
    addNotification(product.seller_id, 'review', '侵权嫌疑解除', `您的商品"${product.title}"经审核未发现侵权，已恢复正常`, product_id, 'product')
  } else {
    res.status(400).json({ success: false, error: '无效的操作类型' })
    return
  }
  res.json({ success: true, data: product })
})

router.post('/arbitrate/appeal', (req: Request, res: Response): void => {
  const { appeal_id, reviewer_id, action, arbitration_comment, comment } = req.body
  const status = action || req.body.status
  const finalComment = arbitration_comment || comment || ''
  if (!appeal_id || !reviewer_id || !status) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const appeal = appeals.find(a => a.id === appeal_id)
  if (!appeal) {
    res.status(404).json({ success: false, error: '申诉不存在' })
    return
  }
  const reviewer = users.find(u => u.id === reviewer_id && u.role === 'reviewer')
  if (!reviewer) {
    res.status(403).json({ success: false, error: '无仲裁权限' })
    return
  }
  if (status !== 'upheld' && status !== 'rejected') {
    res.status(400).json({ success: false, error: '无效的仲裁状态' })
    return
  }
  appeal.status = status
  appeal.arbitrated_by = reviewer_id
  appeal.arbitration_comment = finalComment
  const product = products.find(p => p.id === appeal.product_id)
  const complaint = complaints.find(c => c.id === appeal.complaint_id)
  if (status === 'upheld') {
    if (complaint) complaint.status = 'dismissed'
    if (product) {
      product.infringement_flag = false
      product.infringement_detail = ''
      product.status = 'normal'
    }
    addNotification(appeal.seller_id, 'appeal', '申诉成功', `您对商品"${product?.title || ''}"的申诉已通过，商品已恢复`, appeal_id, 'appeal')
    if (complaint) {
      addNotification(complaint.owner_id, 'appeal', '申诉仲裁结果', `投诉#${complaint.id}的卖家申诉成立，投诉已撤销`, complaint.id, 'complaint')
    }
  } else {
    if (complaint) complaint.status = 'resolved'
    if (product) product.status = 'locked'
    addNotification(appeal.seller_id, 'appeal', '申诉驳回', `您对商品"${product?.title || ''}"的申诉已被驳回，原因：${finalComment || '无'}`, appeal_id, 'appeal')
    if (complaint) {
      addNotification(complaint.owner_id, 'appeal', '申诉仲裁结果', `投诉#${complaint.id}的卖家申诉被驳回`, complaint.id, 'complaint')
    }
  }
  res.json({ success: true, data: appeal })
})

export default router
