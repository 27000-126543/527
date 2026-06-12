import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck,
  Package,
  MessageSquareWarning,
  ShieldCheck,
  Bell,
  ClipboardCheck,
  FileSearch,
  Gavel,
  TestTube2,
  FlaskConical,
  Award,
  FileWarning,
  TrendingUp,
  Receipt,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  User,
} from 'lucide-react';
import { useAuthStore, type UserRole } from '@/store/auth';
import { useNotificationStore } from '@/store/notification';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const roleNavItems: Record<UserRole, NavItem[]> = {
  seller: [
    { label: '仪表盘', icon: LayoutDashboard, path: '/seller' },
    { label: '资质管理', icon: FileCheck, path: '/seller/qualification' },
    { label: '商品管理', icon: Package, path: '/seller/products' },
    { label: '申诉中心', icon: MessageSquareWarning, path: '/seller/appeals' },
    { label: '保证金管理', icon: ShieldCheck, path: '/seller/deposit' },
    { label: '消息通知', icon: Bell, path: '/notifications' },
  ],
  reviewer: [
    { label: '仪表盘', icon: LayoutDashboard, path: '/reviewer' },
    { label: '资质审核', icon: ClipboardCheck, path: '/reviewer/qualification-review' },
    { label: '侵权复审', icon: FileSearch, path: '/reviewer/infringement-review' },
    { label: '申诉仲裁', icon: Gavel, path: '/reviewer/appeal-arbitration' },
    { label: '消息通知', icon: Bell, path: '/notifications' },
  ],
  inspector: [
    { label: '仪表盘', icon: LayoutDashboard, path: '/inspector' },
    { label: '抽检任务', icon: TestTube2, path: '/inspector/tasks' },
    { label: '检测报告', icon: FlaskConical, path: '/inspector/reports' },
    { label: '消息通知', icon: Bell, path: '/notifications' },
  ],
  ip_owner: [
    { label: '仪表盘', icon: LayoutDashboard, path: '/ip-owner' },
    { label: '权利证明', icon: Award, path: '/ip-owner/certificates' },
    { label: '发起投诉', icon: FileWarning, path: '/ip-owner/complaints' },
    { label: '投诉进展', icon: TrendingUp, path: '/ip-owner/complaint-tracking' },
    { label: '消息通知', icon: Bell, path: '/notifications' },
  ],
  finance: [
    { label: '仪表盘', icon: LayoutDashboard, path: '/finance' },
    { label: '退还审批', icon: Receipt, path: '/finance/refund-approval' },
    { label: '运营报表', icon: BarChart3, path: '/finance/reports' },
    { label: '消息通知', icon: Bell, path: '/notifications' },
  ],
};

const roleLabels: Record<UserRole, string> = {
  seller: '商家',
  reviewer: '审核员',
  inspector: '抽检员',
  ip_owner: '权利人',
  finance: '财务',
};

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { unreadCount, fetchNotifications, fetchUnreadCount } = useNotificationStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
      fetchUnreadCount(user.id);
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const navItems = roleNavItems[user.role] ?? [];
  const isActive = (path: string) => {
    if (path === `/${user.role}`) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarWidth = collapsed ? 64 : 256;

  return (
    <div className="min-h-screen bg-lightBlue">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-deepSea z-50 transition-all duration-300 scrollbar-thin flex flex-col
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ width: sidebarWidth }}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          {!collapsed && (
            <span className="text-white font-bold text-lg tracking-wide">
              跨境电商监管平台
            </span>
          )}
          <button
            onClick={() => {
              setCollapsed(!collapsed);
              setMobileOpen(false);
            }}
            className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden lg:flex"
          >
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role badge */}
        <div className={`px-4 py-3 border-b border-white/10 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <div className="w-8 h-8 rounded-full bg-emerald/20 text-emerald flex items-center justify-center text-xs font-bold">
              {roleLabels[user.role][0]}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald/20 text-emerald flex items-center justify-center text-sm font-bold">
                {roleLabels[user.role][0]}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{user.username}</p>
                <p className="text-white/50 text-xs">{roleLabels[user.role]}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full ${active ? 'sidebar-link-active' : 'sidebar-link'} ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        {!collapsed && (
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="sidebar-link w-full text-coral hover:bg-coral/10"
            >
              <LogOut size={20} />
              <span>退出登录</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div
        className="transition-all duration-300"
        style={{ marginLeft: window.innerWidth >= 1024 ? sidebarWidth : 0 }}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-coral text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-deepSea text-white flex items-center justify-center">
                <User size={16} />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{user.username}</p>
                <p className="text-xs text-gray-500">{roleLabels[user.role]}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-coral p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="退出登录"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
