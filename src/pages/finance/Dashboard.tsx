import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, CheckCircle, UserPlus, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface FinanceStats {
  pending_refunds: number;
  approved_refunds: number;
  new_sellers_this_month: number;
}

export default function FinanceDashboard() {
  useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<FinanceStats>({
    pending_refunds: 0,
    approved_refunds: 0,
    new_sellers_this_month: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/finance/refund-requests');
        const data = await res.json();
        if (data.success) {
          const refunds: Array<{ status: string }> = data.data ?? [];
          setStats((prev) => ({
            ...prev,
            pending_refunds: refunds.filter((r) => r.status === 'pending').length,
            approved_refunds: refunds.filter((r) => r.status === 'approved').length,
          }));
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: '待审批退还申请', value: stats.pending_refunds, icon: Receipt, color: 'bg-amber/10 text-amber' },
    { label: '已审批退还', value: stats.approved_refunds, icon: CheckCircle, color: 'bg-emerald/10 text-emerald' },
    { label: '本月新增卖家', value: stats.new_sellers_this_month, icon: UserPlus, color: 'bg-blue-500/10 text-blue-600' },
  ];

  const quickLinks = [
    { label: '退还审批', path: '/finance/refund-approval', icon: Receipt },
    { label: '运营报表', path: '/finance/reports', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">财务仪表盘</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="card flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷入口</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-emerald hover:bg-emerald/5 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className="text-gray-500 group-hover:text-emerald" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-emerald">{link.label}</span>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-emerald" />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
