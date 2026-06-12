import { useState, useEffect } from 'react';
import { FileCheck, Send, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import StatusBadge from '@/components/StatusBadge';

interface Qualification {
  id: number;
  user_id: number;
  company_documents: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'revoked';
  review_comment: string | null;
  created_at: string;
  updated_at: string;
}

export default function SellerQualification() {
  const user = useAuthStore((s) => s.user);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchQualifications = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/seller/qualifications?user_id=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setQualifications(data.data ?? []);
      } else {
        setError(data.error || '加载资质信息失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualifications();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !documents.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const res = await fetch('/api/seller/qualification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          company_documents: documents.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDocuments('');
        setSubmitSuccess(true);
        fetchQualifications();
      } else {
        setSubmitError(data.error || '提交失败');
      }
    } catch {
      setSubmitError('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const currentQual = qualifications.length > 0 ? qualifications[0] : null;
  const currentStatus = currentQual?.status ?? null;

  const statusDisplay: Record<string, { label: string; desc: string; color: string }> = {
    approved: { label: '已认证', desc: '您的商家资质已通过审核', color: 'text-emerald' },
    qualified: { label: '合格', desc: '您的商家资质已通过审核', color: 'text-emerald' },
    pending: { label: '审核中', desc: '您的资质申请正在审核中，请耐心等待', color: 'text-amber' },
    rejected: { label: '已驳回', desc: '您的资质申请未通过审核，请修改后重新提交', color: 'text-coral' },
    unqualified: { label: '未认证', desc: '您尚未提交资质认证，请提交相关材料', color: 'text-slate' },
    expired: { label: '已过期', desc: '您的资质认证已过期，请重新提交', color: 'text-gray-500' },
    revoked: { label: '已撤销', desc: '您的资质认证已被撤销', color: 'text-coral' },
  };

  const display = currentStatus ? statusDisplay[currentStatus] ?? statusDisplay.unqualified : statusDisplay.unqualified;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">资质管理</h1>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald/30 border-t-emerald rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">资质管理</h1>
        <div className="card text-center py-10">
          <p className="text-coral">{error}</p>
          <button className="btn-primary mt-4" onClick={fetchQualifications}>
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">资质管理</h1>

      <div className="card">
        <div className="flex items-center gap-3 mb-2">
          <FileCheck className={`w-6 h-6 ${display.color}`} />
          <h2 className="text-lg font-semibold text-gray-900">当前资质状态</h2>
        </div>
        <div className="mt-3 flex items-center gap-3">
          {currentStatus ? (
            <StatusBadge status={currentStatus} />
          ) : (
            <span className="text-slate text-sm">未提交</span>
          )}
          <p className={`text-sm ${display.color}`}>{display.desc}</p>
        </div>
        {currentQual?.review_comment && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber mt-0.5 shrink-0" />
            <p className="text-sm text-gray-600">审核意见：{currentQual.review_comment}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">提交资质认证</h2>
        {submitSuccess && (
          <div className="mb-4 p-3 bg-emerald/10 text-emerald rounded-lg text-sm">
            资质认证提交成功，请等待审核
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">公司资质文件</label>
            <textarea
              className="input-field min-h-[120px] resize-y"
              placeholder="请输入公司资质文件信息，如营业执照编号、经营范围等"
              value={documents}
              onChange={(e) => setDocuments(e.target.value)}
              required
            />
          </div>
          {submitError && <p className="text-sm text-coral">{submitError}</p>}
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={submitting}>
            <Send className="w-4 h-4" />
            {submitting ? '提交中...' : '提交认证'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-slate" />
          <h2 className="text-lg font-semibold text-gray-900">资质历史</h2>
        </div>
        {qualifications.length === 0 ? (
          <p className="text-slate text-sm py-4 text-center">暂无资质记录</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-slate font-medium">ID</th>
                  <th className="text-left py-2 text-slate font-medium">提交时间</th>
                  <th className="text-left py-2 text-slate font-medium">状态</th>
                  <th className="text-left py-2 text-slate font-medium">审核意见</th>
                </tr>
              </thead>
              <tbody>
                {qualifications.map((q) => (
                  <tr key={q.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-gray-900">#{q.id}</td>
                    <td className="py-2.5 text-gray-600">
                      {new Date(q.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="py-2.5 text-gray-600">
                      {q.review_comment || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
