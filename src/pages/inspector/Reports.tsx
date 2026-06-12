import { useState, useEffect } from 'react';
import { FlaskConical, Loader2, BarChart3, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import StatusBadge from '@/components/StatusBadge';

interface InspectionReport {
  id: number;
  product_name: string;
  result: 'qualified' | 'warning' | 'unqualified';
  details: string;
  created_at: string;
  category: string;
}

interface ReportStats {
  total_inspections: number;
  pass_rate: number;
  qualified_count: number;
  warning_count: number;
  unqualified_count: number;
}

export default function InspectorReports() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/inspector/history?inspector_id=${user?.id}`);
        const data = await res.json();
        if (data.success) {
          setReports(data.data.reports ?? data.data);
          setStats(data.data.stats ?? null);
        } else {
          setError(data.error || '获取数据失败');
        }
      } catch {
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user?.id]);

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
        <h1 className="text-2xl font-bold text-gray-900">检测报告</h1>
        <div className="card text-coral">{error}</div>
      </div>
    );
  }

  const totalFromReports = reports.length;
  const qualifiedCount = stats?.qualified_count ?? reports.filter((r) => r.result === 'qualified').length;
  const warningCount = stats?.warning_count ?? reports.filter((r) => r.result === 'warning').length;
  const unqualifiedCount = stats?.unqualified_count ?? reports.filter((r) => r.result === 'unqualified').length;
  const totalCount = stats?.total_inspections ?? totalFromReports;
  const passRate = stats?.pass_rate ?? (totalCount > 0 ? Math.round((qualifiedCount / totalCount) * 100) : 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">检测报告</h1>
        <p className="text-slate mt-1">查看与提交检测报告</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-deepSea/10 text-deepSea">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-xs text-slate">总检测次数</p>
            <p className="text-xl font-bold text-gray-900">{totalCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald/10 text-emerald">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs text-slate">合格率</p>
            <p className="text-xl font-bold text-gray-900">{passRate}%</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber/10 text-amber">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs text-slate">警告</p>
            <p className="text-xl font-bold text-gray-900">{warningCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-coral/10 text-coral">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-xs text-slate">不合格</p>
            <p className="text-xl font-bold text-gray-900">{unqualifiedCount}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical size={20} className="text-deepSea" />
          <h2 className="font-semibold text-gray-900">历史报告</h2>
        </div>
        {reports.length === 0 ? (
          <p className="text-sm text-slate text-center py-8">暂无检测报告</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-slate">商品名称</th>
                  <th className="text-left py-3 px-4 font-medium text-slate">分类</th>
                  <th className="text-left py-3 px-4 font-medium text-slate">检测结果</th>
                  <th className="text-left py-3 px-4 font-medium text-slate">检测详情</th>
                  <th className="text-left py-3 px-4 font-medium text-slate">日期</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{report.product_name}</td>
                    <td className="py-3 px-4 text-gray-600">{report.category}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={report.result} />
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{report.details}</td>
                    <td className="py-3 px-4 text-gray-600">{report.created_at}</td>
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
