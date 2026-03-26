import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Menu, X, LogOut, User, Shield } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../components/ui/dropdown-menu';

export default function Layout({ children }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const isAuth = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuth) return <>{children}</>;

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between h-16">
          <Link to="/" className="text-primary font-serif text-xl tracking-tight" data-testid="nav-logo">
            GolfCharity
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" active={isActive('/')} label="Home" />
            <NavLink to="/charities" active={isActive('/charities')} label="Charities" />
            {user && <NavLink to="/dashboard" active={isActive('/dashboard')} label="Dashboard" />}
            {user?.is_admin && <NavLink to="/admin" active={isActive('/admin')} label="Admin" />}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button data-testid="user-menu-btn" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-xs font-medium">{user.first_name?.[0]}{user.last_name?.[0]}</span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm text-foreground font-medium">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem data-testid="menu-dashboard" onClick={() => navigate('/dashboard')} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" /> Dashboard
                  </DropdownMenuItem>
                  {user.is_admin && (
                    <DropdownMenuItem data-testid="menu-admin" onClick={() => navigate('/admin')} className="cursor-pointer">
                      <Shield className="h-4 w-4 mr-2" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem data-testid="menu-logout" onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button data-testid="nav-login-btn" variant="ghost" onClick={() => navigate('/login')} className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
                <Button data-testid="nav-signup-btn" onClick={() => navigate('/signup')} className="gold-glow active:scale-95 px-6">
                  Subscribe
                </Button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button data-testid="mobile-menu-toggle" className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-2">
            <MobileLink to="/" label="Home" onClick={() => setMobileOpen(false)} />
            <MobileLink to="/charities" label="Charities" onClick={() => setMobileOpen(false)} />
            {user && <MobileLink to="/dashboard" label="Dashboard" onClick={() => setMobileOpen(false)} />}
            {user?.is_admin && <MobileLink to="/admin" label="Admin" onClick={() => setMobileOpen(false)} />}
            {user ? (
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left py-2 text-destructive text-sm">
                Sign Out
              </button>
            ) : (
              <>
                <MobileLink to="/login" label="Sign In" onClick={() => setMobileOpen(false)} />
                <MobileLink to="/signup" label="Subscribe" onClick={() => setMobileOpen(false)} />
              </>
            )}
          </div>
        )}
      </nav>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="font-serif text-xl text-primary mb-2">GolfCharity</p>
            <p className="text-sm text-muted-foreground max-w-xs">Play golf, win prizes, and support charities. A platform where your passion creates real impact.</p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Platform</p>
              <div className="space-y-2">
                <FooterLink to="/" label="Home" />
                <FooterLink to="/charities" label="Charities" />
                <FooterLink to="/subscription" label="Subscribe" />
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Account</p>
              <div className="space-y-2">
                <FooterLink to="/login" label="Sign In" />
                <FooterLink to="/signup" label="Create Account" />
                <FooterLink to="/dashboard" label="Dashboard" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-border/30">
          <p className="text-xs text-muted-foreground">&copy; 2026 GolfCharity Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, active, label }) {
  return (
    <Link to={to} className={`text-sm transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} data-testid={`nav-${label.toLowerCase()}`}>
      {label}
    </Link>
  );
}

function MobileLink({ to, label, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="block py-2 text-sm text-muted-foreground hover:text-foreground">
      {label}
    </Link>
  );
}

function FooterLink({ to, label }) {
  return (
    <Link to={to} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
      {label}
    </Link>
  );
}
