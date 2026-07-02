import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  LogOut, 
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardLayout() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (currentUser.role === 'Bendahara') {
      return [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Catat Setoran Masuk', path: '/members', icon: Users },
        { name: 'Catat Pengeluaran', path: '/transactions', icon: Wallet },
      ];
    }
    return [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Data Penabung', path: '/members', icon: Users },
      { name: 'Rincian Transaksi', path: '/transactions', icon: Wallet },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <span className="font-bold text-lg tracking-tight">Tabungan C</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-200">
          <div className="bg-[#FFD600]/10 p-4 rounded-xl">
            <p className="text-xs font-bold text-amber-700 uppercase">{currentUser.role} Panel</p>
            <p className="text-sm text-amber-800 mt-1">{currentUser.name}</p>
            <button 
              onClick={handleLogout}
              className="w-full mt-3 py-2 bg-white text-slate-700 text-sm font-semibold rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 rounded-md lg:hidden hover:bg-slate-100 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold hidden sm:block text-slate-800">Tabungan Bersama</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{currentUser.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=00AA13&color=fff`} alt="Avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
