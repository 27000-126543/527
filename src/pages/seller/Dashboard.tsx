import { useState, useEffect } from 'react';
import { ShieldCheck, Package, ClipboardList, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useNotificationStore } from '@/store/notification';
import StatusBadge, { StatusType } from '@/components/StatusBadge';

interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  status: string;
  infringement_flagged: boolean;
}

interface DashboardStats {
  total_products: number;
  pending_items: number;
}

export default function SellerDashboard() {
  const user = useAuthStore((s) => s.user);
  const { notifications, unreadCount, fetchNotifications } = useNotificationStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsRes, statsRes] = await Promise.all([
          fetch(`/api/seller/products?user_id=${user.id}`),
          fetch(`/api/seller/dashboard?user_id=${user.id}`),
        ]);
        const productsData = await productsRes.json();
        const statsData = await statsRes.json();
        if (productsData.success) {
          setProducts((productsData.data ?? []).slice(0, 5));
        }
        if (statsData.success) {
          setStats(statsData.data);
        }
      } catch {
        setError('加载数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    fetchNotifications(user.id);
  }, [user?.id, fetchNotifications]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">商家仪表盘</h1>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald/30 border-t-emerald rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">商家仪表盘</h1>
        <div className="card text-center py-10">
          <p className="text-coral">{error}</p>
          <button className="btn-primary mt-4" onClick={() => window.location.reload()}>
            重新加载
          </button>
        </div>
      </div>
    );
  }

  const reputationScore = user?.reputation_score ?? 0;
  const totalProducts = stats?.total_products ?? products.length;
  const pendingItems = stats?.pending_items ?? 0;
  const recentNotifications = notifications.slice(0, 5);

  const gaugeBg =
    reputationScore >= 80
      ? 'bg-emerald'
      : reputationScore >= 50
        ? 'bg-amber'
        : 'bg-coral';

  const statCards = [
    {
      label: '信誉评分',
      value: reputationScore,
      icon: ShieldCheck,
      color: 'text-emerald',
      bgColor: 'bg-emerald/10',
      extra: (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${gaugeBg} transition-all duration-500`}
            style={{ width: `${Math.min(reputationScore, 100)}%` }}
          />
        </div>
      ),
    },
    {
      label: '商品总数',
      value: totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: '待处理事项',
      value: pendingItems,
      icon: ClipboardList,
      color: 'text-amber',
      bgColor: 'bg-amber/10',
    },
    {
      label: '未读通知',
      value: unreadCount,
      icon: Bell,
      color: 'text-coral',
      bgColor: 'bg-coral/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">商家仪表盘</h1>
        <span className="text-sm text-slate">
          欢迎回来，{user?.company_name || user?.username}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate">{card.label}</p>
                <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            {card.extra}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">最近商品</h2>
          {products.length === 0 ? (
            <p className="text-slate text-sm py-4 text-center">暂无商品数据</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-slate font-medium">商品名称</th>
                    <th className="text-left py-2 text-slate font-medium">价格</th>
                    <th className="text-left py-2 text-slate font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 text-gray-900">{p.title}</td>
                      <td className="py-2.5 text-gray-900">¥{p.price.toFixed(2)}</td>
                      <td className="py-2.5">
                        <StatusBadge status={p.status as StatusType} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">最近通知</h2>
          {recentNotifications.length === 0 ? (
            <p className="text-slate text-sm py-4 text-center">暂无通知</p>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-lg border ${n.is_read ? 'bg-white border-gray-100' : 'bg-emerald/5 border-emerald/20'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${n.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {n.title}
                    </p>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-emerald mt-1.5 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate mt-1 line-clamp-1">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
