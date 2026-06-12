import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  ClipboardCheck,
  FlaskConical,
  Scale,
  Receipt,
  Lock,
  User,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore, type UserRole } from '@/store/auth';

interface RoleCard {
  role: UserRole;
  label: string;
  description: string;
  icon: React.ElementType;
  username: string;
  gradient: string;
  iconBg: string;
}

const roleCards: RoleCard[] = [
  {
    role: 'seller',
    label: '商家',
    description: '管理商品、资质与保证金',
    icon: Store,
    username: 'seller1',
    gradient: 'from-green-500 to-teal-600',
    iconBg: 'bg-green-500/20 text-green-400',
  },
  {
    role: 'reviewer',
    label: '审核员',
    description: '审核资质与侵权复审',
    icon: ClipboardCheck,
    username: 'reviewer1',
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-500/20 text-blue-400',
  },
  {
    role: 'inspector',
    label: '抽检员',
    description: '执行抽检任务与检测报告',
    icon: FlaskConical,
    username: 'inspector1',
    gradient: 'from-yellow-500 to-orange-600',
    iconBg: 'bg-yellow-500/20 text-yellow-400',
  },
  {
    role: 'ip_owner',
    label: '权利人',
    description: '维护知识产权与发起投诉',
    icon: Scale,
    username: 'ipowner1',
    gradient: 'from-purple-500 to-violet-600',
    iconBg: 'bg-purple-500/20 text-purple-400',
  },
  {
    role: 'finance',
    label: '财务',
    description: '审批退还与运营报表',
    icon: Receipt,
    username: 'finance1',
    gradient: 'from-coral to-rose-600',
    iconBg: 'bg-coral/20 text-coral',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSelectRole = (card: RoleCard) => {
    setSelectedRole(card.role);
    setUsername(card.username);
    setPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password, selectedRole);
      const rolePrefixMap: Record<UserRole, string> = {
        seller: '/seller',
        reviewer: '/reviewer',
        inspector: '/inspector',
        ip_owner: '/ip-owner',
        finance: '/finance',
      };
      if (selectedRole) {
        navigate(rolePrefixMap[selectedRole]);
      }
    } catch {
      // error is set in store
    }
  };

  const selectedCard = roleCards.find((c) => c.role === selectedRole);

  return (
    <div className="min-h-screen bg-deepSea flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-3">
            跨境电商知识产权监管平台
          </h1>
          <p className="text-white/50 text-sm">
            选择您的角色以登录系统
          </p>
        </div>

        {/* Role cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {roleCards.map((card) => {
            const Icon = card.icon;
            const isSelected = selectedRole === card.role;
            return (
              <button
                key={card.role}
                onClick={() => handleSelectRole(card)}
                className={`group relative p-5 rounded-2xl border transition-all duration-300 text-left
                  ${isSelected
                    ? 'bg-white/10 border-emerald/50 shadow-lg shadow-emerald/10 scale-[1.03]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]'
                  }`}
              >
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald rounded-full border-2 border-deepSea" />
                )}
                <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{card.label}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{card.description}</p>
              </button>
            );
          })}
        </div>

        {/* Login form */}
        {selectedRole && (
          <div className="max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl ${selectedCard?.iconBg} flex items-center justify-center`}>
                  {selectedCard && <selectedCard.icon size={20} />}
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">
                    {selectedCard?.label}登录
                  </h2>
                  <p className="text-white/40 text-xs">请输入您的账号信息</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    <User size={14} className="inline mr-1.5 -mt-0.5" />
                    用户名
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald/50 focus:border-emerald/50 transition-all duration-200"
                    placeholder="请输入用户名"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    <Lock size={14} className="inline mr-1.5 -mt-0.5" />
                    密码
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald/50 focus:border-emerald/50 transition-all duration-200"
                    placeholder="请输入密码"
                    required
                  />
                </div>

                {error && (
                  <div className="text-coral text-sm bg-coral/10 border border-coral/20 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-emerald to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald/20"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      登录系统
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
