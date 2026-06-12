import { useState, useEffect } from 'react';
import { Wallet, Snowflake, CircleDollarSign, Send, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import StatusBadge from '@/components/StatusBadge';

interface RefundRecord {
  id: number;
  user_id: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  review_comment: string | null;
  created_at: string;
  updated_at: string;
}

interface DepositData {
  balance: number;
  frozen: number;
  available: number;
  refunds: RefundRecord[];
}

export default function SellerDeposit() {
  const user = useAuthStore((s) => s.user);
  const [depositData, setDepositData] = useState<DepositData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchDeposit = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/seller/deposit?user_id=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setDepositData(data.data);
      } else {
        setError(data.error || '加载保证金信息失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposit();
  }, [user?.id]);

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !refundAmount) return;
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      setSubmitError('请输入有效的退款金额');
      return;
    }
    const available = depositData?.available ?? (user ? user.deposit_balance - (user.deposit_frozen ?? 0) : 0);
    if (amount > available) {
      setSubmitError('退款金额不能超过可用余额');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const res = await fetch('/api/seller/deposit/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          amount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRefundAmount('');
        setSubmitSuccess(true);
        fetchDeposit();
      } else {
        setSubmitError(data.error || '提交退款申请失败');
      }
    } catch {
      setSubmitError('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">保证金管理</h1>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald/30 border-t-emerald rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">保证金管理</h1>
        <div className="card text-center py-10">
          <p className="text-coral">{error}</p>
          <button className="btn-primary mt-4" onClick={fetchDeposit}>
            重新加载
          </button>
        </div>
      </div>
    );
  }

  const balance = depositData?.balance ?? user?.deposit_balance ?? 0;
  const frozen = depositData?.frozen ?? user?.deposit_frozen ?? 0;
  const available = depositData?.available ?? balance - frozen;
  const refunds = depositData?.refunds ?? [];

  const maxVal = Math.max(balance, frozen, available, 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">保证金管理</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate">保证金余额</p>
              <p className="text-xl font-bold text-gray-900">¥{balance.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-amber" />
            </div>
            <div>
              <p className="text-sm text-slate">冻结金额</p>
              <p className="text-xl font-bold text-amber">¥{frozen.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald/10 flex items-center justify-center">
              <CircleDollarSign className="w-5 h-5 text-emerald" />
            </div>
            <div>
              <p className="text-sm text-slate">可用余额</p>
              <p className="text-xl font-bold text-emerald">¥{available.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">资金分布</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">可用余额</span>
              <span className="text-sm font-medium text-emerald">¥{available.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-6">
              <div
                className="h-6 rounded-full bg-emerald transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${Math.max((available / maxVal) * 100, 2)}%` }}
              >
                {available / maxVal > 0.15 && (
                  <span className="text-xs text-white font-medium">
                    {((available / balance) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">冻结金额</span>
              <span className="text-sm font-medium text-amber">¥{frozen.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-6">
              <div
                className="h-6 rounded-full bg-amber transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${Math.max((frozen / maxVal) * 100, 2)}%` }}
              >
                {frozen / maxVal > 0.15 && (
                  <span className="text-xs text-white font-medium">
                    {((frozen / balance) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">申请退款</h2>
          {submitSuccess && (
            <div className="mb-4 p-3 bg-emerald/10 text-emerald rounded-lg text-sm">
              退款申请已提交，请等待审核
            </div>
          )}
          <form onSubmit={handleRefund} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">退款金额（元）</label>
              <input
                type="number"
                className="input-field"
                placeholder={`最多可退 ¥${available.toFixed(2)}`}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                min="0.01"
                step="0.01"
                max={available}
                required
              />
              <p className="text-xs text-slate mt-1">
                可用余额：¥{available.toFixed(2)}
              </p>
            </div>
            {submitError && <p className="text-sm text-coral">{submitError}</p>}
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={submitting || available <= 0}
            >
              <Send className="w-4 h-4" />
              {submitting ? '提交中...' : '提交退款申请'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-slate" />
            <h2 className="text-lg font-semibold text-gray-900">退款记录</h2>
          </div>
          {refunds.length === 0 ? (
            <p className="text-slate text-sm py-8 text-center">暂无退款记录</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-slate font-medium">ID</th>
                    <th className="text-left py-2 text-slate font-medium">金额</th>
                    <th className="text-left py-2 text-slate font-medium">状态</th>
                    <th className="text-left py-2 text-slate font-medium">申请时间</th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 text-gray-900">#{r.id}</td>
                      <td className="py-2.5 text-gray-900">¥{r.amount.toFixed(2)}</td>
                      <td className="py-2.5">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-2.5 text-gray-600">
                        {new Date(r.created_at).toLocaleDateString('zh-CN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
