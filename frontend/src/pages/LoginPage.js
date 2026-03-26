import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as loginApi } from '../lib/api';
import { MIcon } from '../components/MIcon';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await loginApi({ email, password });
      loginUser(res.data.token, res.data.user);
      navigate(res.data.user.is_admin ? '/admin' : '/dashboard');
    } catch (err) { setError(err.response?.data?.detail || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-primary block mb-12" data-testid="nav-logo">The Kinetic</Link>
        <div className="inline-flex items-center gap-2 bg-secondary-container/30 border border-outline-variant/20 px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-on-secondary-container">Member Access</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-on-surface mb-2">Welcome<br/><span className="text-primary">Back</span></h1>
        <p className="text-on-surface-variant mb-10">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div data-testid="login-error" className="p-4 rounded-xl bg-error-container/20 border border-error/20 text-error text-sm">{error}</div>}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Email</label>
            <input data-testid="login-email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-4 text-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/30 transition-all" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <input data-testid="login-password-input" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-4 text-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/30 transition-all pr-12" placeholder="Enter password" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                <MIcon icon={showPw ? 'visibility_off' : 'visibility'} size="text-xl" />
              </button>
            </div>
          </div>
          <button data-testid="login-submit-btn" type="submit" disabled={loading}
            className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold rounded-xl shadow-[0_0_40px_rgba(76,215,246,0.2)] hover:scale-[1.02] transition-transform ease-out-expo active:scale-95 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-8 text-sm text-on-surface-variant">Don't have an account? <Link to="/signup" data-testid="goto-signup-link" className="text-primary hover:underline font-bold">Create one</Link></p>
      </div>
    </div>
  );
}
