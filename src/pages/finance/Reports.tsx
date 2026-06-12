import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';

interface ReportData {
  region: string;
  month: string;
  seller_count: number;
  inspection_pass_rate: number;
  complaint_resolution_rate: number;
}

const regions = [
  { value: '华东', label: '华东' },
  { value: '华南', label: '华南' },
  { value: '华北', label: '华北' },
];

const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}月` }));
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 3 }, (_, i) => {
  const y = currentYear - i;
  return { value: String(y), label: `${y}年` };
});

export default function FinanceReports() {
  const [region, setRegion] = useState('华东');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchReports = async () => {
    if (!initialized) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/finance/reports?region=${region}&month=${month}&year=${year}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data ?? []);
      } else {
        setError(result.error || '获取报表数据失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultMonth = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/finance/reports');
      const result = await res.json();
      if (result.success) {
        const months: string[] = result.available_months ?? [];
        if (months.length > 0) {
          const latest = months[0];
          const [y, m] = latest.split('-');
          setYear(y);
          setMonth(String(Number(m)));
        } else {
          setYear(String(new Date().getFullYear()));
          setMonth(String(new Date().getMonth() + 1));
        }
      }
    } catch {
      setYear(String(new Date().getFullYear()));
      setMonth(String(new Date().getMonth() + 1));
    } finally {
      setInitialized(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeDefaultMonth();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [region, month, year, initialized]);

  const barChartData = data.map((d) => ({
    name: d.region,
    卖家数量: d.seller_count,
  }));

  const lineChartData = data.map((d) => ({
    name: d.region,
    抽检通过率: d.inspection_pass_rate,
    投诉解决率: d.complaint_resolution_rate,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">运营报表</h1>

      <div className="card">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">区域</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="input-field w-32">
              {regions.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">月份</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="input-field w-32">
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">年份</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="input-field w-32">
              {years.map((y) => (
                <option key={y.value} value={y.value}>{y.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="bg-coral/10 text-coral px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">暂无报表数据</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">各区域卖家数量</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="卖家数量" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">抽检通过率与投诉解决率趋势</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} unit="%" />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="抽检通过率" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="投诉解决率" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card overflow-hidden p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">区域</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">月份</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">卖家数量</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">抽检通过率</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">投诉解决率</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{d.region}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{Number(d.month)}月</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{d.seller_count}</td>
                      <td className="px-6 py-4 text-sm text-emerald font-medium">{d.inspection_pass_rate}%</td>
                      <td className="px-6 py-4 text-sm text-amber font-medium">{d.complaint_resolution_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
