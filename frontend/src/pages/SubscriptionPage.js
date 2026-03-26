import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPlans, createCheckout, checkPaymentStatus } from '../lib/api';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Loader2, Crown } from 'lucide-react';

export default function SubscriptionPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    getPlans().then(res => setPlans(res.data.plans)).catch(() => {});
  }, []);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      pollPayment(sessionId);
    }
  }, [searchParams]);

  const pollPayment = async (sessionId, attempt = 0) => {
    if (attempt >= 6) {
      setPolling(false);
      return;
    }
    setPolling(true);
    try {
      const res = await checkPaymentStatus(sessionId);
      if (res.data.payment_status === 'paid') {
        await refreshUser();
        setPolling(false);
        navigate('/dashboard');
        return;
      }
      if (res.data.status === 'expired') {
        setPolling(false);
        return;
      }
      setTimeout(() => pollPayment(sessionId, attempt + 1), 2000);
    } catch {
      setTimeout(() => pollPayment(sessionId, attempt + 1), 2000);
    }
  };

  const handleSubscribe = async (planId) => {
    setLoading(planId);
    try {
      const origin = window.location.origin;
      const res = await createCheckout({ plan_id: planId, origin_url: origin });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  if (polling) {
    return (
      <div className="min-h-screen animated-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground font-serif text-2xl mb-2">Processing Payment</p>
          <p className="text-muted-foreground text-sm">Please wait while we confirm your subscription...</p>
        </div>
      </div>
    );
  }

  if (user?.subscription_status === 'active') {
    return (
      <div className="min-h-screen animated-gradient-bg flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-4xl text-foreground mb-4">You're Subscribed</h1>
          <p className="text-muted-foreground mb-8">Your {user.subscription_plan} plan is active. Head to your dashboard to start entering scores and draws.</p>
          <Button data-testid="goto-dashboard-btn" onClick={() => navigate('/dashboard')} className="gold-glow px-8 py-5">
            Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    );
  }

  const features = [
    'Enter golf scores & join monthly draws',
    'Support a charity of your choice',
    'Win from the monthly prize pool',
    'Jackpot rolls over if unclaimed',
    'Access to full dashboard & stats',
  ];

  return (
    <div className="min-h-screen animated-gradient-bg py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 max-w-xl">
          <p className="uppercase tracking-[0.2em] text-xs text-primary mb-4">Choose Your Plan</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-light tracking-tighter text-foreground mb-4">
            Subscribe &<br /><span className="text-primary">Start Playing</span>
          </h1>
          <p className="text-muted-foreground">Select a plan to unlock score entry, monthly draws, and charitable giving.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`p-8 border transition-all hover:-translate-y-1 ${plan.id === 'yearly' ? 'border-primary/40 relative' : 'border-border/50'}`}
            >
              {plan.savings && (
                <span className="absolute -top-3 left-6 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium">
                  {plan.savings}
                </span>
              )}
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-serif text-5xl text-foreground">${plan.amount}</span>
                <span className="text-muted-foreground text-sm">/{plan.interval}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                data-testid={`subscribe-${plan.id}-btn`}
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-5 gold-glow active:scale-95 transition-transform ${plan.id === 'yearly' ? '' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                variant={plan.id === 'yearly' ? 'default' : 'secondary'}
              >
                {loading === plan.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading === plan.id ? 'Redirecting...' : 'Subscribe'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
