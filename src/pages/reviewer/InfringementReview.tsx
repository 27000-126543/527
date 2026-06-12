import { useState, useEffect } from 'react';
import { ShieldAlert, Lock, Unlock, Loader2, Package, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import StatusBadge from '@/components/StatusBadge';

interface InfringementProduct {
  id: number;
  product_id: number;
  title: string;
  description: string;
  category: string;
  infringement_flag: boolean;
  infringement_detail: string;
  status: string;
  seller_name: string;
  flagged_at: string;
}

export default function ReviewerInfringementReview() {
  const { user } = useAuthStore();
  const [queue, setQueue] = useState<InfringementProduct[]>([]);
  const [selected, setSelected] = useState<InfringementProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/reviewer/infringement-queue');
        const data = await res.json();
        if (data.success) {
          setQueue(data.data);
          if (data.data.length > 0) {
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
    };
    fetchQueue();
  }, []);

  const handleReview = async (action: 'confirm' | 'dismiss') => {
    if (!selected) return;
    try {
      setSubmitting(true);
      const res = await fetch('/api/reviewer/review/infringement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selected.product_id,
          infringement_id: selected.id,
          reviewer_id: user?.id,
          action,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQueue((prev) => prev.filter((p) => p.id !== selected.id));
        const remaining = queue.filter((p) => p.id !== selected.id);
        setSelected(remaining.length > 0 ? remaining[0] : null);
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
        <h1 className="text-2xl font-bold text-gray-900">侵权复审</h1>
        <div className="card text-coral">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">侵权复审</h1>
        <p className="text-slate mt-1">处理被标记的侵权商品，确认或解除侵权锁定</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">侵权商品队列</h2>
              <span className="text-xs bg-coral/10 text-coral px-2.5 py-1 rounded-full font-medium">
                {queue.length} 条待复审
              </span>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {queue.length === 0 ? (
                <p className="text-sm text-slate text-center py-8">暂无待复审商品</p>
              ) : (
                queue.map((p) => (
                  <div
                    key={p.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selected?.id === p.id
                        ? 'border-coral bg-coral/5'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                    onClick={() => setSelected(p)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                        {p.title}
                      </span>
                      <StatusBadge status="locked" />
                    </div>
                    <p className="text-xs text-slate mt-1">{p.category}</p>
                    <p className="text-xs text-slate mt-0.5">标记于 {p.flagged_at}</p>
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
                <h2 className="font-semibold text-gray-900 mb-4">商品详情</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate mb-1">商品名称</p>
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" />
                        <p className="text-sm font-medium text-gray-900">{selected.title}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate mb-1">商家</p>
                      <p className="text-sm text-gray-900">{selected.seller_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate mb-1">分类</p>
                      <p className="text-sm text-gray-900">{selected.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate mb-1">标记时间</p>
                      <p className="text-sm text-gray-900">{selected.flagged_at}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate mb-1">商品描述</p>
                      <p className="text-sm text-gray-900 leading-relaxed">{selected.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-l-4 border-coral">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={18} className="text-coral" />
                  <h3 className="font-semibold text-gray-900">侵权详情</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{selected.infringement_detail}</p>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">复审操作</h3>
                <p className="text-sm text-slate mb-4">
                  请根据侵权详情判断该商品是否构成侵权。确认侵权将保持商品锁定状态，解除锁定将恢复商品正常状态。
                </p>
                <div className="flex gap-3">
                  <button
                    className="btn-danger flex items-center gap-2"
                    onClick={() => handleReview('confirm')}
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                    确认侵权
                  </button>
                  <button
                    className="btn-secondary flex items-center gap-2"
                    onClick={() => handleReview('dismiss')}
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Unlock size={16} />}
                    解除锁定
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-16">
              <ShieldAlert size={48} className="text-gray-300 mb-3" />
              <p className="text-slate">请从左侧队列选择一条侵权商品进行复审</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
