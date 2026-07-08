import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  ShieldAlert,
  User 
} from 'lucide-react';

export default function MainLayout({ isAdminMode = false }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Tests Engine', path: '/exams', icon: BookOpen },
  ];

  const adminMenuItems = [
    { name: 'Admin Console', path: '/admin', icon: ShieldAlert },
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Tests Engine', path: '/exams', icon: BookOpen },
  ];

  const activeMenu = isAdminMode ? adminMenuItems : menuItems;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Upper Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo area */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <Sparkles className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">ExamForge</span>
                  <span className="text-primary-400 font-bold ml-0.5">AI</span>
                </div>
              </Link>

              {/* Desktop Menu links */}
              <nav className="hidden md:flex space-x-1">
                {activeMenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-primary-500/10 text-primary-400 shadow-inner'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Profile area */}
            <div className="hidden md:flex items-center gap-4">
              {user && user.role === 'admin' && !isAdminMode && (
                <Link
                  to="/admin"
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/50 rounded-full px-3 py-1 font-semibold flex items-center gap-1"
                >
                  <ShieldAlert className="h-3 w-3" />
                  Admin Config
                </Link>
              )}

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                  <User className="h-4 w-4 text-slate-300" />
                </div>
                <div className="text-left leading-none">
                  <div className="text-sm font-semibold max-w-[120px] truncate">{user?.name || 'Candidate'}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{user?.role || 'Student'}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile menu trigger */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-800 px-2 pt-2 pb-3 space-y-1">
            {activeMenu.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-semibold ${
                    isActive ? 'bg-primary-500/10 text-primary-400' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            
            {user?.role === 'admin' && !isAdminMode && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-semibold text-amber-400 hover:bg-slate-900"
              >
                <ShieldAlert className="h-5 w-5" />
                Admin Panel
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-semibold text-red-400 hover:bg-slate-900 text-left"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full transition-all duration-200">
        <Outlet />
      </main>

      {/* Footer metadata */}
      <footer className="bg-slate-950 py-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          ExamForge AI Portal. Built for high-reliability exam practice simulations.
        </div>
      </footer>
    </div>
  );
}
