import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signup as signupApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signupApi(form);
      loginUser(res.data.token, res.data.user);
      navigate('/subscription');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen animated-gradient-bg flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-10">
          <Link to="/" className="text-primary font-serif text-2xl tracking-tight">GolfCharity</Link>
          <h1 className="font-serif text-4xl sm:text-5xl font-light tracking-tighter text-foreground mt-8 mb-2">
            Join the<br /><span className="text-primary">Movement</span>
          </h1>
          <p className="text-sm text-muted-foreground">Create your account and start making a difference</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div data-testid="signup-error" className="p-3 border border-destructive/30 bg-destructive/10 text-destructive text-sm rounded-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" className="text-sm text-muted-foreground">First Name</Label>
              <Input data-testid="signup-firstname-input" id="first_name" value={form.first_name} onChange={update('first_name')} required className="mt-1 bg-secondary/50 border-border/50" placeholder="John" />
            </div>
            <div>
              <Label htmlFor="last_name" className="text-sm text-muted-foreground">Last Name</Label>
              <Input data-testid="signup-lastname-input" id="last_name" value={form.last_name} onChange={update('last_name')} required className="mt-1 bg-secondary/50 border-border/50" placeholder="Doe" />
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
            <Input data-testid="signup-email-input" id="email" type="email" value={form.email} onChange={update('email')} required className="mt-1 bg-secondary/50 border-border/50" placeholder="you@example.com" />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
            <div className="relative mt-1">
              <Input data-testid="signup-password-input" id="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={update('password')} required className="bg-secondary/50 border-border/50 pr-10" placeholder="Min. 6 characters" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button data-testid="signup-submit-btn" type="submit" disabled={loading} className="w-full gold-glow py-5 font-medium active:scale-95 transition-transform">
            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <p className="mt-8 text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" data-testid="goto-login-link" className="text-primary hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
