import { useState, useEffect } from 'react';
import { Bell, CheckCheck, ClipboardCheck, TestTube2, AlertCircle, MessageSquareWarning, Receipt, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useNotificationStore } from '@/store/notification';

type NotificationType = 'all' | 'review' | 'inspection' | 'complaint' | 'appeal' | 'refund';

interface NotificationItem {
  id: number;
  user_id: number;
  type: 'review' | 'inspection' | 'complaint' | 'appeal' | 'refund';
  title: string;
  content: string;
  related_id: number | null;
  related_type: string;
  is_read: boolean;
  created_at: string;
}

const typeTabs: { value: NotificationType; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'review', label: '审核' },
  { value: 'inspection', label: '抽检' },
  { value: 'complaint', label: '投诉' },
  { value: 'appeal', label: '申诉' },
  { value: 'refund', label: '退还' },
];

const typeIcons: Record<string, React.ElementType> = {
  review: ClipboardCheck,
  inspection: TestTube2,
  complaint: AlertCircle,
  appeal: MessageSquareWarning,
  refund: Receipt,
};

const typeColors: Record<string, string> = {
  review: 'bg-blue-500/10 text-blue-600',
  inspection: 'bg-purple-500/10 text-purple-600',
  complaint: 'bg-coral/10 text-coral',
  appeal: 'bg-amber/10 text-amber',
  refund: 'bg-emerald/10 text-emerald',
};

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<NotificationType>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const type = activeTab === 'all' ? undefined : activeTab;
    fetchNotifications(user.id, type);
  }, [user, activeTab, fetchNotifications]);

  const handleClick = async (id: number) => {
    await markAsRead(id);
    setExpandedId(expandedId === id ? null : id);
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllAsRead(user.id);
  };

  const filtered = activeTab === 'all'
    ? notifications
    : notifications.filter((n: NotificationItem) => n.type === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">消息通知</h1>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck size={16} />
            全部已读
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {typeTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-emerald text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald hover:text-emerald'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">暂无通知消息</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n: NotificationItem) => {
            const Icon = typeIcons[n.type] ?? Bell;
            const colorClass = typeColors[n.type] ?? 'bg-gray-100 text-gray-500';
            const isExpanded = expandedId === n.id;
            return (
              <div
                key={n.id}
                className={`card cursor-pointer transition-all duration-200 hover:shadow-md ${
                  !n.is_read ? 'border-l-4 border-l-emerald bg-emerald/5' : ''
                }`}
                onClick={() => handleClick(n.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className={`text-sm font-medium ${!n.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {n.title}
                      </h3>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-emerald" />}
                        <span className="text-xs text-gray-400">
                          {new Date(n.created_at).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.content}</p>
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
