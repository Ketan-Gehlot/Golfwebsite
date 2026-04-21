import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getScores, getMyCharity, getCharities, setMyCharity, getMyWinnings } from '../lib/api';
import { MIcon } from '../components/MIcon';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.19, 1, 0.22, 1] }
  })
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [winnings, setWinnings] = useState(null);
  const [myCharity, setMyCharityData] = useState(null);
  const [charities, setCharitiesList] = useState([]);
  const [charityId, setCharityId] = useState('');
  const [contribPct, setContribPct] = useState('10');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [scoresRes, winRes, charityRes, charitiesRes] = await Promise.all([
        getScores(), getMyWinnings(), getMyCharity().catch(() => null), getCharities()
      ]);
      setScores(scoresRes.data.scores || []);
      setWinnings(winRes.data);
      if (charityRes?.data && !charityRes.data.message) setMyCharityData(charityRes.data);
      setCharitiesList(charitiesRes.data.charities || []);
    } catch {}
  };

  const handleSetCharity = async () => {
    if (!charityId) return alert('Select a charity');
    try {
      await setMyCharity({ charity_id: charityId, contribution_percentage: parseFloat(contribPct) });
      const res = await getMyCharity();
      if (res.data && !res.data.message) setMyCharityData(res.data);
      alert('Charity settings successfully updated!');
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const subActive = user?.subscription_status === 'active';

  return (
    <div className="pt-10 pb-32 px-6 md:px-12 max-w-7xl mx-auto overflow-x-hidden">
      {/* Welcome Header */}
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-2" data-testid="dashboard-title">Impact Dashboard</h1>
        <p className="text-on-surface-variant max-w-xl">Track your kinetic contribution and manage your golf performance through the elite philanthropy network.</p>
      </header>

      {/* Subscription Alert */}
      {!subActive && (
        <div className="mb-8 p-6 rounded-2xl bg-surface-container-high border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MIcon icon="info" className="text-primary" />
            <div>
              <p className="font-bold text-on-surface">Subscription Required</p>
              <p className="text-sm text-on-surface-variant">Subscribe to enter scores and join draws.</p>
            </div>
          </div>
          <button onClick={() => navigate('/subscription')} className="px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl active:scale-95 transition-all" data-testid="dashboard-subscribe-btn">Subscribe Now</button>
        </div>
      )}

      {/* Bento Grid Layout */}
      <motion.div className="grid grid-cols-1 md:grid-cols-12 gap-6" initial="hidden" animate="visible" variants={stagger}>

        {/* Subscription & Status */}
        <motion.section variants={fadeUp} className="md:col-span-8 bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10 relative overflow-hidden group" data-testid="subscription-card">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${subActive ? 'bg-primary/20 text-primary' : 'bg-error/20 text-error'}`}>
                  {subActive ? 'Active Subscription' : 'No Subscription'}
                </span>
                {user?.subscription_end_date && <span className="text-on-surface-variant text-xs">Renews {new Date(user.subscription_end_date).toLocaleDateString()}</span>}
              </div>
              <h2 className="text-3xl font-bold mb-2">{subActive ? `${user?.subscription_plan === 'yearly' ? 'Yearly' : 'Monthly'} Impact Plan` : 'No Active Plan'}</h2>
              <p className="text-on-surface-variant text-sm">Accelerate your contribution to global initiatives.</p>
            </div>
            {!subActive ? (
              <button onClick={() => navigate('/subscription')} className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-black rounded-2xl shadow-lg shadow-primary/10 active:scale-95 transition-all" data-testid="upgrade-btn">Subscribe</button>
            ) : (
              <button onClick={() => navigate('/subscription')} className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-black rounded-2xl shadow-lg shadow-primary/10 active:scale-95 transition-all">Upgrade</button>
            )}
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-outline-variant/10">
            <div><p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Total Won</p><p className="text-2xl font-bold text-on-surface">${winnings?.total_won?.toFixed(2) || '0.00'}</p></div>
            <div><p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Status</p><p className={`text-2xl font-bold ${winnings?.paid_out > 0 ? 'text-primary' : 'text-on-surface-variant'}`}>{winnings?.paid_out > 0 ? 'Paid' : 'None'}</p></div>
            <div><p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Draws Entered</p><p className="text-2xl font-bold text-on-surface">{winnings?.entries?.length || 0}</p></div>
            <div><p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Scores</p><p className="text-2xl font-bold text-tertiary">{scores.length}/5</p></div>
          </div>
        </motion.section>

        {/* Charity Profile */}
        <motion.section variants={fadeUp} className="md:col-span-4 bg-surface-container-high rounded-[2rem] p-8 border border-outline-variant/10 flex flex-col justify-between overflow-hidden relative" data-testid="charity-card">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-surface-container-highest rounded-2xl">
                <MIcon icon="volunteer_activism" className="text-tertiary" />
              </div>
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">{myCharity ? `${myCharity.contribution_percentage}% Contributor` : 'Select Charity'}</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface">{myCharity?.charity_name || 'No Charity Selected'}</h3>
            <p className="text-on-surface-variant text-sm mt-2">{myCharity ? `${myCharity.contribution_percentage}% of every subscription goes to this cause.` : 'Choose a charity to start your impact journey.'}</p>
          </div>
          <div className="relative z-10 mt-8">
            {!myCharity && (
              <button onClick={() => navigate('/charities')} className="w-full py-3 bg-surface-container-highest text-primary rounded-xl font-bold hover:bg-surface-bright transition-colors" data-testid="select-charity-btn">Choose Charity</button>
            )}
            {myCharity && (
              <>
                <div className="w-full bg-surface-container-highest h-2 rounded-full mb-2">
                  <div className="bg-tertiary h-full rounded-full" style={{ width: `${myCharity.contribution_percentage}%` }} />
                </div>
                <p className="text-[10px] text-on-surface-variant font-medium uppercase">Contributing to {myCharity.charity_name}</p>
              </>
            )}
          </div>
        </motion.section>

        {/* Charity Selection (full width) */}
        <motion.section variants={fadeUp} className="md:col-span-12 bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10" data-testid="charity-selection-section">
          <h3 className="text-xl font-bold mb-6">Choose Your Charity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Charity</label>
              <select value={charityId} onChange={(e) => setCharityId(e.target.value)} className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/30" data-testid="charity-select">
                <option value="">Select a charity...</option>
                {charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Contribution % (min 10%)</label>
              <input type="number" min="10" max="100" value={contribPct} onChange={(e) => setContribPct(e.target.value)} className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/30" data-testid="contribution-input" />
            </div>
            <div className="flex items-end">
              <button onClick={handleSetCharity} className="w-full py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl active:scale-95 transition-all" data-testid="save-charity-btn">
                Save Selection
              </button>
            </div>
          </div>
        </motion.section>

      </motion.div>
    </div>
  );
}
