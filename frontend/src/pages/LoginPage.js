import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as loginApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

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
    setError('');
    setLoading(true);
    try {
      const res = await loginApi({ email, password });
      loginUser(res.data.token, res.data.user);
      if (res.data.user.is_admin) navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

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
            Welcome<br /><span className="text-primary">Back</span>
          </h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div data-testid="login-error" className="p-3 border border-destructive/30 bg-destructive/10 text-destructive text-sm rounded-sm">
              {error}
            </div>
          )}
          <div>
            <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
            <Input
              data-testid="login-email-input"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 bg-secondary/50 border-border/50 focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
            <div className="relative mt-1">
              <Input
                data-testid="login-password-input"
                id="password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-secondary/50 border-border/50 focus:border-primary pr-10"
                placeholder="Enter password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button
            data-testid="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full gold-glow py-5 font-medium active:scale-95 transition-transform"
          >
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <p className="mt-8 text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" data-testid="goto-signup-link" className="text-primary hover:underline">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
