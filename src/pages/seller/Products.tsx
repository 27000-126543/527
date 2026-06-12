import { useState, useEffect } from 'react';
import { Plus, X, AlertTriangle, Filter } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import StatusBadge from '@/components/StatusBadge';

interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  status: 'normal' | 'locked' | 'delisted' | 'pending' | 'approved' | 'rejected';
  infringement_flagged: boolean;
  infringement_reason: string | null;
  created_at: string;
}

const CATEGORIES = [
  '电子产品',
  '服装鞋帽',
  '家居用品',
  '美妆个护',
  '食品饮料',
  '运动户外',
  '图书音像',
  '母婴用品',
  '其他',
];

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'normal', label: '正常' },
  { value: 'locked', label: '已锁定' },
  { value: 'delisted', label: '已下架' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
];

export default function SellerProducts() {
  const user = useAuthStore((s) => s.user);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    price: '',
  });

  const fetchProducts = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/seller/products?user_id=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data ?? []);
      } else {
        setError(data.error || '加载商品失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user?.id]);

  const filteredProducts = statusFilter
    ? products.filter((p) => p.status === statusFilter)
    : products;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title: form.title,
          description: form.description,
          category: form.category,
          price: parseFloat(form.price),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setForm({ title: '', description: '', category: CATEGORIES[0], price: '' });
        fetchProducts();
      } else {
        setSubmitError(data.error || '添加商品失败');
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
        <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald/30 border-t-emerald rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        <div className="card text-center py-10">
          <p className="text-coral">{error}</p>
          <button className="btn-primary mt-4" onClick={fetchProducts}>
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          添加商品
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-4 h-4 text-slate" />
          <select
            className="input-field w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="text-sm text-slate">共 {filteredProducts.length} 件商品</span>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-slate text-sm py-8 text-center">暂无商品数据</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-slate font-medium">商品名称</th>
                  <th className="text-left py-2 text-slate font-medium">类目</th>
                  <th className="text-left py-2 text-slate font-medium">价格</th>
                  <th className="text-left py-2 text-slate font-medium">状态</th>
                  <th className="text-left py-2 text-slate font-medium">侵权标记</th>
                  <th className="text-left py-2 text-slate font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-gray-900">{p.title}</td>
                    <td className="py-2.5 text-gray-600">{p.category}</td>
                    <td className="py-2.5 text-gray-900">¥{p.price.toFixed(2)}</td>
                    <td className="py-2.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-2.5">
                      {p.infringement_flagged ? (
                        <span className="inline-flex items-center gap-1 text-coral text-xs font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          已标记
                        </span>
                      ) : (
                        <span className="text-slate text-xs">-</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      {p.infringement_flagged && (
                        <button
                          className="text-sm text-emerald hover:text-green-600 font-medium"
                          onClick={() => setSelectedProduct(p)}
                        >
                          查看详情
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">侵权详情</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-slate hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-coral" />
                <span className="font-medium text-gray-900">{selectedProduct.title}</span>
              </div>
              <div className="p-3 bg-coral/5 rounded-lg border border-coral/20">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">侵权原因：</span>
                  {selectedProduct.infringement_reason || '暂无详细信息'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate">类目：</span>
                  <span className="text-gray-900">{selectedProduct.category}</span>
                </div>
                <div>
                  <span className="text-slate">价格：</span>
                  <span className="text-gray-900">¥{selectedProduct.price.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate">状态：</span>
                  <StatusBadge status={selectedProduct.status} />
                </div>
                <div>
                  <span className="text-slate">提交时间：</span>
                  <span className="text-gray-900">
                    {new Date(selectedProduct.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="btn-secondary" onClick={() => setSelectedProduct(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">添加商品</h3>
              <button onClick={() => setShowModal(false)} className="text-slate hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商品名称</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="请输入商品名称"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商品描述</label>
                <textarea
                  className="input-field min-h-[80px] resize-y"
                  placeholder="请输入商品描述"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类目</label>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">价格（元）</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="请输入商品价格"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              {submitError && <p className="text-sm text-coral">{submitError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '提交中...' : '确认添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
