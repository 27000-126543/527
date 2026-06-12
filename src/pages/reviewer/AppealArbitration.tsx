import { useState, useEffect } from 'react';
import { Gavel, CheckCircle, XCircle, Loader2, Scale, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import StatusBadge from '@/components/StatusBadge';

interface Appeal {
  id: number;
  seller_id: number;
  seller_name: string;
  complaint_id: number;
  complaint_reason: string;
  complaint_detail: string;
  appeal_reason: string;
  appeal_description: string;
  evidence: string[];
  status: string;
  created_at: string;
  product_title: string;
}

export default function ReviewerAppealArbitration() {
  const { user } = useAuthStore();
  const [queue, setQueue] = useState<Appeal[]>([]);
  const [selected, setSelected] = useState<Appeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/reviewer/appeal-queue');
        const data = await res.json();
        if (data.success) {
          const normalized = data.data.map((a: Appeal) => ({
            ...a,
            evidence: Array.isArray(a.evidence) ? a.evidence : (a.evidence ? String(a.evidence).split(/[、,]/).filter(Boolean) : []),
          }));
          setQueue(normalized);
          if (normalized.length > 0) {
            setSelected(normalized[0]);
          }
        } else {
          setError(data.error || '获取队列失败');
        }
      } catch {
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const handleArbitrate = async (action: 'upheld' | 'rejected') => {
    if (!selected) return;
    if (!comment.trim()) {
      alert('请输入仲裁意见');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch('/api/reviewer/arbitrate/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appeal_id: selected.id,
          reviewer_id: user?.id,
          action,
          arbitration_comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQueue((prev) => prev.filter((a) => a.id !== selected.id));
        const remaining = queue.filter((a) => a.id !== selected.id);
        setSelected(remaining.length > 0 ? remaining[0] : null);
        setComment('');
      } else {
        alert(data.error || '操作失败');
      }
    } catch {
      alert('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && queue.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald" />
      </div>
    );
  }

  if (error && queue.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">申诉仲裁</h1>
        <div className="card text-coral">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">申诉仲裁</h1>
        <p className="text-slate mt-1">处理商家申诉案件，维持或驳回原处罚决定</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">申诉队列</h2>
              <span className="text-xs bg-deepSea/10 text-deepSea px-2.5 py-1 rounded-full font-medium">
                {queue.length} 条待仲裁
              </span>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {queue.length === 0 ? (
                <p className="text-sm text-slate text-center py-8">暂无待仲裁申诉</p>
              ) : (
                queue.map((a) => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selected?.id === a.id
                        ? 'border-deepSea bg-deepSea/5'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                    onClick={() => setSelected(a)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                        {a.seller_name}
                      </span>
                      <StatusBadge status={a.status as 'pending' | 'warning'} />
                    </div>
                    <p className="text-xs text-slate mt-1 truncate">{a.product_title}</p>
                    <p className="text-xs text-slate mt-0.5">提交于 {a.created_at}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <div className="card border-l-4 border-coral">
                <div className="flex items-center gap-2 mb-3">
                  <Scale size={18} className="text-coral" />
                  <h3 className="font-semibold text-gray-900">投诉信息</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate mb-1">投诉原因</p>
                    <p className="text-sm text-gray-900">{selected.complaint_reason}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate mb-1">涉及商品</p>
                    <p className="text-sm text-gray-900">{selected.product_title}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-slate mb-1">投诉详情</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selected.complaint_detail}</p>
                </div>
              </div>

              <div className="card border-l-4 border-emerald">
                <div className="flex items-center gap-2 mb-3">
                  <Gavel size={18} className="text-emerald" />
                  <h3 className="font-semibold text-gray-900">商家申诉</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate mb-1">申诉商家</p>
                    <p className="text-sm text-gray-900">{selected.seller_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate mb-1">申诉原因</p>
                    <p className="text-sm text-gray-900">{selected.appeal_reason}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate mb-1">申诉描述</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.appeal_description}</p>
                  </div>
                  {selected.evidence.length > 0 && (
                    <div>
                      <p className="text-xs text-slate mb-2">申诉证据</p>
                      <div className="space-y-2">
                        {selected.evidence.map((ev, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <FileText size={14} className="text-emerald" />
                            <span className="text-sm text-gray-900">{ev}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">仲裁操作</h3>
                <p className="text-sm text-slate mb-4">
                  维持申诉将支持商家立场，驳回申诉将维持原处罚决定。请填写仲裁意见。
                </p>
                <textarea
                  className="input-field mb-4"
                  rows={3}
                  placeholder="请输入仲裁意见（必填）"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex gap-3">
                  <button
                    className="btn-primary flex items-center gap-2"
                    onClick={() => handleArbitrate('upheld')}
                    disabled={submitting || !comment.trim()}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    维持申诉
                  </button>
                  <button
                    className="btn-danger flex items-center gap-2"
                    onClick={() => handleArbitrate('rejected')}
                    disabled={submitting || !comment.trim()}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                    驳回申诉
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-16">
              <Gavel size={48} className="text-gray-300 mb-3" />
              <p className="text-slate">请从左侧队列选择一条申诉进行仲裁</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
