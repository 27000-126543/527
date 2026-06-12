export type UserRole = 'seller' | 'reviewer' | 'inspector' | 'ip_owner' | 'finance'

export interface User {
  id: number
  username: string
  password: string
  role: UserRole
  company_name: string
  reputation_score: number
  deposit_balance: number
  deposit_frozen: number
  status: 'active' | 'suspended' | 'banned'
  region: string
  created_at: string
}

export interface Qualification {
  id: number
  user_id: number
  documents: string
  verification_result: string
  db_match_score: number
  status: 'pending' | 'auto_verified' | 'manual_review' | 'approved' | 'rejected'
  reviewed_by: number | null
  review_comment: string
  created_at: string
}

export interface Product {
  id: number
  seller_id: number
  title: string
  description: string
  images: string
  category: string
  price: number
  status: 'normal' | 'warning' | 'locked' | 'delisted'
  infringement_flag: boolean
  infringement_detail: string
  complaint_rate: number
  created_at: string
}

export interface InspectionPlan {
  id: number
  product_id: number
  inspector_id: number | null
  priority: 'low' | 'normal' | 'high'
  status: 'pending' | 'assigned' | 'sampling' | 'completed'
  assigned_at: string | null
  completed_at: string | null
  created_at: string
}

export interface InspectionReport {
  id: number
  plan_id: number
  inspector_id: number
  result: 'qualified' | 'warning' | 'unqualified'
  report_file: string
  photos: string
  details: string
  created_at: string
}

export interface IPCertificate {
  id: number
  owner_id: number
  type: 'trademark' | 'patent' | 'copyright'
  document: string
  description: string
  status: 'active' | 'expired' | 'revoked'
  created_at: string
}

export interface Complaint {
  id: number
  certificate_id: number
  owner_id: number
  matched_products: string
  confirmed_products: string
  reason: string
  description: string
  status: 'pending' | 'confirmed' | 'notice_sent' | 'appealed' | 'resolved' | 'dismissed'
  created_at: string
}

export interface Appeal {
  id: number
  complaint_id: number
  seller_id: number
  product_id: number
  reason: string
  evidence: string
  description: string
  status: 'pending' | 'under_review' | 'upheld' | 'rejected'
  arbitrated_by: number | null
  arbitration_comment: string
  created_at: string
}

export interface Notification {
  id: number
  user_id: number
  type: 'review' | 'inspection' | 'complaint' | 'appeal' | 'refund'
  title: string
  content: string
  related_id: number | null
  related_type: string
  is_read: boolean
  created_at: string
}

export interface RefundRequest {
  id: number
  seller_id: number
  amount: number
  refundable_ratio: number
  calculation_detail: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  approved_by: number | null
  comment: string
  created_at: string
}

export interface MonthlyReport {
  id: number
  region: string
  month: number
  year: number
  seller_count: number
  inspection_pass_rate: number
  complaint_resolution_rate: number
  details: string
}

void new Date().toISOString()

let nextUserId = 11
let nextQualificationId = 5
let nextProductId = 11
let nextInspectionPlanId = 6
let nextInspectionReportId = 5
let nextCertificateId = 5
let nextComplaintId = 5
let nextAppealId = 4
let nextNotificationId = 20
let nextRefundRequestId = 4
let nextMonthlyReportId = 10

export const users: User[] = [
  { id: 1, username: 'seller1', password: '123456', role: 'seller', company_name: '深圳华强电子有限公司', reputation_score: 92, deposit_balance: 50000, deposit_frozen: 10000, status: 'active', region: '华东', created_at: '2025-01-15T08:00:00Z' },
  { id: 2, username: 'seller2', password: '123456', role: 'seller', company_name: '广州优品跨境电商', reputation_score: 78, deposit_balance: 30000, deposit_frozen: 5000, status: 'active', region: '华南', created_at: '2025-02-20T09:00:00Z' },
  { id: 3, username: 'seller3', password: '123456', role: 'seller', company_name: '义乌小商品批发中心', reputation_score: 65, deposit_balance: 20000, deposit_frozen: 8000, status: 'active', region: '华东', created_at: '2025-03-10T10:00:00Z' },
  { id: 4, username: 'reviewer1', password: '123456', role: 'reviewer', company_name: '平台审核部', reputation_score: 100, deposit_balance: 0, deposit_frozen: 0, status: 'active', region: '', created_at: '2025-01-01T00:00:00Z' },
  { id: 5, username: 'reviewer2', password: '123456', role: 'reviewer', company_name: '平台审核部', reputation_score: 100, deposit_balance: 0, deposit_frozen: 0, status: 'active', region: '', created_at: '2025-01-01T00:00:00Z' },
  { id: 6, username: 'inspector1', password: '123456', role: 'inspector', company_name: 'SGS质量检测中心', reputation_score: 100, deposit_balance: 0, deposit_frozen: 0, status: 'active', region: '华东', created_at: '2025-01-01T00:00:00Z' },
  { id: 7, username: 'inspector2', password: '123456', role: 'inspector', company_name: 'TUV南德检测', reputation_score: 100, deposit_balance: 0, deposit_frozen: 0, status: 'active', region: '华南', created_at: '2025-01-01T00:00:00Z' },
  { id: 8, username: 'ipowner1', password: '123456', role: 'ip_owner', company_name: '耐克知识产权部', reputation_score: 100, deposit_balance: 0, deposit_frozen: 0, status: 'active', region: '', created_at: '2025-01-01T00:00:00Z' },
  { id: 9, username: 'ipowner2', password: '123456', role: 'ip_owner', company_name: '迪士尼品牌保护', reputation_score: 100, deposit_balance: 0, deposit_frozen: 0, status: 'active', region: '', created_at: '2025-01-01T00:00:00Z' },
  { id: 10, username: 'finance1', password: '123456', role: 'finance', company_name: '平台财务部', reputation_score: 100, deposit_balance: 0, deposit_frozen: 0, status: 'active', region: '', created_at: '2025-01-01T00:00:00Z' },
]

export const qualifications: Qualification[] = [
  { id: 1, user_id: 1, documents: '营业执照、进出口许可证、税务登记证', verification_result: '企业信息匹配度95%', db_match_score: 0.95, status: 'approved', reviewed_by: 4, review_comment: '资质齐全，审核通过', created_at: '2025-01-16T10:00:00Z' },
  { id: 2, user_id: 2, documents: '营业执照、进出口许可证', verification_result: '企业信息匹配度82%', db_match_score: 0.82, status: 'approved', reviewed_by: 4, review_comment: '基本资质齐全', created_at: '2025-02-21T11:00:00Z' },
  { id: 3, user_id: 3, documents: '营业执照、税务登记证', verification_result: '企业信息匹配度58%', db_match_score: 0.58, status: 'approved', reviewed_by: 5, review_comment: '建议补充进出口许可证', created_at: '2025-03-11T12:00:00Z' },
  { id: 4, user_id: 0, documents: '', verification_result: '', db_match_score: 0, status: 'pending', reviewed_by: null, review_comment: '', created_at: '' },
]

export const products: Product[] = [
  { id: 1, seller_id: 1, title: '无线蓝牙耳机 Pro Max', description: '高品质无线蓝牙耳机，主动降噪，续航30小时', images: 'headphone1.jpg', category: '电子产品', price: 299.99, status: 'normal', infringement_flag: false, infringement_detail: '', complaint_rate: 0.02, created_at: '2025-02-01T08:00:00Z' },
  { id: 2, seller_id: 1, title: 'USB-C快充数据线1.5米', description: '100W快充数据线，兼容主流设备', images: 'cable1.jpg', category: '电子产品', price: 19.99, status: 'normal', infringement_flag: false, infringement_detail: '', complaint_rate: 0.01, created_at: '2025-02-05T09:00:00Z' },
  { id: 3, seller_id: 1, title: 'Nike运动鞋复刻版', description: '经典运动鞋复刻，舒适透气', images: 'shoe1.jpg', category: '鞋类', price: 89.99, status: 'locked', infringement_flag: true, infringement_detail: '标题和图片与Nike注册商标高度相似', complaint_rate: 0.15, created_at: '2025-03-01T10:00:00Z' },
  { id: 4, seller_id: 2, title: '儿童益智积木套装', description: '100片装，环保ABS材质，适合3岁+', images: 'toy1.jpg', category: '玩具', price: 39.99, status: 'warning', infringement_flag: false, infringement_detail: '', complaint_rate: 0.08, created_at: '2025-02-15T11:00:00Z' },
  { id: 5, seller_id: 2, title: 'Disney公主连衣裙', description: '迪士尼公主系列儿童连衣裙', images: 'dress1.jpg', category: '服装', price: 49.99, status: 'locked', infringement_flag: true, infringement_detail: '图片包含Disney版权角色形象', complaint_rate: 0.25, created_at: '2025-03-05T12:00:00Z' },
  { id: 6, seller_id: 2, title: '家用空气净化器', description: 'HEPA滤网，除甲醛PM2.5', images: 'purifier1.jpg', category: '家电', price: 199.99, status: 'normal', infringement_flag: false, infringement_detail: '', complaint_rate: 0.03, created_at: '2025-02-20T13:00:00Z' },
  { id: 7, seller_id: 3, title: '不锈钢保温杯500ml', description: '316不锈钢，12小时保温', images: 'cup1.jpg', category: '日用品', price: 29.99, status: 'normal', infringement_flag: false, infringement_detail: '', complaint_rate: 0.01, created_at: '2025-03-15T14:00:00Z' },
  { id: 8, seller_id: 3, title: 'LED台灯护眼学习灯', description: '无频闪，三档调光', images: 'lamp1.jpg', category: '家电', price: 59.99, status: 'delisted', infringement_flag: false, infringement_detail: '', complaint_rate: 0.12, created_at: '2025-03-20T15:00:00Z' },
  { id: 9, seller_id: 1, title: '便携式蓝牙音箱', description: 'IPX7防水，20小时续航', images: 'speaker1.jpg', category: '电子产品', price: 149.99, status: 'normal', infringement_flag: false, infringement_detail: '', complaint_rate: 0.02, created_at: '2025-04-01T08:00:00Z' },
  { id: 10, seller_id: 3, title: '竹纤维毛巾套装', description: '3条装，抗菌防螨', images: 'towel1.jpg', category: '日用品', price: 24.99, status: 'normal', infringement_flag: false, infringement_detail: '', complaint_rate: 0.01, created_at: '2025-04-05T09:00:00Z' },
]

export const inspectionPlans: InspectionPlan[] = [
  { id: 1, product_id: 1, inspector_id: 6, priority: 'normal', status: 'completed', assigned_at: '2025-03-01T08:00:00Z', completed_at: '2025-03-10T16:00:00Z', created_at: '2025-02-28T10:00:00Z' },
  { id: 2, product_id: 4, inspector_id: 7, priority: 'high', status: 'completed', assigned_at: '2025-03-10T08:00:00Z', completed_at: '2025-03-18T16:00:00Z', created_at: '2025-03-08T10:00:00Z' },
  { id: 3, product_id: 6, inspector_id: 6, priority: 'normal', status: 'assigned', assigned_at: '2025-04-01T08:00:00Z', completed_at: null, created_at: '2025-03-30T10:00:00Z' },
  { id: 4, product_id: 8, inspector_id: 7, priority: 'high', status: 'completed', assigned_at: '2025-04-05T08:00:00Z', completed_at: '2025-04-12T16:00:00Z', created_at: '2025-04-03T10:00:00Z' },
  { id: 5, product_id: 9, inspector_id: 6, priority: 'low', status: 'pending', assigned_at: null, completed_at: null, created_at: '2025-04-10T10:00:00Z' },
]

export const inspectionReports: InspectionReport[] = [
  { id: 1, plan_id: 1, inspector_id: 6, result: 'qualified', report_file: 'report_headphone_2025.pdf', photos: 'sample_headphone_1.jpg,sample_headphone_2.jpg', details: '耳机外观、音质、电池续航均符合标准，未发现有害物质超标', created_at: '2025-03-10T16:00:00Z' },
  { id: 2, plan_id: 2, inspector_id: 7, result: 'warning', report_file: 'report_toy_2025.pdf', photos: 'sample_toy_1.jpg,sample_toy_2.jpg', details: '积木边缘有小毛刺，建议改善；未发现有毒物质', created_at: '2025-03-18T16:00:00Z' },
  { id: 3, plan_id: 4, inspector_id: 7, result: 'unqualified', report_file: 'report_lamp_2025.pdf', photos: 'sample_lamp_1.jpg,sample_lamp_2.jpg', details: 'LED灯珠频闪超标，不符合护眼标准；电源线绝缘层厚度不足', created_at: '2025-04-12T16:00:00Z' },
  { id: 4, plan_id: 0, inspector_id: 0, result: 'qualified', report_file: '', photos: '', details: '', created_at: '' },
]

export const ipCertificates: IPCertificate[] = [
  { id: 1, owner_id: 8, type: 'trademark', document: 'nike_trademark_cn.pdf', description: 'Nike品牌中国区商标注册证', status: 'active', created_at: '2025-01-01T00:00:00Z' },
  { id: 2, owner_id: 8, type: 'trademark', document: 'nike_trademark_us.pdf', description: 'Nike品牌美国区商标注册证', status: 'active', created_at: '2025-01-01T00:00:00Z' },
  { id: 3, owner_id: 9, type: 'copyright', document: 'disney_copyright.pdf', description: '迪士尼公主系列著作权登记', status: 'active', created_at: '2025-01-01T00:00:00Z' },
  { id: 4, owner_id: 9, type: 'trademark', document: 'disney_trademark.pdf', description: 'Disney品牌商标注册证', status: 'active', created_at: '2025-01-01T00:00:00Z' },
]

export const complaints: Complaint[] = [
  { id: 1, certificate_id: 1, owner_id: 8, matched_products: '[3]', confirmed_products: '[3]', reason: '商标侵权', description: '商品标题和图片未经授权使用Nike注册商标，涉嫌商标侵权行为', status: 'notice_sent', created_at: '2025-03-02T08:00:00Z' },
  { id: 2, certificate_id: 3, owner_id: 9, matched_products: '[5]', confirmed_products: '[5]', reason: '著作权侵权', description: '未经授权使用迪士尼公主系列形象，侵犯著作权', status: 'appealed', created_at: '2025-03-06T08:00:00Z' },
  { id: 3, certificate_id: 2, owner_id: 8, matched_products: '[3,5]', confirmed_products: '[3]', reason: '商标侵权', description: '商品使用Nike美国区注册商标，涉嫌跨境商标侵权', status: 'resolved', created_at: '2025-03-15T08:00:00Z' },
  { id: 4, certificate_id: 0, owner_id: 0, matched_products: '', confirmed_products: '', reason: '', description: '', status: 'pending', created_at: '' },
]

export const appeals: Appeal[] = [
  { id: 1, complaint_id: 2, seller_id: 2, product_id: 5, reason: '已获得品牌授权', evidence: '授权经销合同、品牌授权书', description: '本商品已获得迪士尼中国区授权，为正品行货', status: 'under_review', arbitrated_by: null, arbitration_comment: '', created_at: '2025-03-08T10:00:00Z' },
  { id: 2, complaint_id: 3, seller_id: 1, product_id: 3, reason: '自主设计产品', evidence: 'OEM生产合同', description: '该鞋款为我司自主设计，不存在侵权', status: 'rejected', arbitrated_by: 4, arbitration_comment: '商品标题明确使用Nike字样，且无有效授权证明，申诉驳回', created_at: '2025-03-16T10:00:00Z' },
  { id: 3, complaint_id: 0, seller_id: 0, product_id: 0, reason: '', evidence: '', description: '', status: 'pending', arbitrated_by: null, arbitration_comment: '', created_at: '' },
]

export const notifications: Notification[] = [
  { id: 1, user_id: 1, type: 'review', title: '资质审核通过', content: '您的企业资质已通过审核，初始信誉评分为92分', related_id: 1, related_type: 'qualification', is_read: true, created_at: '2025-01-16T10:30:00Z' },
  { id: 2, user_id: 1, type: 'inspection', title: '商品抽检完成', content: '您的商品"无线蓝牙耳机 Pro Max"抽检结果为合格', related_id: 1, related_type: 'inspection', is_read: true, created_at: '2025-03-10T16:30:00Z' },
  { id: 3, user_id: 1, type: 'complaint', title: '侵权投诉通知', content: '您的商品"Nike运动鞋复刻版"收到知识产权投诉，商品已被锁定', related_id: 1, related_type: 'complaint', is_read: false, created_at: '2025-03-02T08:30:00Z' },
  { id: 4, user_id: 1, type: 'appeal', title: '申诉结果通知', content: '您对商品"Nike运动鞋复刻版"的申诉已被驳回', related_id: 2, related_type: 'appeal', is_read: false, created_at: '2025-03-17T09:00:00Z' },
  { id: 5, user_id: 2, type: 'review', title: '资质审核通过', content: '您的企业资质已通过审核，初始信誉评分为78分', related_id: 2, related_type: 'qualification', is_read: true, created_at: '2025-02-21T11:30:00Z' },
  { id: 6, user_id: 2, type: 'inspection', title: '商品抽检预警', content: '您的商品"儿童益智积木套装"抽检结果为预警，请关注', related_id: 2, related_type: 'inspection', is_read: true, created_at: '2025-03-18T16:30:00Z' },
  { id: 7, user_id: 2, type: 'complaint', title: '侵权投诉通知', content: '您的商品"Disney公主连衣裙"收到知识产权投诉，商品已被锁定', related_id: 2, related_type: 'complaint', is_read: false, created_at: '2025-03-06T08:30:00Z' },
  { id: 8, user_id: 3, type: 'review', title: '资质审核通过', content: '您的企业资质已通过审核，初始信誉评分为65分', related_id: 3, related_type: 'qualification', is_read: true, created_at: '2025-03-11T12:30:00Z' },
  { id: 9, user_id: 3, type: 'inspection', title: '商品抽检不合格', content: '您的商品"LED台灯护眼学习灯"抽检不合格，商品已强制下架', related_id: 3, related_type: 'inspection', is_read: false, created_at: '2025-04-12T17:00:00Z' },
  { id: 10, user_id: 4, type: 'review', title: '新资质待审核', content: '新卖家"义乌小商品批发中心"提交了企业资质，请审核', related_id: 3, related_type: 'qualification', is_read: true, created_at: '2025-03-11T12:05:00Z' },
  { id: 11, user_id: 4, type: 'complaint', title: '侵权复审待处理', content: '商品"Nike运动鞋复刻版"命中侵权库，请复审', related_id: 3, related_type: 'product', is_read: true, created_at: '2025-03-01T10:05:00Z' },
  { id: 12, user_id: 5, type: 'appeal', title: '申诉待仲裁', content: '卖家"广州优品"对投诉#2提起申诉，请仲裁', related_id: 1, related_type: 'appeal', is_read: false, created_at: '2025-03-08T10:05:00Z' },
  { id: 13, user_id: 6, type: 'inspection', title: '新抽检任务', content: '您有一个新的抽检任务：商品"家用空气净化器"', related_id: 3, related_type: 'inspection_plan', is_read: true, created_at: '2025-04-01T08:05:00Z' },
  { id: 14, user_id: 6, type: 'inspection', title: '新抽检任务', content: '您有一个新的抽检任务：商品"便携式蓝牙音箱"', related_id: 5, related_type: 'inspection_plan', is_read: false, created_at: '2025-04-10T10:05:00Z' },
  { id: 15, user_id: 7, type: 'inspection', title: '抽检任务完成确认', content: '商品"LED台灯护眼学习灯"检测报告已提交', related_id: 3, related_type: 'inspection_report', is_read: true, created_at: '2025-04-12T16:05:00Z' },
  { id: 16, user_id: 8, type: 'complaint', title: '投诉已受理', content: '您发起的投诉#1已被受理，下架通知已发送', related_id: 1, related_type: 'complaint', is_read: true, created_at: '2025-03-02T09:00:00Z' },
  { id: 17, user_id: 8, type: 'appeal', title: '卖家提起申诉', content: '投诉#2的卖家已提起申诉，请关注', related_id: 2, related_type: 'complaint', is_read: false, created_at: '2025-03-08T10:30:00Z' },
  { id: 18, user_id: 9, type: 'complaint', title: '卖家提起申诉', content: '投诉#2的卖家已提起申诉，请关注', related_id: 2, related_type: 'complaint', is_read: false, created_at: '2025-03-08T11:00:00Z' },
  { id: 19, user_id: 10, type: 'refund', title: '新退还申请', content: '卖家"深圳华强电子"提交了保证金退还申请', related_id: 1, related_type: 'refund', is_read: false, created_at: '2025-04-15T09:00:00Z' },
]

export const refundRequests: RefundRequest[] = [
  { id: 1, seller_id: 1, amount: 15000, refundable_ratio: 0.85, calculation_detail: '活跃度:95%,投诉率:2%,退货率:3%', status: 'pending', approved_by: null, comment: '', created_at: '2025-04-15T08:00:00Z' },
  { id: 2, seller_id: 2, amount: 10000, refundable_ratio: 0.72, calculation_detail: '活跃度:80%,投诉率:8%,退货率:5%', status: 'pending', approved_by: null, comment: '', created_at: '2025-04-16T08:00:00Z' },
  { id: 3, seller_id: 3, amount: 8000, refundable_ratio: 0.55, calculation_detail: '活跃度:60%,投诉率:12%,退货率:8%', status: 'approved', approved_by: 10, comment: '批准部分退还', created_at: '2025-04-10T08:00:00Z' },
]

export const monthlyReports: MonthlyReport[] = [
  { id: 1, region: '华东', month: 1, year: 2025, seller_count: 156, inspection_pass_rate: 0.92, complaint_resolution_rate: 0.88, details: '{"newSellers":23,"inspections":45,"complaints":12}' },
  { id: 2, region: '华南', month: 1, year: 2025, seller_count: 132, inspection_pass_rate: 0.89, complaint_resolution_rate: 0.85, details: '{"newSellers":18,"inspections":38,"complaints":15}' },
  { id: 3, region: '华北', month: 1, year: 2025, seller_count: 98, inspection_pass_rate: 0.94, complaint_resolution_rate: 0.91, details: '{"newSellers":12,"inspections":28,"complaints":8}' },
  { id: 4, region: '华东', month: 2, year: 2025, seller_count: 178, inspection_pass_rate: 0.91, complaint_resolution_rate: 0.90, details: '{"newSellers":22,"inspections":52,"complaints":10}' },
  { id: 5, region: '华南', month: 2, year: 2025, seller_count: 145, inspection_pass_rate: 0.87, complaint_resolution_rate: 0.87, details: '{"newSellers":13,"inspections":41,"complaints":18}' },
  { id: 6, region: '华北', month: 2, year: 2025, seller_count: 105, inspection_pass_rate: 0.93, complaint_resolution_rate: 0.92, details: '{"newSellers":7,"inspections":30,"complaints":6}' },
  { id: 7, region: '华东', month: 3, year: 2025, seller_count: 203, inspection_pass_rate: 0.90, complaint_resolution_rate: 0.89, details: '{"newSellers":25,"inspections":58,"complaints":14}' },
  { id: 8, region: '华南', month: 3, year: 2025, seller_count: 158, inspection_pass_rate: 0.86, complaint_resolution_rate: 0.84, details: '{"newSellers":13,"inspections":45,"complaints":20}' },
  { id: 9, region: '华北', month: 3, year: 2025, seller_count: 112, inspection_pass_rate: 0.95, complaint_resolution_rate: 0.93, details: '{"newSellers":7,"inspections":32,"complaints":5}' },
]

const infringementKeywords: Record<string, string[]> = {
  '鞋类': ['nike', 'adidas', 'jordan', 'air jordan', 'yeezy', 'puma', 'new balance'],
  '服装': ['gucci', 'louis vuitton', 'chanel', 'prada', 'hermes', 'dior', 'disney', '迪士尼'],
  '电子产品': ['apple', 'iphone', 'samsung galaxy'],
  '玩具': ['lego', '乐高', 'barbie', '芭比', 'disney', '迪士尼'],
  '家电': ['dyson', '戴森'],
}

export function getNextUserId() { return nextUserId++ }
export function getNextQualificationId() { return nextQualificationId++ }
export function getNextProductId() { return nextProductId++ }
export function getNextInspectionPlanId() { return nextInspectionPlanId++ }
export function getNextInspectionReportId() { return nextInspectionReportId++ }
export function getNextCertificateId() { return nextCertificateId++ }
export function getNextComplaintId() { return nextComplaintId++ }
export function getNextAppealId() { return nextAppealId++ }
export function getNextNotificationId() { return nextNotificationId++ }
export function getNextRefundRequestId() { return nextRefundRequestId++ }
export function getNextMonthlyReportId() { return nextMonthlyReportId++ }

export function checkInfringement(title: string, description: string, category: string): { flag: boolean, detail: string } {
  const keywords = infringementKeywords[category] || []
  const lowerTitle = title.toLowerCase()
  const lowerDesc = description.toLowerCase()
  for (const kw of keywords) {
    if (lowerTitle.includes(kw) || lowerDesc.includes(kw)) {
      return { flag: true, detail: `内容包含疑似侵权关键词"${kw}"，与已有侵权商品库冲突` }
    }
  }
  return { flag: false, detail: '' }
}

export function calculateRefundRatio(seller: User, products: Product[]): { ratio: number, detail: string } {
  const sellerProducts = products.filter(p => p.seller_id === seller.id)
  const activeProducts = sellerProducts.filter(p => p.status === 'normal').length
  const totalProducts = sellerProducts.length || 1
  const activityScore = activeProducts / totalProducts
  const avgComplaintRate = sellerProducts.reduce((sum, p) => sum + p.complaint_rate, 0) / (sellerProducts.length || 1)
  const complaintScore = Math.max(0, 1 - avgComplaintRate * 5)
  const reputationScore = seller.reputation_score / 100
  const ratio = Math.round((activityScore * 0.4 + complaintScore * 0.35 + reputationScore * 0.25) * 100) / 100
  const detail = `活跃度:${Math.round(activityScore * 100)}%,投诉率评分:${Math.round(complaintScore * 100)}%,信誉评分:${Math.round(reputationScore * 100)}%`
  return { ratio: Math.min(ratio, 1), detail }
}

export function matchInfringingProducts(certificateId: number): number[] {
  const cert = ipCertificates.find(c => c.id === certificateId)
  if (!cert) return []
  const matched: number[] = []
  const owner = users.find(u => u.id === cert.owner_id)
  void (owner?.company_name.toLowerCase() ?? '')
  for (const p of products) {
    if (p.status === 'delisted') continue
    const titleLower = p.title.toLowerCase()
    const descLower = p.description.toLowerCase()
    if (cert.type === 'trademark') {
      const brandNames = ['nike', 'adidas', 'disney', '迪士尼', 'gucci', 'chanel', 'prada', 'lego', '乐高']
      for (const bn of brandNames) {
        if (titleLower.includes(bn) || descLower.includes(bn)) {
          if (!matched.includes(p.id)) matched.push(p.id)
        }
      }
    } else if (cert.type === 'copyright') {
      if (titleLower.includes('disney') || titleLower.includes('迪士尼') || descLower.includes('disney') || descLower.includes('迪士尼') || titleLower.includes('公主') || descLower.includes('公主')) {
        if (!matched.includes(p.id)) matched.push(p.id)
      }
    }
  }
  return matched
}

export function addNotification(userId: number, type: Notification['type'], title: string, content: string, relatedId: number | null = null, relatedType: string = '') {
  notifications.push({
    id: nextNotificationId++,
    user_id: userId,
    type,
    title,
    content,
    related_id: relatedId,
    related_type: relatedType,
    is_read: false,
    created_at: new Date().toISOString(),
  })
}
