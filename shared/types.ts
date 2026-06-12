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
  status: 'pending' | 'confirmed' | 'notice_sent' | 'appealed' | 'resolved' | 'dismissed'
  created_at: string
}

export interface Appeal {
  id: number
  complaint_id: number
  seller_id: number
  product_id: number
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
