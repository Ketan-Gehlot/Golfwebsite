import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPlans, createCheckout, checkPaymentStatus } from '../lib/api';
import { MIcon } from '../components/MIcon';

export default function SubscriptionPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(null);
  const [polling, setPolling] = useState(false);

  // Fetch plans on mount (not used for rendering, but validates backend connectivity)
  useEffect(() => { getPlans().catch(() => {}); }, []);

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

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) pollPayment(sessionId);
  }, [searchParams, pollPayment]);

  const handleSubscribe = async (planId) => {
    setLoading(planId);
    try {
      const origin = window.location.origin;
      const res = await createCheckout({ plan_id: planId, origin_url: origin });
      if (res.data.url) window.location.href = res.data.url;
    } catch (err) { console.error(err); }
    finally { setLoading(null); }
  };

  /* ---------- LOADING / POLLING STATE ---------- */
  if (polling) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-on-surface mb-2">Processing Payment</h2>
          <p className="text-on-surface-variant text-sm">Please wait while we confirm your subscription…</p>
        </div>
      </div>
    );
  }

  /* ---------- ALREADY SUBSCRIBED ---------- */
  if (user?.subscription_status === 'active') {
    return (
      <div className="pt-10 pb-20 px-6 max-w-xl mx-auto text-center">
        <MIcon icon="verified" className="text-primary mx-auto mb-4" size="text-5xl" />
        <h1 className="text-3xl font-bold text-on-surface mb-3 font-headline">You're Subscribed</h1>
        <p className="text-on-surface-variant text-sm mb-8">Your <span className="font-bold text-primary capitalize">{user.subscription_plan}</span> plan is active.</p>
        <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold rounded-xl shadow-lg text-sm" data-testid="goto-dashboard-btn">
          Go to Dashboard
        </button>
      </div>
    );
  }

  /* ---------- 3-TIER PLAN DATA ---------- */
  const tiers = [
    {
      id: 'free',
      name: 'Explorer',
      tagline: 'Discover the platform',
      price: 'Free',
      sub: 'No card required',
      icon: 'explore',
      accent: 'on-surface-variant',
      perks: [
        { icon: 'visibility', text: 'Browse the full charity directory' },
        { icon: 'leaderboard', text: 'View public leaderboards' },
        { icon: 'info', text: 'Learn about our mission & impact' },
      ],
      excluded: ['Monthly draw entries', 'Score tracking', 'Charity allocation', 'Prize eligibility'],
      cta: 'Explore Free',
      ctaAction: () => navigate('/charities'),
      ctaStyle: 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container',
    },
    {
      id: 'monthly',
      name: 'Pro',
      tagline: 'Fuel the mission monthly',
      price: '$9.99',
      sub: 'per month — cancel anytime',
      icon: 'bolt',
      accent: 'primary',
      perks: [
        { icon: 'casino', text: '1 monthly draw entry' },
        { icon: 'edit_note', text: 'Track up to 5 Stableford rounds' },
        { icon: 'volunteer_activism', text: 'Choose & fund your charity (10%+)' },
        { icon: 'bar_chart', text: 'Monthly impact reports' },
        { icon: 'leaderboard', text: 'Community leaderboard access' },
        { icon: 'support_agent', text: 'Priority email support' },
      ],
      excluded: ['Bonus draw entries', 'Elite leaderboard tier'],
      cta: 'Start Pro Plan',
      ctaAction: () => handleSubscribe('monthly'),
      ctaStyle: 'bg-gradient-to-br from-primary to-primary-container text-on-primary-container shadow-md',
    },
    {
      id: 'yearly',
      name: 'Elite',
      tagline: 'Maximum impact — save 17%',
      price: '$99.99',
      sub: 'per year — 2 months free',
      icon: 'diamond',
      accent: 'tertiary',
      popular: true,
      perks: [
        { icon: 'casino', text: '3 monthly draw entries' },
        { icon: 'edit_note', text: 'Track up to 5 Stableford rounds' },
        { icon: 'volunteer_activism', text: 'Choose & fund your charity (10%+)' },
        { icon: 'bar_chart', text: 'Monthly impact reports' },
        { icon: 'leaderboard', text: 'Elite tier on leaderboard' },
        { icon: 'support_agent', text: 'Priority email support' },
        { icon: 'workspace_premium', text: 'Exclusive Elite badge on profile' },
        { icon: 'redeem', text: '2 months free vs monthly plan' },
      ],
      excluded: [],
      cta: 'Go Elite — Save 17%',
      ctaAction: () => handleSubscribe('yearly'),
      ctaStyle: 'bg-gradient-to-br from-tertiary to-tertiary-container text-on-tertiary-container shadow-lg',
    },
  ];

  return (
    <div className="pt-6 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-secondary-container/30 border border-outline-variant/20 px-3 py-1 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-on-secondary-container font-bold">Membership</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-on-surface font-headline mb-2">Choose Your Impact Level</h1>
        <p className="text-on-surface-variant text-sm max-w-md mx-auto">Every paid plan funds charities & enters you into monthly prize draws. Upgrade or cancel anytime.</p>
      </div>

      {/* 3-Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative flex flex-col rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
              tier.popular
                ? 'bg-surface-container-highest border-tertiary/30 shadow-[0_16px_48px_rgba(255,185,95,0.08)]'
                : 'bg-surface-container-low border-outline-variant/15 hover:border-outline-variant/30'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-tertiary text-on-tertiary px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">
                Most Popular
              </div>
            )}

            {/* Icon + Name */}
            <div className={`w-9 h-9 rounded-lg bg-${tier.accent}/10 flex items-center justify-center mb-3`}>
              <MIcon icon={tier.icon} className={`text-${tier.accent}`} size="text-lg" />
            </div>
            <h3 className="text-base font-bold text-on-surface">{tier.name}</h3>
            <p className="text-[11px] text-on-surface-variant mb-3">{tier.tagline}</p>

            {/* Price */}
            <div className="mb-4">
              <span className="text-3xl font-bold text-on-surface font-headline">{tier.price}</span>
              <div className="text-[11px] text-on-surface-variant mt-0.5">{tier.sub}</div>
            </div>

            {/* Perks */}
            <ul className="space-y-2 mb-5 flex-1">
              {tier.perks.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <MIcon icon={p.icon} className={`text-${tier.accent} mt-0.5 flex-shrink-0`} size="text-sm" />
                  <span className="text-xs text-on-surface leading-snug">{p.text}</span>
                </li>
              ))}
              {tier.excluded.map((t, i) => (
                <li key={`x-${i}`} className="flex items-start gap-2 opacity-35">
                  <MIcon icon="close" className="text-on-surface-variant mt-0.5 flex-shrink-0" size="text-sm" />
                  <span className="text-xs text-on-surface-variant line-through leading-snug">{t}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={tier.ctaAction}
              disabled={loading === tier.id}
              className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all active:scale-95 ${tier.ctaStyle}`}
              data-testid={`subscribe-${tier.id}-btn`}
            >
              {loading === tier.id ? 'Redirecting…' : tier.cta}
            </button>
          </div>
        ))}
      </div>

      {/* What You Get */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-on-surface mb-5 text-center font-headline">What Every Subscriber Gets</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: 'casino', title: 'Monthly Draws', desc: 'Your 5 latest golf scores become your lottery numbers. Match 3+ to win.' },
            { icon: 'volunteer_activism', title: 'Direct to Charity', desc: '10%+ of every subscription goes straight to your chosen charity partner.' },
            { icon: 'query_stats', title: 'Score Tracking', desc: 'Log up to 5 Stableford rounds and watch your game improve over time.' },
            { icon: 'emoji_events', title: 'Jackpot Rollover', desc: "No 5-number match? The jackpot rolls over and grows each month." },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/10">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <MIcon icon={item.icon} className="text-primary" size="text-base" />
              </div>
              <h4 className="text-xs font-bold text-on-surface mb-1">{item.title}</h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prize Tiers */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-on-surface mb-5 text-center font-headline">Prize Pool Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { match: '5 Numbers', share: '40%', label: 'Jackpot', accent: 'primary', icon: 'emoji_events', tag: 'ROLLOVER' },
            { match: '4 Numbers', share: '35%', label: 'Major Prize', accent: 'tertiary', icon: 'military_tech' },
            { match: '3 Numbers', share: '25%', label: 'Winner', accent: 'secondary', icon: 'workspace_premium' },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/10">
              <div className={`w-10 h-10 rounded-lg bg-${t.accent}/10 flex items-center justify-center flex-shrink-0`}>
                <MIcon icon={t.icon} className={`text-${t.accent}`} size="text-lg" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface">{t.match}</span>
                  {t.tag && <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">{t.tag}</span>}
                </div>
                <div className="text-[11px] text-on-surface-variant">{t.label} — {t.share} of pool</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Bar */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-5 text-on-surface-variant text-[11px]">
          <span className="flex items-center gap-1"><MIcon icon="lock" size="text-sm" /> Secure Payments</span>
          <span className="flex items-center gap-1"><MIcon icon="autorenew" size="text-sm" /> Cancel Anytime</span>
          <span className="flex items-center gap-1"><MIcon icon="verified" size="text-sm" /> Verified Charities</span>
        </div>
      </div>
    </div>
  );
}
