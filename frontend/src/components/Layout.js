import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MIcon } from './MIcon';

export default function Layout({ children }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { logoutUser(); navigate('/'); };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isLandingPage = location.pathname === '/';
  const showSidebar = user && !isAuthPage && !isLandingPage;

  if (isAuthPage) return <>{children}</>;

  const isActive = (path) => location.pathname === path;

  const sideNavLinks = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/dashboard', icon: 'edit_note', label: 'Score Entry', hash: 'scores' },
    { path: '/subscription', icon: 'card_membership', label: 'Subscription' },
    { path: '/charities', icon: 'volunteer_activism', label: 'Charities' },
    { path: '/dashboard', icon: 'military_tech', label: 'Draw History', hash: 'draws' },
    ...(user?.is_admin ? [{ path: '/admin', icon: 'admin_panel_settings', label: 'Admin' }] : []),
    { path: '/dashboard', icon: 'settings', label: 'Settings', hash: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl flex justify-between items-center px-8 h-20 shadow-[0_32px_64px_-15px_rgba(76,215,246,0.06)]">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-primary" data-testid="nav-logo">
          The Kinetic
        </Link>
        <div className="hidden md:flex items-center gap-8 font-medium text-sm tracking-tight">
          <Link to={user ? '/dashboard' : '/login'} className={`${isActive('/dashboard') ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'} transition-colors`} data-testid="nav-draws">Draws</Link>
          <Link to="/charities" className={`${isActive('/charities') ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'} transition-colors`} data-testid="nav-charities">Charities</Link>
          <Link to={user ? '/leaderboard' : '/login'} className={`${isActive('/leaderboard') ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'} transition-colors`} data-testid="nav-leaderboard">Leaderboard</Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.subscription_status !== 'active' && (
                <button onClick={() => navigate('/subscription')} className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2 rounded-xl font-bold text-sm ease-out-expo duration-300 active:scale-95" data-testid="nav-upgrade-btn">
                  Upgrade
                </button>
              )}
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="text-on-surface-variant cursor-pointer hover:text-primary transition-colors" data-testid="user-menu-btn">
                  <MIcon icon="account_circle" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-high rounded-xl border border-outline-variant/20 shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-outline-variant/10">
                      <p className="text-sm font-bold text-on-surface">{user.first_name} {user.last_name}</p>
                      <p className="text-[10px] text-on-surface-variant">{user.email}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors" data-testid="menu-dashboard">Dashboard</Link>
                    {user.is_admin && <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors" data-testid="menu-admin">Admin Panel</Link>}
                    <button onClick={() => { setUserMenuOpen(false); handleLogout(); }} className="block w-full text-left px-4 py-2.5 text-sm text-error hover:bg-surface-container-highest transition-colors" data-testid="menu-logout">Sign Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="text-on-surface-variant hover:text-primary text-sm font-medium transition-colors hidden md:block" data-testid="nav-login-btn">Sign In</button>
              <button onClick={() => navigate('/signup')} className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2 rounded-xl font-bold text-sm ease-out-expo duration-300 active:scale-95" data-testid="nav-signup-btn">Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* Side Navigation (Desktop - authenticated pages) */}
      {showSidebar && (
        <aside className="hidden md:flex flex-col p-6 gap-2 h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/20 bg-surface z-40 pt-24">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/20 text-primary font-bold text-sm">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">{user.first_name} {user.last_name}</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{user.subscription_status === 'active' ? 'Elite Tier' : 'Free Tier'}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1 flex-grow">
            {sideNavLinks.map((link, i) => {
              const active = isActive(link.path) && !link.hash;
              return (
                <Link
                  key={i}
                  to={link.hash ? `${link.path}?tab=${link.hash}` : link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl ease-out-expo transition-transform duration-300 hover:translate-x-1 ${active ? 'text-primary bg-surface-variant font-bold shadow-[0_0_20px_rgba(76,215,246,0.1)]' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  data-testid={`sidenav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <MIcon icon={link.icon} size="text-xl" />
                  <span className="text-sm">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <button onClick={() => navigate('/dashboard?tab=scores')} className="mt-auto w-full py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl active:scale-95 transition-all" data-testid="sidebar-enter-score">
            Enter Score
          </button>
        </aside>
      )}

      {/* Main Content */}
      <main className={`pt-20 ${showSidebar ? 'md:ml-64' : ''}`}>
        {children}
      </main>

      {/* Mobile Bottom Nav (authenticated pages) */}
      {showSidebar && (
        <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-surface/80 backdrop-blur-2xl rounded-t-3xl z-50 border-t border-outline-variant/20 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
          <Link to="/dashboard" className={`flex flex-col items-center justify-center p-2 min-w-[64px] ${isActive('/dashboard') ? 'bg-gradient-to-br from-primary to-primary-container text-surface rounded-2xl' : 'text-on-surface-variant hover:text-primary'} active:scale-90 duration-200`} data-testid="mobile-nav-dashboard">
            <MIcon icon="dashboard" size="text-xl" />
            <span className="text-[10px] font-semibold uppercase tracking-widest mt-1">Dashboard</span>
          </Link>
          <Link to="/charities" className={`flex flex-col items-center justify-center p-2 min-w-[64px] ${isActive('/charities') ? 'bg-gradient-to-br from-primary to-primary-container text-surface rounded-2xl' : 'text-on-surface-variant hover:text-primary'} active:scale-90 duration-200`} data-testid="mobile-nav-charity">
            <MIcon icon="volunteer_activism" size="text-xl" />
            <span className="text-[10px] font-semibold uppercase tracking-widest mt-1">Charities</span>
          </Link>
          <Link to="/leaderboard" className={`flex flex-col items-center justify-center p-2 min-w-[64px] ${isActive('/leaderboard') ? 'bg-gradient-to-br from-primary to-primary-container text-surface rounded-2xl' : 'text-on-surface-variant hover:text-primary'} active:scale-90 duration-200`} data-testid="mobile-nav-leaderboard">
            <MIcon icon="leaderboard" size="text-xl" />
            <span className="text-[10px] font-semibold uppercase tracking-widest mt-1">Leaderboard</span>
          </Link>
        </nav>
      )}

      {/* Footer */}
      <footer className={`w-full py-12 px-8 bg-surface border-t border-outline-variant/10 ${showSidebar ? 'md:ml-64' : ''} ${showSidebar ? 'pb-32 md:pb-12' : ''}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
          <div className="text-xs text-on-surface-variant">&copy; 2026 The Kinetic. Engineering Change.</div>
          <div className="flex flex-wrap justify-center gap-8">
            <a href="#" className="text-xs text-on-surface-variant hover:text-white underline decoration-primary opacity-80 hover:opacity-100 transition-all">Terms</a>
            <a href="#" className="text-xs text-on-surface-variant hover:text-white underline decoration-primary opacity-80 hover:opacity-100 transition-all">Privacy</a>
            <a href="#" className="text-xs text-on-surface-variant hover:text-white underline decoration-primary opacity-80 hover:opacity-100 transition-all">FAQ</a>
            <a href="#" className="text-xs text-on-surface-variant hover:text-white underline decoration-primary opacity-80 hover:opacity-100 transition-all">Impact Stats</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
