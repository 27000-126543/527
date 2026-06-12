import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, PlayCircle, CheckCircle2, Loader2, TestTube2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import StatusBadge from '@/components/StatusBadge';

interface TaskOverview {
  id: number;
  product_name: string;
  category: string;
  priority: string;
  status: string;
  assigned_date: string;
}

interface DashboardStats {
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  recent_tasks: TaskOverview[];
}

export default function InspectorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/inspector/dashboard?inspector_id=${user?.id}`);
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
  }, [user?.id]);

  const statCards = [
    {
      label: '待执行任务',
      value: stats?.pending_tasks ?? 0,
      icon: ClipboardList,
      color: 'bg-amber/10 text-amber',
      path: '/inspector/tasks',
    },
    {
      label: '进行中任务',
      value: stats?.in_progress_tasks ?? 0,
      icon: PlayCircle,
      color: 'bg-blue-500/10 text-blue-600',
      path: '/inspector/tasks',
    },
    {
      label: '已完成任务',
      value: stats?.completed_tasks ?? 0,
      icon: CheckCircle2,
      color: 'bg-emerald/10 text-emerald',
      path: '/inspector/reports',
    },
  ];

  const priorityColorMap: Record<string, string> = {
    high: 'text-coral bg-coral/10',
    medium: 'text-amber bg-amber/10',
    low: 'text-emerald bg-emerald/10',
  };

  const priorityLabelMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低',
  };

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
        <h1 className="text-2xl font-bold text-gray-900">抽检员仪表盘</h1>
        <div className="card text-coral">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">抽检员仪表盘</h1>
        <p className="text-slate mt-1">欢迎回来，{user?.username}。以下是您的任务概览。</p>
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

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TestTube2 size={20} className="text-deepSea" />
            <h2 className="font-semibold text-gray-900">最近任务</h2>
          </div>
          <button
            className="flex items-center gap-1 text-sm text-emerald hover:underline"
            onClick={() => navigate('/inspector/tasks')}
          >
            查看全部
            <ArrowRight size={14} />
          </button>
        </div>
        {(stats?.recent_tasks ?? []).length === 0 ? (
          <p className="text-sm text-slate text-center py-8">暂无任务</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-slate">商品名称</th>
                  <th className="text-left py-3 px-4 font-medium text-slate">分类</th>
                  <th className="text-left py-3 px-4 font-medium text-slate">优先级</th>
                  <th className="text-left py-3 px-4 font-medium text-slate">状态</th>
                  <th className="text-left py-3 px-4 font-medium text-slate">分配日期</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recent_tasks ?? []).map((task) => (
                  <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{task.product_name}</td>
                    <td className="py-3 px-4 text-gray-600">{task.category}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColorMap[task.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                        {priorityLabelMap[task.priority] ?? task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={task.status as 'assigned' | 'warning' | 'completed'} />
                    </td>
                    <td className="py-3 px-4 text-gray-600">{task.assigned_date}</td>
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
