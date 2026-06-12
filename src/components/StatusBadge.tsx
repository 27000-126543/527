import { cn } from '@/lib/utils';

export type StatusType =
  | 'normal' | 'approved' | 'qualified' | 'upheld'
  | 'warning' | 'pending'
  | 'locked' | 'delisted' | 'unqualified' | 'rejected'
  | 'active' | 'auto_verified' | 'assigned' | 'in_progress' | 'sampling' | 'notice_sent' | 'confirmed' | 'dismissed'
  | 'expired' | 'revoked' | 'completed' | 'under_review';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const statusColorMap: Record<string, { bg: string; text: string; dot: string }> = {
  green: { bg: 'bg-emerald/10', text: 'text-emerald', dot: 'bg-emerald' },
  yellow: { bg: 'bg-amber/10', text: 'text-amber', dot: 'bg-amber' },
  red: { bg: 'bg-coral/10', text: 'text-coral', dot: 'bg-coral' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', dot: 'bg-blue-500' },
  gray: { bg: 'bg-gray-500/10', text: 'text-gray-500', dot: 'bg-gray-400' },
};

const statusGroupMap: Record<string, string> = {
  normal: 'green',
  approved: 'green',
  qualified: 'green',
  upheld: 'green',
  confirmed: 'green',
  dismissed: 'green',
  warning: 'yellow',
  pending: 'yellow',
  under_review: 'yellow',
  in_progress: 'yellow',
  sampling: 'yellow',
  notice_sent: 'blue',
  locked: 'red',
  delisted: 'red',
  unqualified: 'red',
  rejected: 'red',
  active: 'blue',
  auto_verified: 'blue',
  assigned: 'blue',
  expired: 'gray',
  revoked: 'gray',
  completed: 'gray',
};

const statusLabelMap: Record<StatusType, string> = {
  normal: '正常',
  approved: '已通过',
  qualified: '合格',
  upheld: '已维持',
  confirmed: '已确认',
  dismissed: '已撤销',
  warning: '警告',
  pending: '待审核',
  under_review: '审核中',
  in_progress: '进行中',
  sampling: '采样中',
  notice_sent: '已通知',
  locked: '已锁定',
  delisted: '已下架',
  unqualified: '不合格',
  rejected: '已驳回',
  active: '活跃',
  auto_verified: '自动验证',
  assigned: '已分配',
  expired: '已过期',
  revoked: '已撤销',
  completed: '已完成',
};

export default function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const colorKey = statusGroupMap[status] ?? 'gray';
  const colors = statusColorMap[colorKey];
  const displayLabel = label ?? statusLabelMap[status] ?? status;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        colors.bg,
        colors.text,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
      {displayLabel}
    </span>
  );
}
