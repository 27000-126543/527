import { useState, useEffect } from 'react';
import { MessageSquare, Send, X, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import StatusBadge from '@/components/StatusBadge';

interface Appeal {
  id: number;
  user_id: number;
  product_id: number;
  product_title: string;
  complaint_id: number;
  description: string;
  evidence: string;
  status: 'pending' | 'approved' | 'rejected' | 'upheld';
  review_comment: string | null;
  created_at: string;
  updated_at: string;
}

interface LockedProduct {
  id: number;
  title: string;
  status: string;
}

export default function SellerAppeals() {
  const user = useAuthStore((s) => s.user);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [lockedProducts, setLockedProducts] = useState<LockedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);

  const [form, setForm] = useState({
    product_id: '',
    evidence: '',
    description: '',
  });

  const fetchAppeals = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [appealsRes, productsRes] = await Promise.all([
        fetch(`/api/seller/appeals?user_id=${user.id}`),
        fetch(`/api/seller/products?user_id=${user.id}`),
      ]);
      const appealsData = await appealsRes.json();
      const productsData = await productsRes.json();
      if (appealsData.success) {
        setAppeals(appealsData.data ?? []);
      }
      if (productsData.success) {
        const prods: LockedProduct[] = (productsData.data ?? [])
          .filter((p: Record<string, unknown>) => p.status === 'locked' || p.status === 'delisted')
          .map((p: Record<string, unknown>) => ({ id: p.id as number, title: p.title as string, status: p.status as string }));
        setLockedProducts(prods);
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !form.product_id) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const res = await fetch('/api/seller/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          product_id: parseInt(form.product_id),
          evidence: form.evidence,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setForm({ product_id: '', evidence: '', description: '' });
        setSubmitSuccess(true);
        fetchAppeals();
      } else {
        setSubmitError(data.error || '提交申诉失败');
      }
    } catch {
      setSubmitError('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const getTimelineSteps = (appeal: Appeal) => {
    const steps = [
      {
        label: '提交申诉',
        time: appeal.created_at,
        icon: MessageSquare,
        done: true,
        color: 'text-emerald',
        bg: 'bg-emerald',
      },
      {
        label: '审核中',
        time: appeal.status !== 'pending' ? appeal.updated_at : null,
        icon: Clock,
        done: appeal.status !== 'pending',
        color: appeal.status !== 'pending' ? 'text-emerald' : 'text-amber',
        bg: appeal.status !== 'pending' ? 'bg-emerald' : 'bg-amber',
      },
      {
        label: appeal.status === 'approved' || appeal.status === 'upheld' ? '申诉通过' : '申诉结果',
        time: appeal.status !== 'pending' ? appeal.updated_at : null,
        icon:
          appeal.status === 'approved' || appeal.status === 'upheld'
            ? CheckCircle
            : appeal.status === 'rejected'
              ? XCircle
              : AlertCircle,
        done: appeal.status !== 'pending',
        color:
          appeal.status === 'approved' || appeal.status === 'upheld'
            ? 'text-emerald'
            : appeal.status === 'rejected'
              ? 'text-coral'
              : 'text-slate',
        bg:
          appeal.status === 'approved' || appeal.status === 'upheld'
            ? 'bg-emerald'
            : appeal.status === 'rejected'
              ? 'bg-coral'
              : 'bg-gray-300',
      },
    ];
    return steps;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">申诉中心</h1>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald/30 border-t-emerald rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">申诉中心</h1>
        <div className="card text-center py-10">
          <p className="text-coral">{error}</p>
          <button className="btn-primary mt-4" onClick={fetchAppeals}>
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">申诉中心</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <MessageSquare className="w-4 h-4" />
          提交申诉
        </button>
      </div>

      {submitSuccess && (
        <div className="p-3 bg-emerald/10 text-emerald rounded-lg text-sm card">
          申诉提交成功，请等待审核
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">申诉列表</h2>
        {appeals.length === 0 ? (
          <p className="text-slate text-sm py-8 text-center">暂无申诉记录</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-slate font-medium">投诉ID</th>
                  <th className="text-left py-2 text-slate font-medium">商品名称</th>
                  <th className="text-left py-2 text-slate font-medium">申诉内容</th>
                  <th className="text-left py-2 text-slate font-medium">申诉状态</th>
                  <th className="text-left py-2 text-slate font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {appeals.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-gray-900">#{a.complaint_id}</td>
                    <td className="py-2.5 text-gray-900">{a.product_title}</td>
                    <td className="py-2.5 text-gray-600 max-w-[200px] truncate">{a.description}</td>
                    <td className="py-2.5">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-2.5">
                      <button
                        className="text-sm text-emerald hover:text-green-600 font-medium"
                        onClick={() => setSelectedAppeal(a)}
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedAppeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">申诉详情</h3>
              <button
                onClick={() => setSelectedAppeal(null)}
                className="text-slate hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate">申诉ID：</span>
                  <span className="text-gray-900">#{selectedAppeal.id}</span>
                </div>
                <div>
                  <span className="text-slate">投诉ID：</span>
                  <span className="text-gray-900">#{selectedAppeal.complaint_id}</span>
                </div>
                <div>
                  <span className="text-slate">商品名称：</span>
                  <span className="text-gray-900">{selectedAppeal.product_title}</span>
                </div>
                <div>
                  <span className="text-slate">状态：</span>
                  <StatusBadge status={selectedAppeal.status} />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate mb-1">申诉内容</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedAppeal.description}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate mb-1">证据材料</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedAppeal.evidence || '无'}
                </p>
              </div>
              {selectedAppeal.review_comment && (
                <div className="p-3 bg-amber/5 border border-amber/20 rounded-lg">
                  <p className="text-sm text-slate">审核意见：</p>
                  <p className="text-sm text-gray-700 mt-1">{selectedAppeal.review_comment}</p>
                </div>
              )}

              <div className="pt-2">
                <p className="text-sm font-medium text-gray-900 mb-3">申诉进度</p>
                <div className="space-y-0">
                  {getTimelineSteps(selectedAppeal).map((step, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            step.done ? step.bg : 'bg-gray-200'
                          }`}
                        >
                          <step.icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        {idx < getTimelineSteps(selectedAppeal).length - 1 && (
                          <div
                            className={`w-0.5 h-8 ${step.done ? 'bg-emerald' : 'bg-gray-200'}`}
                          />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className={`text-sm font-medium ${step.done ? 'text-gray-900' : 'text-slate'}`}>
                          {step.label}
                        </p>
                        {step.time && (
                          <p className="text-xs text-slate mt-0.5">
                            {new Date(step.time).toLocaleString('zh-CN')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="btn-secondary" onClick={() => setSelectedAppeal(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">提交申诉</h3>
              <button onClick={() => setShowForm(false)} className="text-slate hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择商品</label>
                <select
                  className="input-field"
                  value={form.product_id}
                  onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                  required
                >
                  <option value="">请选择被锁定/下架的商品</option>
                  {lockedProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}（{p.status === 'locked' ? '已锁定' : '已下架'}）
                    </option>
                  ))}
                </select>
                {lockedProducts.length === 0 && (
                  <p className="text-xs text-slate mt-1">暂无可申诉的商品</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">证据材料</label>
                <textarea
                  className="input-field min-h-[80px] resize-y"
                  placeholder="请输入您的证据材料描述"
                  value={form.evidence}
                  onChange={(e) => setForm({ ...form, evidence: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">申诉说明</label>
                <textarea
                  className="input-field min-h-[80px] resize-y"
                  placeholder="请详细描述您的申诉理由"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              {submitError && <p className="text-sm text-coral">{submitError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  取消
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  disabled={submitting || lockedProducts.length === 0}
                >
                  <Send className="w-4 h-4" />
                  {submitting ? '提交中...' : '提交申诉'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
