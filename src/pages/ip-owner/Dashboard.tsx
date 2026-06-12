import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface DashboardStats {
  certificate_count: number;
  ongoing_complaints: number;
  resolved_complaints: number;
}

export default function IPOwnerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    certificate_count: 0,
    ongoing_complaints: 0,
    resolved_complaints: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/ip-owner/certificates?owner_id=${user.id}`);
        const certData = await res.json();
        const certCount = certData.success ? (certData.data ?? []).length : 0;

        const complaintsRes = await fetch(`/api/ip-owner/complaints?owner_id=${user.id}`);
        const complaintsData = await complaintsRes.json();
        const complaints: Array<{ status: string }> = complaintsData.success ? (complaintsData.data ?? []) : [];

        setStats({
          certificate_count: certCount,
          ongoing_complaints: complaints.filter((c) => c.status === 'pending' || c.status === 'assigned').length,
          resolved_complaints: complaints.filter((c) => c.status === 'completed' || c.status === 'approved').length,
        });
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const statCards = [
    { label: '权利证明数量', value: stats.certificate_count, icon: Award, color: 'bg-emerald/10 text-emerald' },
    { label: '进行中投诉', value: stats.ongoing_complaints, icon: AlertCircle, color: 'bg-amber/10 text-amber' },
    { label: '已解决投诉', value: stats.resolved_complaints, icon: CheckCircle, color: 'bg-blue-500/10 text-blue-600' },
  ];

  const quickLinks = [
    { label: '管理权利证明', path: '/ip-owner/certificates', icon: Award },
    { label: '发起投诉', path: '/ip-owner/complaints', icon: AlertCircle },
    { label: '投诉进展', path: '/ip-owner/complaint-tracking', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">权利人仪表盘</h1>

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
