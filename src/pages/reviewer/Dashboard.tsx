import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, FileSearch, Gavel, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface DashboardStats {
  pending_qualifications: number;
  pending_infringement: number;
  pending_appeals: number;
}

export default function ReviewerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/reviewer/dashboard');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.error || '获取数据失败');
        }
      } catch {
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: '待审核资质',
      value: stats?.pending_qualifications ?? 0,
      icon: ClipboardCheck,
      color: 'bg-amber/10 text-amber',
      iconColor: 'text-amber',
      path: '/reviewer/qualification-review',
    },
    {
      label: '待复审侵权商品',
      value: stats?.pending_infringement ?? 0,
      icon: FileSearch,
      color: 'bg-coral/10 text-coral',
      iconColor: 'text-coral',
      path: '/reviewer/infringement-review',
    },
    {
      label: '待仲裁申诉',
      value: stats?.pending_appeals ?? 0,
      icon: Gavel,
      color: 'bg-deepSea/10 text-deepSea',
      iconColor: 'text-deepSea',
      path: '/reviewer/appeal-arbitration',
    },
  ];

  const quickAccess = [
    {
      title: '资质审核队列',
      description: '审核商家提交的资质申请，查看文件与数据库匹配结果',
      icon: ClipboardCheck,
      path: '/reviewer/qualification-review',
      color: 'border-amber/30 hover:border-amber',
      count: stats?.pending_qualifications ?? 0,
    },
    {
      title: '侵权复审队列',
      description: '处理被标记的侵权商品，确认或解除侵权锁定',
      icon: FileSearch,
      path: '/reviewer/infringement-review',
      color: 'border-coral/30 hover:border-coral',
      count: stats?.pending_infringement ?? 0,
    },
    {
      title: '申诉仲裁',
      description: '仲裁商家申诉，维持或驳回原处罚决定',
      icon: Gavel,
      path: '/reviewer/appeal-arbitration',
      color: 'border-deepSea/30 hover:border-deepSea',
      count: stats?.pending_appeals ?? 0,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">审核员仪表盘</h1>
        <div className="card text-coral">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">审核员仪表盘</h1>
        <p className="text-slate mt-1">欢迎回来，{user?.username}。以下是您的待办事项概览。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(card.path)}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-slate">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快速访问</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickAccess.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`card border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${item.color}`}
                onClick={() => navigate(item.path)}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon size={24} className="text-gray-600" />
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    {item.count} 条待处理
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
