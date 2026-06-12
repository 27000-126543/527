import { useState, useEffect } from 'react';
import { Check, X, Loader2, Receipt } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface RefundRequest {
  id: number;
  seller_name: string;
  amount: number;
  refundable_ratio: number;
  calculation_detail: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  created_at: string;
}

export default function FinanceRefundApproval() {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, string>>({});

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/finance/refund-requests');
      const data = await res.json();
      if (data.success) {
        setRequests(data.data ?? []);
      } else {
        setError(data.error || '获取退还申请失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setActionId(id);
    setError(null);
    try {
      const res = await fetch(`/api/finance/refund-requests/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: comments[id] ?? '' }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        fetchRequests();
      } else {
        setError(data.error || '操作失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setActionId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const processedRequests = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">保证金退还审批</h1>

      {error && <div className="bg-coral/10 text-coral px-4 py-3 rounded-lg text-sm">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">待审批</h2>
              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="card border-l-4 border-l-amber">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{req.seller_name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          申请时间: {new Date(req.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">退还金额</p>
                        <p className="text-lg font-bold text-gray-900">¥{req.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">可退比例</p>
                        <p className="text-lg font-bold text-amber">{(req.refundable_ratio * 100).toFixed(1)}%</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-gray-500">计算详情</p>
                        <p className="text-sm text-gray-700">{req.calculation_detail}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs text-gray-500 mb-1">审批意见</label>
                      <textarea
                        value={comments[req.id] ?? ''}
                        onChange={(e) => setComments((prev) => ({ ...prev, [req.id]: e.target.value }))}
                        className="input-field min-h-[60px] resize-y text-sm"
                        placeholder="请输入审批意见（可选）"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction(req.id, 'approve')}
                        disabled={actionId === req.id}
                        className="btn-primary flex items-center gap-2 text-sm"
                      >
                        {actionId === req.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        批准
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'reject')}
                        disabled={actionId === req.id}
                        className="btn-danger flex items-center gap-2 text-sm"
                      >
                        <X size={14} />
                        驳回
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {processedRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">已处理</h2>
              <div className="card overflow-hidden p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">卖家</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">金额</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">可退比例</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">状态</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">意见</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedRequests.map((req) => (
                      <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{req.seller_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">¥{req.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{(req.refundable_ratio * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">{req.comment ?? '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(req.created_at).toLocaleDateString('zh-CN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {requests.length === 0 && (
            <div className="card text-center py-12">
              <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">暂无退还申请</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
