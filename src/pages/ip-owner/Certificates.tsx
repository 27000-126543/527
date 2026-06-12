import { useState, useEffect } from 'react';
import { Award, Plus, FileText, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import StatusBadge, { StatusType } from '@/components/StatusBadge';

interface Certificate {
  id: number;
  type: 'trademark' | 'patent' | 'copyright';
  description: string;
  document_name: string;
  status: string;
  created_at: string;
}

const typeLabels: Record<string, string> = {
  trademark: '商标',
  patent: '专利',
  copyright: '著作权',
};

export default function IPOwnerCertificates() {
  const { user } = useAuthStore();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: 'trademark' as 'trademark' | 'patent' | 'copyright',
    description: '',
    document_name: '',
  });

  const fetchCertificates = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ip-owner/certificates?owner_id=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setCertificates(data.data ?? []);
      } else {
        setError(data.error || '获取权利证明失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/ip-owner/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, owner_id: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setForm({ type: 'trademark', description: '', document_name: '' });
        fetchCertificates();
      } else {
        setError(data.error || '上传失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">知识产权证书</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          上传证明
        </button>
      </div>

      {showForm && (
        <div className="card border-emerald/30">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">上传权利证明</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">证明类型</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as Certificate['type'] })}
                className="input-field"
              >
                <option value="trademark">商标</option>
                <option value="patent">专利</option>
                <option value="copyright">著作权</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">证明描述</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field min-h-[80px] resize-y"
                placeholder="请输入权利证明的详细描述"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">文件名称</label>
              <input
                type="text"
                value={form.document_name}
                onChange={(e) => setForm({ ...form, document_name: e.target.value })}
                className="input-field"
                placeholder="请输入文件名称"
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                {submitting && <Loader2 size={16} className="animate-spin" />}
                提交
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-coral/10 text-coral px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald border-t-transparent rounded-full animate-spin" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="card text-center py-12">
          <Award size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">暂无权利证明，请点击上方按钮上传</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">类型</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">描述</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">状态</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">上传日期</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-900">
                      <FileText size={14} className="text-slate" />
                      {typeLabels[cert.type] ?? cert.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-[300px] truncate">{cert.description}</td>
                  <td className="px-6 py-4"><StatusBadge status={cert.status as StatusType} /></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(cert.created_at).toLocaleDateString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
