import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signup as signupApi } from '../lib/api';
import { MIcon } from '../components/MIcon';

export default function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await signupApi(form);
      loginUser(res.data.token, res.data.user);
      navigate('/subscription');
    } catch (err) { setError(err.response?.data?.detail || 'Signup failed'); }
    finally { setLoading(false); }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-primary block mb-12" data-testid="nav-logo">The Kinetic</Link>
        <div className="inline-flex items-center gap-2 bg-secondary-container/30 border border-outline-variant/20 px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-on-secondary-container">Join the Movement</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-on-surface mb-2">Start Your<br/><span className="text-primary">Impact</span></h1>
        <p className="text-on-surface-variant mb-10">Create your account and make a difference</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div data-testid="signup-error" className="p-4 rounded-xl bg-error-container/20 border border-error/20 text-error text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">First Name</label>
              <input data-testid="signup-firstname-input" value={form.first_name} onChange={update('first_name')} required className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/30" placeholder="John" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Last Name</label>
              <input data-testid="signup-lastname-input" value={form.last_name} onChange={update('last_name')} required className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/30" placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Email</label>
            <input data-testid="signup-email-input" type="email" value={form.email} onChange={update('email')} required className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/30" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <input data-testid="signup-password-input" type={showPw ? 'text' : 'password'} value={form.password} onChange={update('password')} required className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 pr-12" placeholder="Min. 6 characters" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                <MIcon icon={showPw ? 'visibility_off' : 'visibility'} size="text-xl" />
              </button>
            </div>
          </div>
          <button data-testid="signup-submit-btn" type="submit" disabled={loading}
            className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold rounded-xl shadow-[0_0_40px_rgba(76,215,246,0.2)] hover:scale-[1.02] transition-transform ease-out-expo active:scale-95 disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-8 text-sm text-on-surface-variant">Already have an account? <Link to="/login" data-testid="goto-login-link" className="text-primary hover:underline font-bold">Sign in</Link></p>
      </div>
    </div>
  );
}
