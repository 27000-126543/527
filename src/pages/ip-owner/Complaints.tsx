import { useState, useEffect } from 'react';
import { Search, Send, Loader2, Package, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import StatusBadge, { StatusType } from '@/components/StatusBadge';

interface Certificate {
  id: number;
  type: string;
  description: string;
  status: string;
}

interface MatchedProduct {
  id: number;
  product_name: string;
  seller_name: string;
  match_reason: string;
}

interface ExistingComplaint {
  id: number;
  certificate_type: string;
  status: string;
  created_at: string;
  matched_products: number;
}

const typeLabels: Record<string, string> = {
  trademark: '商标',
  patent: '专利',
  copyright: '著作权',
};

export default function IPOwnerComplaints() {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertId, setSelectedCertId] = useState<number | null>(null);
  const [matchedProducts, setMatchedProducts] = useState<MatchedProduct[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
  const [existingComplaints, setExistingComplaints] = useState<ExistingComplaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const certRes = await fetch(`/api/ip-owner/certificates?owner_id=${user.id}`);
        const certData = await certRes.json();
        if (certData.success) setCertificates(certData.data ?? []);

        const complaintsRes = await fetch(`/api/ip-owner/complaints?owner_id=${user.id}`);
        const complaintsData = await complaintsRes.json();
        if (complaintsData.success) setExistingComplaints(complaintsData.data ?? []);
      } catch {
        setError('加载数据失败');
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, [user]);

  const handleMatch = async () => {
    if (!selectedCertId) return;
    setMatching(true);
    setError(null);
    try {
      const res = await fetch(`/api/ip-owner/match?certificate_id=${selectedCertId}`);
      const data = await res.json();
      if (data.success) {
        const payload = data.data;
        const products = Array.isArray(payload) ? payload : (payload?.matched_products ?? []);
        setMatchedProducts(products);
        setSelectedProductIds(new Set());
        setStep(2);
      } else {
        setError(data.error || '匹配失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setMatching(false);
    }
  };

  const toggleProduct = (id: number) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!selectedCertId || selectedProductIds.size === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/ip-owner/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificate_id: selectedCertId,
          product_ids: Array.from(selectedProductIds),
          owner_id: user!.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('投诉提交成功');
        setStep(1);
        setSelectedCertId(null);
        setMatchedProducts([]);
        setSelectedProductIds(new Set());
        const complaintsRes = await fetch(`/api/ip-owner/complaints?owner_id=${user!.id}`);
        const complaintsData = await complaintsRes.json();
        if (complaintsData.success) setExistingComplaints(complaintsData.data ?? []);
      } else {
        setError(data.error || '提交失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const stepItems = [
    { num: 1, label: '选择权利证明' },
    { num: 2, label: '匹配侵权商品' },
    { num: 3, label: '确认提交' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">侵权投诉</h1>

      {error && <div className="bg-coral/10 text-coral px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-emerald/10 text-emerald px-4 py-3 rounded-lg text-sm">{success}</div>}

      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          {stepItems.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                step >= s.num ? 'bg-emerald/10 text-emerald' : 'bg-gray-100 text-gray-400'
              }`}>
                <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                  step > s.num ? 'bg-emerald text-white' : step === s.num ? 'bg-emerald text-white' : 'bg-gray-300 text-white'
                }`}>
                  {step > s.num ? '✓' : s.num}
                </span>
                {s.label}
              </div>
              {i < stepItems.length - 1 && <div className="w-8 h-px bg-gray-300 mx-1" />}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">选择权利证明</label>
                  <select
                    value={selectedCertId ?? ''}
                    onChange={(e) => setSelectedCertId(Number(e.target.value) || null)}
                    className="input-field"
                  >
                    <option value="">请选择权利证明</option>
                    {certificates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {typeLabels[c.type] ?? c.type} - {c.description}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleMatch}
                  disabled={!selectedCertId || matching}
                  className="btn-primary flex items-center gap-2"
                >
                  {matching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  匹配侵权商品
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">匹配到的侵权商品</h3>
                {matchedProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">未匹配到侵权商品</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {matchedProducts.map((p) => (
                      <label
                        key={p.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedProductIds.has(p.id) ? 'border-emerald bg-emerald/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedProductIds.has(p.id)}
                          onChange={() => toggleProduct(p.id)}
                          className="mt-1 w-4 h-4 text-emerald border-gray-300 rounded focus:ring-emerald"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.product_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">卖家: {p.seller_name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{p.match_reason}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary">上一步</button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={selectedProductIds.size === 0}
                    className="btn-primary"
                  >
                    下一步
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">确认投诉信息</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    权利证明: <span className="font-medium text-gray-900">
                      {certificates.find((c) => c.id === selectedCertId)?.description ?? '-'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    侵权商品数量: <span className="font-medium text-gray-900">{selectedProductIds.size}</span>
                  </p>
                  <div className="text-sm text-gray-600">
                    <span>所选商品:</span>
                    <ul className="mt-1 ml-4 space-y-1">
                      {matchedProducts
                        .filter((p) => selectedProductIds.has(p.id))
                        .map((p) => (
                          <li key={p.id} className="text-gray-800">• {p.product_name}（卖家: {p.seller_name}）</li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-secondary">上一步</button>
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="btn-primary flex items-center gap-2"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    确认提交投诉
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">已有投诉</h2>
        {existingComplaints.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">暂无投诉记录</p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">投诉ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">证明类型</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">状态</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">匹配商品数</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">提交日期</th>
                </tr>
              </thead>
              <tbody>
                {existingComplaints.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{c.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{typeLabels[c.certificate_type] ?? c.certificate_type}</td>
                    <td className="px-6 py-4"><StatusBadge status={c.status as StatusType} /></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.matched_products}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString('zh-CN')}</td>
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
