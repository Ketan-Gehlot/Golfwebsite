import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPlans, createCheckout, checkPaymentStatus } from '../lib/api';
import { MIcon } from '../components/MIcon';

export default function SubscriptionPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => { getPlans().then(res => setPlans(res.data.plans)).catch(() => {}); }, []);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) pollPayment(sessionId);
  }, [searchParams, pollPayment]);

  const pollPayment = useCallback(async (sessionId, attempt = 0) => {
    if (attempt >= 6) { setPolling(false); return; }
    setPolling(true);
    try {
      const res = await checkPaymentStatus(sessionId);
      if (res.data.payment_status === 'paid') { await refreshUser(); setPolling(false); navigate('/dashboard'); return; }
      if (res.data.status === 'expired') { setPolling(false); return; }
      setTimeout(() => pollPayment(sessionId, attempt + 1), 2000);
    } catch { setTimeout(() => pollPayment(sessionId, attempt + 1), 2000); }
  }, [refreshUser, navigate]);

  const handleSubscribe = async (planId) => {
    setLoading(planId);
    try {
      const origin = window.location.origin;
      const res = await createCheckout({ plan_id: planId, origin_url: origin });
      if (res.data.url) window.location.href = res.data.url;
    } catch (err) { console.error(err); }
    finally { setLoading(null); }
  };

  if (polling) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-on-surface mb-3">Processing Payment</h2>
          <p className="text-on-surface-variant">Please wait while we confirm your subscription...</p>
        </div>
      </div>
    );
  }

  if (user?.subscription_status === 'active') {
    return (
      <div className="pt-10 pb-32 px-6 md:px-12 max-w-3xl mx-auto text-center">
        <MIcon icon="verified" className="text-primary text-6xl mx-auto mb-6" size="text-6xl" />
        <h1 className="text-4xl font-bold text-on-surface mb-4">You're Subscribed</h1>
        <p className="text-on-surface-variant mb-8">Your {user.subscription_plan} plan is active. Head to your dashboard.</p>
        <button onClick={() => navigate('/dashboard')} className="px-10 py-5 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold rounded-xl shadow-lg" data-testid="goto-dashboard-btn">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const features = {
    monthly: ['1 Monthly Draw Entry', 'Performance Score Tracking', 'Monthly Impact Reports'],
    yearly: ['3 Monthly Draw Entries', 'Elite Tier Leaderboard Access', 'Direct Charity Selection Control'],
  };

  return (
    <div className="pt-10 pb-32 px-6 md:px-12 max-w-5xl mx-auto text-center">
      <h2 className="text-4xl font-bold mb-4 text-on-surface">Choose Your Impact Level</h2>
      <p className="text-on-surface-variant mb-16">Select the plan that aligns with your passion and purpose.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan) => {
          const isYearly = plan.id === 'yearly';
          return (
            <div key={plan.id} className={`${isYearly ? 'relative bg-surface-container-highest shadow-[0_40px_100px_rgba(76,215,246,0.15)] border-primary/20' : 'bg-surface-container-low border-outline-variant/10'} p-12 rounded-[2.5rem] border hover:scale-[1.02] transition-transform ease-out-expo`}>
              {isYearly && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary-container px-6 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Best Value</div>}
              <div className="text-on-surface-variant font-label uppercase tracking-widest mb-4">{isYearly ? 'Elite Kinetic' : 'Standard Kinetic'}</div>
              <div className="text-6xl font-bold mb-4">${plan.amount}<span className="text-xl text-on-surface-variant font-normal">/{plan.interval === 'year' ? 'yr' : 'mo'}</span></div>
              <p className="text-on-surface-variant mb-8">{isYearly ? 'Maximum impact, 2 months free.' : 'Fuel the mission monthly.'}</p>
              <ul className="space-y-4 mb-12 text-left">
                {(features[plan.id] || features.monthly).map((f) => (
                  <li key={f} className="flex items-center gap-3"><MIcon icon="check" className="text-primary" size="text-xl" /> {f}</li>
                ))}
              </ul>
              <button onClick={() => handleSubscribe(plan.id)} disabled={loading === plan.id}
                className={`w-full py-4 rounded-xl font-bold transition-colors ${isYearly ? 'bg-gradient-to-br from-primary to-primary-container text-on-primary-container shadow-lg' : 'border border-primary text-primary hover:bg-primary/10'}`}
                data-testid={`subscribe-${plan.id}-btn`}>
                {loading === plan.id ? 'Redirecting...' : isYearly ? 'Start Yearly Impact' : 'Select Monthly'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
