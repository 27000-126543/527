import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import StatusBadge, { StatusType } from '@/components/StatusBadge';

interface Complaint {
  id: number;
  certificate_type: string;
  certificate_description: string;
  status: string;
  matched_products: number;
  created_at: string;
  timeline?: TimelineEntry[];
}

interface TimelineEntry {
  status: string;
  label: string;
  time: string;
}

const typeLabels: Record<string, string> = {
  trademark: '商标',
  patent: '专利',
  copyright: '著作权',
};

const timelineIcons: Record<string, React.ElementType> = {
  pending: Clock,
  assigned: TrendingUp,
  completed: CheckCircle,
  approved: CheckCircle,
};

export default function IPOwnerComplaintTracking() {
  const { user } = useAuthStore();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/ip-owner/complaints?owner_id=${user.id}`);
        const data = await res.json();
        if (data.success) {
          setComplaints(data.data ?? []);
        } else {
          setError(data.error || '获取投诉列表失败');
        }
      } catch {
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [user]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">投诉追踪</h1>

      {error && <div className="bg-coral/10 text-coral px-4 py-3 rounded-lg text-sm">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald border-t-transparent rounded-full animate-spin" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">暂无投诉记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((complaint) => {
            const isExpanded = expandedId === complaint.id;
            return (
              <div key={complaint.id} className="card">
                <button
                  onClick={() => toggleExpand(complaint.id)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 whitespace-nowrap">#{complaint.id}</span>
                    <span className="text-sm text-gray-600 truncate">
                      {typeLabels[complaint.certificate_type] ?? complaint.certificate_type}
                      {complaint.certificate_description ? ` - ${complaint.certificate_description}` : ''}
                    </span>
                    <StatusBadge status={complaint.status as StatusType} />
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      匹配商品: {complaint.matched_products}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {new Date(complaint.created_at).toLocaleDateString('zh-CN')}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">投诉时间线</h4>
                    {complaint.timeline && complaint.timeline.length > 0 ? (
                      <div className="space-y-0">
                        {complaint.timeline.map((entry, idx) => {
                          const Icon = timelineIcons[entry.status] ?? Clock;
                          const isLast = idx === complaint.timeline!.length - 1;
                          return (
                            <div key={idx} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isLast ? 'bg-emerald/10 text-emerald' : 'bg-gray-100 text-gray-400'
                                }`}>
                                  <Icon size={16} />
                                </div>
                                {!isLast && <div className="w-px h-6 bg-gray-200" />}
                              </div>
                              <div className="pb-4">
                                <p className={`text-sm font-medium ${isLast ? 'text-gray-900' : 'text-gray-600'}`}>
                                  {entry.label}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {new Date(entry.time).toLocaleString('zh-CN')}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">暂无时间线信息</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
