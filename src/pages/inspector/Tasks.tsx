import { useState, useEffect } from 'react';
import { TestTube2, PlayCircle, FileText, Loader2, Package, Send } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import StatusBadge from '@/components/StatusBadge';

interface InspectionTask {
  id: number;
  product_id: number;
  product_name: string;
  category: string;
  priority: string;
  status: 'assigned' | 'in_progress' | 'completed';
  assigned_date: string;
  product_description: string;
  seller_name: string;
}

interface ReportForm {
  result: '' | 'qualified' | 'warning' | 'unqualified';
  details: string;
  report_file: string;
}

export default function InspectorTasks() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<InspectionTask[]>([]);
  const [selected, setSelected] = useState<InspectionTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState<ReportForm>({
    result: '',
    details: '',
    report_file: '',
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/inspector/tasks?inspector_id=${user?.id}`);
        const data = await res.json();
        if (data.success) {
          setTasks(data.data);
          if (data.data.length > 0) {
            setSelected(data.data[0]);
          }
        } else {
          setError(data.error || '获取任务失败');
        }
      } catch {
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user?.id]);

  const handleStartSampling = async () => {
    if (!selected) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/inspector/tasks/${selected.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspector_id: user?.id }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === selected.id ? { ...t, status: 'in_progress' as const } : t))
        );
        setSelected({ ...selected, status: 'in_progress' });
        setShowReportForm(true);
      } else {
        alert(data.error || '操作失败');
      }
    } catch {
      alert('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!selected) return;
    if (!reportForm.result) {
      alert('请选择检测结果');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch('/api/inspector/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: selected.id,
          product_id: selected.product_id,
          inspector_id: user?.id,
          result: reportForm.result,
          details: reportForm.details.trim(),
          report_file: reportForm.report_file.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === selected.id ? { ...t, status: 'completed' as const } : t))
        );
        setSelected({ ...selected, status: 'completed' });
        setShowReportForm(false);
        setReportForm({ result: '', details: '', report_file: '' });
      } else {
        alert(data.error || '提交失败');
      }
    } catch {
      alert('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald" />
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">抽检任务</h1>
        <div className="card text-coral">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">抽检任务</h1>
        <p className="text-slate mt-1">查看与执行抽检任务</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">任务列表</h2>
              <span className="text-xs bg-amber/10 text-amber px-2.5 py-1 rounded-full font-medium">
                {tasks.filter((t) => t.status !== 'completed').length} 条待处理
              </span>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-sm text-slate text-center py-8">暂无任务</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selected?.id === task.id
                        ? 'border-emerald bg-emerald/5'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelected(task);
                      setShowReportForm(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                        {task.product_name}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColorMap[task.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                        {priorityLabelMap[task.priority] ?? task.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate">{task.category}</span>
                      <StatusBadge status={task.status} />
                    </div>
                    <p className="text-xs text-slate mt-0.5">分配于 {task.assigned_date}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-4">任务详情</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate mb-1">商品名称</p>
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" />
                        <p className="text-sm font-medium text-gray-900">{selected.product_name}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate mb-1">商家</p>
                      <p className="text-sm text-gray-900">{selected.seller_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate mb-1">分类</p>
                      <p className="text-sm text-gray-900">{selected.category}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate mb-1">优先级</p>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${priorityColorMap[selected.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                        {priorityLabelMap[selected.priority] ?? selected.priority}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate mb-1">状态</p>
                      <StatusBadge status={selected.status} />
                    </div>
                    <div>
                      <p className="text-xs text-slate mb-1">分配日期</p>
                      <p className="text-sm text-gray-900">{selected.assigned_date}</p>
                    </div>
                  </div>
                </div>
                {selected.product_description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-slate mb-1">商品描述</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.product_description}</p>
                  </div>
                )}
              </div>

              {selected.status === 'assigned' && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-4">开始抽检</h3>
                  <p className="text-sm text-slate mb-4">
                    点击下方按钮开始执行抽检任务，开始后可提交检测报告。
                  </p>
                  <button
                    className="btn-primary flex items-center gap-2"
                    onClick={handleStartSampling}
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                    开始抽检
                  </button>
                </div>
              )}

              {(selected.status === 'in_progress' || showReportForm) && (
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={18} className="text-gray-400" />
                    <h3 className="font-semibold text-gray-900">提交检测报告</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">检测结果</label>
                      <select
                        className="input-field"
                        value={reportForm.result}
                        onChange={(e) => setReportForm((prev) => ({ ...prev, result: e.target.value as ReportForm['result'] }))}
                      >
                        <option value="">请选择检测结果</option>
                        <option value="qualified">合格</option>
                        <option value="warning">警告</option>
                        <option value="unqualified">不合格</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">检测详情</label>
                      <textarea
                        className="input-field"
                        rows={4}
                        placeholder="请输入检测详情"
                        value={reportForm.details}
                        onChange={(e) => setReportForm((prev) => ({ ...prev, details: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">报告文件名</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="请输入报告文件名"
                        value={reportForm.report_file}
                        onChange={(e) => setReportForm((prev) => ({ ...prev, report_file: e.target.value }))}
                      />
                    </div>
                    <button
                      className="btn-primary flex items-center gap-2"
                      onClick={handleSubmitReport}
                      disabled={submitting || !reportForm.result}
                    >
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      提交报告
                    </button>
                  </div>
                </div>
              )}

              {selected.status === 'completed' && (
                <div className="card flex items-center gap-3">
                  <TestTube2 size={20} className="text-emerald" />
                  <p className="text-sm text-gray-700">该任务已完成，检测报告已提交。</p>
                </div>
              )}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-16">
              <TestTube2 size={48} className="text-gray-300 mb-3" />
              <p className="text-slate">请从左侧列表选择一条任务查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
