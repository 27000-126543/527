import { Router, type Request, type Response } from 'express'
import {
  users, ipCertificates, complaints, products,
  getNextCertificateId, getNextComplaintId,
  matchInfringingProducts, addNotification,
} from '../db.js'
import type { IPCertificate, Complaint } from '../db.js'

const router = Router()

router.get('/certificates', (req: Request, res: Response): void => {
  const ownerId = Number(req.query.owner_id)
  if (!ownerId) {
    res.status(400).json({ success: false, error: '缺少owner_id参数' })
    return
  }
  const ownerCerts = ipCertificates.filter(c => c.owner_id === ownerId)
  res.json({ success: true, data: ownerCerts })
})

router.post('/certificates', (req: Request, res: Response): void => {
  const { owner_id, type, document, document_name, description } = req.body
  const finalDocument = document || document_name
  if (!owner_id || !type || !finalDocument || !description) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const owner = users.find(u => u.id === owner_id && u.role === 'ip_owner')
  if (!owner) {
    res.status(404).json({ success: false, error: 'IP权利人不存在' })
    return
  }
  const validTypes: IPCertificate['type'][] = ['trademark', 'patent', 'copyright']
  if (!validTypes.includes(type)) {
    res.status(400).json({ success: false, error: '无效的证书类型' })
    return
  }
  const certificate: IPCertificate = {
    id: getNextCertificateId(),
    owner_id,
    type,
    document: finalDocument,
    description,
    status: 'active',
    created_at: new Date().toISOString(),
  }
  ipCertificates.push(certificate)
  res.json({ success: true, data: certificate })
})

router.get('/complaints', (req: Request, res: Response): void => {
  const ownerId = Number(req.query.owner_id)
  if (!ownerId) {
    res.status(400).json({ success: false, error: '缺少owner_id参数' })
    return
  }
  const ownerComplaints = complaints
    .filter(c => c.owner_id === ownerId)
    .map(c => {
      const cert = ipCertificates.find(cert => cert.id === c.certificate_id)
      const matchedProducts = JSON.parse(c.matched_products || '[]')
      const confirmedProducts = JSON.parse(c.confirmed_products || '[]')
      const matchedProductDetails = matchedProducts.map((pid: number) => {
        const p = products.find(pr => pr.id === pid)
        return p ? { id: p.id, title: p.title, status: p.status } : { id: pid, title: '', status: '' }
      })
      return {
        ...c,
        certificate_type: cert?.type || '',
        certificate_description: cert?.description || '',
        matched_product_details: matchedProductDetails,
        matched_products: confirmedProducts.length || matchedProducts.length,
        confirmed_count: confirmedProducts.length,
      }
    })
  res.json({ success: true, data: ownerComplaints })
})

router.post('/complaints', (req: Request, res: Response): void => {
  const { owner_id, certificate_id, matched_products, reason, description } = req.body
  if (!owner_id || !certificate_id) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const cert = ipCertificates.find(c => c.id === certificate_id && c.owner_id === owner_id)
  if (!cert) {
    res.status(404).json({ success: false, error: '证书不存在或不属于该权利人' })
    return
  }
  const complaint: Complaint = {
    id: getNextComplaintId(),
    certificate_id,
    owner_id,
    matched_products: matched_products || '[]',
    confirmed_products: '[]',
    reason: reason || '涉嫌侵权',
    description: description || '权利人发起侵权投诉，请审核',
    status: 'pending',
    created_at: new Date().toISOString(),
  }
  complaints.push(complaint)
  const reviewers = users.filter(u => u.role === 'reviewer')
  for (const reviewer of reviewers) {
    addNotification(reviewer.id, 'complaint', '新侵权投诉', `IP权利人提交了新的侵权投诉，请审核`, complaint.id, 'complaint')
  }
  res.json({ success: true, data: complaint })
})

router.get('/match', (req: Request, res: Response): void => {
  const certificateId = Number(req.query.certificate_id)
  if (!certificateId) {
    res.status(400).json({ success: false, error: '缺少certificate_id参数' })
    return
  }
  const cert = ipCertificates.find(c => c.id === certificateId)
  if (!cert) {
    res.status(404).json({ success: false, error: '证书不存在' })
    return
  }
  const matchedIds = matchInfringingProducts(certificateId)
  const typeLabel: Record<string, string> = {
    trademark: '商标',
    copyright: '著作权',
    patent: '专利',
  }
  const matchedProducts = matchedIds.map(pid => {
    const p = products.find(pr => pr.id === pid)
    const seller = p ? users.find(u => u.id === p.seller_id) : null
    return {
      id: pid,
      product_name: p?.title || '',
      seller_name: seller?.company_name || seller?.username || '',
      match_reason: `与${typeLabel[cert.type] || cert.type}「${cert.description}」高度相似`,
      status: p?.status || '',
    }
  })
  res.json({ success: true, data: { certificate_id: certificateId, matched_products: matchedProducts } })
})

router.post('/confirm', (req: Request, res: Response): void => {
  const { complaint_id, confirmed_products, certificate_id, product_ids, owner_id, reason, description } = req.body
  const finalConfirmed = confirmed_products || product_ids || []
  let complaint = complaint_id ? complaints.find(c => c.id === complaint_id) : null
  if (!complaint) {
    if (!certificate_id || !owner_id) {
      res.status(400).json({ success: false, error: '缺少complaint_id或(certificate_id + owner_id)' })
      return
    }
    const cert = ipCertificates.find(c => c.id === certificate_id && c.owner_id === owner_id)
    if (!cert) {
      res.status(404).json({ success: false, error: '证书不存在或不属于该权利人' })
      return
    }
    const newComplaint: Complaint = {
      id: getNextComplaintId(),
      certificate_id,
      owner_id,
      matched_products: JSON.stringify(finalConfirmed),
      confirmed_products: JSON.stringify(finalConfirmed),
      reason: reason || '涉嫌侵权',
      description: description || '权利人发起侵权投诉',
      status: 'notice_sent',
      created_at: new Date().toISOString(),
    }
    complaints.push(newComplaint)
    complaint = newComplaint
  } else {
    complaint.confirmed_products = JSON.stringify(finalConfirmed)
    complaint.status = 'notice_sent'
  }
  for (const pid of finalConfirmed) {
    const product = products.find(p => p.id === pid)
    if (product) {
      product.status = 'locked'
      product.infringement_flag = true
      addNotification(product.seller_id, 'complaint', '侵权投诉通知', `您的商品"${product.title}"收到知识产权投诉，商品已被锁定，请及时申诉`, complaint.id, 'complaint')
    }
  }
  const reviewers = users.filter(u => u.role === 'reviewer')
  for (const reviewer of reviewers) {
    addNotification(reviewer.id, 'complaint', '新侵权投诉', `IP权利人发起侵权投诉#${complaint.id}，涉及${finalConfirmed.length}件商品，请审核`, complaint.id, 'complaint')
  }
  addNotification(complaint.owner_id, 'complaint', '投诉已受理', `您发起的投诉#${complaint.id}已确认，下架通知已发送至相关卖家`, complaint.id, 'complaint')
  res.json({ success: true, data: complaint })
})

export default router
