import { useState, useEffect, useCallback } from 'react';
import { ClipboardCheck, CheckCircle, XCircle, Loader2, Building2, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import StatusBadge from '@/components/StatusBadge';

interface Qualification {
  id: number;
  seller_id: number;
  seller_name: string;
  company_name: string;
  qualification_type: string;
  status: string;
  documents: string[];
  db_match_score: number;
  verification_result: string;
  region: string;
  submitted_at: string;
}

export default function ReviewerQualificationReview() {
  const { user } = useAuthStore();
  const [queue, setQueue] = useState<Qualification[]>([]);
  const [selected, setSelected] = useState<Qualification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reviewer/qualification-queue');
      const data = await res.json();
      if (data.success) {
        setQueue(data.data);
        if (data.data.length > 0 && !selected) {
          setSelected(data.data[0]);
        }
      } else {
        setError(data.error || '获取队列失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleReview = async (action: 'approved' | 'rejected') => {
    if (!selected) return;
    try {
      setSubmitting(true);
      const res = await fetch('/api/reviewer/review/qualification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qualification_id: selected.id,
          reviewer_id: user?.id,
          action,
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQueue((prev) => prev.filter((q) => q.id !== selected.id));
        const remaining = queue.filter((q) => q.id !== selected.id);
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
        <h1 className="text-2xl font-bold text-gray-900">资质审核</h1>
        <div className="card text-coral">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">资质审核</h1>
        <p className="text-slate mt-1">审核商家提交的资质申请，查看文件与数据库匹配结果</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">审核队列</h2>
              <span className="text-xs bg-amber/10 text-amber px-2.5 py-1 rounded-full font-medium">
                {queue.length} 条待审核
              </span>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {queue.length === 0 ? (
                <p className="text-sm text-slate text-center py-8">暂无待审核资质</p>
              ) : (
                queue.map((q) => (
                  <div
                    key={q.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selected?.id === q.id
                        ? 'border-emerald bg-emerald/5'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                    onClick={() => setSelected(q)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {q.company_name}
                      </span>
                      <StatusBadge status="pending" />
                    </div>
                    <p className="text-xs text-slate mt-1">{q.qualification_type}</p>
                    <p className="text-xs text-slate mt-0.5">提交于 {q.submitted_at}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-4">资质详情</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate mb-1">企业名称</p>
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-gray-400" />
                        <p className="text-sm font-medium text-gray-900">{selected.company_name}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate mb-1">商家</p>
                      <p className="text-sm text-gray-900">{selected.seller_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate mb-1">资质类型</p>
                      <p className="text-sm text-gray-900">{selected.qualification_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate mb-1">地区</p>
                      <p className="text-sm text-gray-900">{selected.region}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate mb-1">数据库匹配分数</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              selected.db_match_score >= 80
                                ? 'bg-emerald'
                                : selected.db_match_score >= 50
                                ? 'bg-amber'
                                : 'bg-coral'
                            }`}
                            style={{ width: `${selected.db_match_score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{selected.db_match_score}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate mb-1">验证结果</p>
                      <p className="text-sm text-gray-900">{selected.verification_result}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate mb-1">提交时间</p>
                      <p className="text-sm text-gray-900">{selected.submitted_at}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={18} className="text-gray-400" />
                  <h3 className="font-semibold text-gray-900">提交文件</h3>
                </div>
                <div className="space-y-2">
                  {selected.documents.length === 0 ? (
                    <p className="text-sm text-slate">暂无文件</p>
                  ) : (
                    selected.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-emerald" />
                          <span className="text-sm text-gray-900">{doc}</span>
                        </div>
                        <a
                          href={`/api/files/${doc}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald hover:underline"
                        >
                          查看
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">审核操作</h3>
                <textarea
                  className="input-field mb-4"
                  rows={3}
                  placeholder="请输入审核意见（可选）"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex gap-3">
                  <button
                    className="btn-primary flex items-center gap-2"
                    onClick={() => handleReview('approved')}
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    通过
                  </button>
                  <button
                    className="btn-danger flex items-center gap-2"
                    onClick={() => handleReview('rejected')}
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                    驳回
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-16">
              <ClipboardCheck size={48} className="text-gray-300 mb-3" />
              <p className="text-slate">请从左侧队列选择一条资质进行审核</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
