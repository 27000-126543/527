import { Router, type Request, type Response } from 'express'
import {
  users, products, inspectionPlans, inspectionReports,
  getNextInspectionReportId, addNotification,
} from '../db.js'
import type { InspectionReport } from '../db.js'

const router = Router()

router.get('/dashboard', (req: Request, res: Response): void => {
  const inspectorId = Number(req.query.inspector_id)
  if (!inspectorId) {
    res.status(400).json({ success: false, error: '缺少inspector_id参数' })
    return
  }
  const myPlans = inspectionPlans.filter(p => p.inspector_id === inspectorId)
  const pendingTasks = myPlans.filter(p => p.status === 'pending' || p.status === 'assigned').length
  const inProgressTasks = 0
  const completedTasks = myPlans.filter(p => p.status === 'completed').length
  const recentTasks = myPlans.slice(0, 5).map(plan => {
    const product = products.find(p => p.id === plan.product_id)
    return {
      id: plan.id,
      product_name: product?.title || '',
      category: product?.category || '',
      priority: plan.priority,
      status: plan.status,
      assigned_date: plan.assigned_at || plan.created_at,
    }
  })
  res.json({
    success: true,
    data: {
      pending_tasks: pendingTasks,
      in_progress_tasks: inProgressTasks,
      completed_tasks: completedTasks,
      recent_tasks: recentTasks,
    },
  })
})

router.get('/tasks', (req: Request, res: Response): void => {
  const inspectorId = Number(req.query.inspector_id)
  if (!inspectorId) {
    res.status(400).json({ success: false, error: '缺少inspector_id参数' })
    return
  }
  const inspector = users.find(u => u.id === inspectorId && u.role === 'inspector')
  if (!inspector) {
    res.status(404).json({ success: false, error: '检验员不存在' })
    return
  }
  const tasks = inspectionPlans
    .filter(p => p.inspector_id === inspectorId)
    .map(plan => {
      const product = products.find(p => p.id === plan.product_id)
      const seller = product ? users.find(u => u.id === product.seller_id) : null
      const report = inspectionReports.find(r => r.plan_id === plan.id)
      const statusMap: Record<string, string> = {
        pending: 'assigned',
        assigned: 'assigned',
        sampling: 'in_progress',
        completed: 'completed',
      }
      return {
        id: plan.id,
        product_id: plan.product_id,
        product_name: product?.title || '',
        product_description: product?.description || '',
        category: product?.category || '',
        seller_name: seller?.company_name || seller?.username || '',
        priority: plan.priority,
        status: statusMap[plan.status] || plan.status,
        assigned_date: plan.assigned_at || plan.created_at,
        report_result: report?.result || null,
      }
    })
  res.json({ success: true, data: tasks })
})

router.post('/tasks/:id/start', (req: Request, res: Response): void => {
  const taskId = Number(req.params.id)
  const { inspector_id } = req.body
  if (!inspector_id) {
    res.status(400).json({ success: false, error: '缺少inspector_id' })
    return
  }
  const plan = inspectionPlans.find(p => p.id === taskId)
  if (!plan) {
    res.status(404).json({ success: false, error: '任务不存在' })
    return
  }
  if (plan.inspector_id !== Number(inspector_id)) {
    res.status(403).json({ success: false, error: '该任务不属于此检验员' })
    return
  }
  if (plan.status !== 'assigned' && plan.status !== 'pending') {
    res.status(400).json({ success: false, error: '任务状态不允许启动' })
    return
  }
  plan.status = 'assigned'
  plan.assigned_at = new Date().toISOString()
  res.json({ success: true, data: plan })
})

router.post('/reports', (req: Request, res: Response): void => {
  const planId = req.body.plan_id || req.body.task_id
  const { inspector_id, result, report_file, photos, details } = req.body
  if (!planId || !inspector_id || !result) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const plan = inspectionPlans.find(p => p.id === Number(planId))
  if (!plan) {
    res.status(404).json({ success: false, error: '抽检计划不存在' })
    return
  }
  const inspector = users.find(u => u.id === inspector_id && u.role === 'inspector')
  if (!inspector) {
    res.status(403).json({ success: false, error: '无检验权限' })
    return
  }
  if (plan.inspector_id !== inspector_id) {
    res.status(403).json({ success: false, error: '该任务不属于此检验员' })
    return
  }
  const validResults: InspectionReport['result'][] = ['qualified', 'warning', 'unqualified']
  if (!validResults.includes(result)) {
    res.status(400).json({ success: false, error: '无效的检测结果' })
    return
  }
  const report: InspectionReport = {
    id: getNextInspectionReportId(),
    plan_id: Number(planId),
    inspector_id,
    result,
    report_file: report_file || '',
    photos: photos || '',
    details: details || '',
    created_at: new Date().toISOString(),
  }
  inspectionReports.push(report)
  plan.status = 'completed'
  plan.completed_at = new Date().toISOString()
  const product = products.find(p => p.id === plan.product_id)
  if (product) {
    const seller = users.find(u => u.id === product.seller_id)
    if (result === 'unqualified') {
      product.status = 'delisted'
      if (seller) {
        seller.reputation_score = Math.max(0, (seller.reputation_score || 0) - 10)
      }
      addNotification(product.seller_id, 'inspection', '商品抽检不合格', `您的商品"${product.title}"抽检不合格，商品已强制下架，信誉分扣减10分`, Number(planId), 'inspection')
    } else if (result === 'warning') {
      product.status = 'warning'
      if (seller) {
        seller.reputation_score = Math.max(0, (seller.reputation_score || 0) - 3)
      }
      addNotification(product.seller_id, 'inspection', '商品抽检预警', `您的商品"${product.title}"抽检结果为预警，信誉分扣减3分，请关注`, Number(planId), 'inspection')
    } else {
      addNotification(product.seller_id, 'inspection', '商品抽检完成', `您的商品"${product.title}"抽检结果为合格`, Number(planId), 'inspection')
    }
  }
  res.json({ success: true, data: report })
})

router.get('/history', (req: Request, res: Response): void => {
  const inspectorId = Number(req.query.inspector_id)
  if (!inspectorId) {
    res.status(400).json({ success: false, error: '缺少inspector_id参数' })
    return
  }
  const inspectorReports = inspectionReports.filter(r => r.inspector_id === inspectorId)
  const totalCount = inspectorReports.length
  const qualifiedCount = inspectorReports.filter(r => r.result === 'qualified').length
  const warningCount = inspectorReports.filter(r => r.result === 'warning').length
  const unqualifiedCount = inspectorReports.filter(r => r.result === 'unqualified').length
  const passRate = totalCount > 0 ? Math.round((qualifiedCount / totalCount) * 100) : 0
  const reports = inspectorReports.map(report => {
    const plan = inspectionPlans.find(p => p.id === report.plan_id)
    const product = plan ? products.find(p => p.id === plan.product_id) : null
    return {
      id: report.id,
      product_name: product?.title || '',
      category: product?.category || '',
      result: report.result,
      details: report.details,
      report_file: report.report_file,
      created_at: new Date(report.created_at).toLocaleDateString('zh-CN'),
    }
  })
  res.json({
    success: true,
    data: {
      reports,
      stats: {
        total_inspections: totalCount,
        qualified_count: qualifiedCount,
        warning_count: warningCount,
        unqualified_count: unqualifiedCount,
        pass_rate: passRate,
      }
    }
  })
})

export default router
