import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getScores, addScore, deleteScore, getMyCharity, getCharities, setMyCharity, getDraws, enterDraw, getMyWinnings, submitVerification, cancelSubscription } from '../lib/api';
import { MIcon } from '../components/MIcon';

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [scores, setScores] = useState([]);
  const [draws, setDraws] = useState([]);
  const [winnings, setWinnings] = useState(null);
  const [myCharity, setMyCharityData] = useState(null);
  const [charities, setCharitiesList] = useState([]);
  const [scoreInputs, setScoreInputs] = useState(['', '', '', '', '']);
  const [scoreDate, setScoreDate] = useState('');
  const [charityId, setCharityId] = useState('');
  const [contribPct, setContribPct] = useState('10');
  const [proofUrl, setProofUrl] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveSection(tab);
    loadData();
  }, [searchParams]);

  const loadData = async () => {
    try {
      const [scoresRes, drawsRes, winRes, charityRes, charitiesRes] = await Promise.all([
        getScores(), getDraws(), getMyWinnings(), getMyCharity().catch(() => null), getCharities()
      ]);
      setScores(scoresRes.data.scores || []);
      setDraws(drawsRes.data.draws || []);
      setWinnings(winRes.data);
      if (charityRes?.data && !charityRes.data.message) setMyCharityData(charityRes.data);
      setCharitiesList(charitiesRes.data.charities || []);
    } catch {}
  };

  const handleAddScore = async (e) => {
    e.preventDefault();
    if (!scoreDate) return alert('Please select a date');
    const validScores = scoreInputs.filter(s => s !== '' && parseInt(s) >= 1 && parseInt(s) <= 45);
    if (validScores.length === 0) return alert('Enter at least one score (1-45)');
    try {
      for (const s of validScores) {
        await addScore({ score: parseInt(s), score_date: scoreDate });
      }
      setScoreInputs(['', '', '', '', '']);
      setScoreDate('');
      const res = await getScores();
      setScores(res.data.scores || []);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add score');
    }
  };

  const handleDeleteScore = async (id) => {
    try { await deleteScore(id); const res = await getScores(); setScores(res.data.scores || []); } catch {}
  };

  const handleSetCharity = async () => {
    if (!charityId) return alert('Select a charity');
    try {
      await setMyCharity({ charity_id: charityId, contribution_percentage: parseFloat(contribPct) });
      const res = await getMyCharity();
      if (res.data && !res.data.message) setMyCharityData(res.data);
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handleEnterDraw = async (drawId) => {
    try { await enterDraw(drawId); alert('Successfully entered draw!'); loadData(); } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handleVerify = async (entryId) => {
    try { await submitVerification(entryId, { proof_url: proofUrl }); alert('Verification submitted!'); loadData(); } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handleCancelSub = async () => {
    if (window.confirm('Cancel subscription?')) { await cancelSubscription(); await refreshUser(); }
  };

  const subActive = user?.subscription_status === 'active';

  return (
    <div className="pt-10 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Subscription & Status */}
        <section className="md:col-span-8 bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10 relative overflow-hidden group" data-testid="subscription-card">
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
        </section>

        {/* Charity Profile */}
        <section className="md:col-span-4 bg-surface-container-high rounded-[2rem] p-8 border border-outline-variant/10 flex flex-col justify-between overflow-hidden relative" data-testid="charity-card">
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
        </section>

        {/* Score Entry */}
        <section className="md:col-span-5 bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10" data-testid="score-entry-section">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Stableford Entry</h3>
            <MIcon icon="query_stats" className="text-primary" />
          </div>
          <form onSubmit={handleAddScore} className="space-y-6">
            <div className="grid grid-cols-5 gap-3">
              {scoreInputs.map((val, i) => (
                <input key={i} type="number" min="1" max="45" placeholder="--" value={val}
                  onChange={(e) => { const n = [...scoreInputs]; n[i] = e.target.value; setScoreInputs(n); }}
                  className="w-full bg-surface-container-highest border-none rounded-xl text-center font-bold text-primary focus:ring-2 focus:ring-primary/30 transition-all py-4"
                  data-testid={`score-input-${i}`}
                  disabled={!subActive}
                />
              ))}
            </div>
            <input type="date" value={scoreDate} onChange={(e) => setScoreDate(e.target.value)}
              className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/30"
              data-testid="score-date-input" disabled={!subActive}
            />
            <button type="submit" disabled={!subActive}
              className="w-full py-4 bg-surface-container-highest hover:bg-surface-bright text-primary font-bold rounded-2xl transition-all border border-primary/20 disabled:opacity-40"
              data-testid="submit-scores-btn">
              Submit Latest Scores
            </button>
          </form>

          <div className="mt-12 space-y-4">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">Recent History</p>
            {scores.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-4">No scores entered yet</p>
            ) : (
              scores.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-surface-container rounded-2xl group">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-on-surface-variant">{s.score_date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-primary font-black text-lg">{s.score}</span>
                    <button onClick={() => handleDeleteScore(s.id)} className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-all" data-testid={`delete-score-${s.id}`}>
                      <MIcon icon="close" size="text-base" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Draw History */}
        <section className="md:col-span-7 bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10" data-testid="draw-history-section">
          <h3 className="text-xl font-bold mb-8">Draw History</h3>
          {draws.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-8">No draws available yet. Check back soon!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10">
                    <th className="pb-4 font-medium">Draw Event</th>
                    <th className="pb-4 font-medium">Date</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium">Prize Pool</th>
                    <th className="pb-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {draws.map((d) => (
                    <tr key={d.id}>
                      <td className="py-5 font-bold">Monthly Draw</td>
                      <td className="py-5 text-sm text-on-surface-variant">{d.draw_date}</td>
                      <td className="py-5">
                        <span className="flex items-center gap-2 text-xs">
                          <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'published' ? 'bg-outline' : 'bg-primary'}`} />
                          {d.status === 'published' ? 'Completed' : 'Confirmed'}
                        </span>
                      </td>
                      <td className="py-5 text-sm font-bold text-primary">${d.prize_pool_amount?.toFixed(2)}</td>
                      <td className="py-5 text-right">
                        {d.status === 'scheduled' && subActive && scores.length >= 5 && (
                          <button onClick={() => handleEnterDraw(d.id)} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all" data-testid={`enter-draw-${d.id}`}>Enter</button>
                        )}
                        {d.status === 'published' && <span className="text-sm text-on-surface-variant">Results</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Winnings */}
          {winnings?.entries?.length > 0 && (
            <div className="mt-8 space-y-3">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Winnings</p>
              {winnings.entries.map((e) => (
                <div key={e.id} className="p-4 bg-surface-container-highest rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold">{e.match_count}-Number Match</p>
                    <p className="text-xs text-on-surface-variant">{e.verification_status} | {e.payout_status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-tertiary font-bold">${e.winnings_amount?.toFixed(2)}</p>
                    {e.verification_status === 'pending_upload' && (
                      <div className="mt-2 flex items-center gap-2">
                        <input type="text" placeholder="Proof URL" value={proofUrl} onChange={(ev) => setProofUrl(ev.target.value)} className="bg-surface-container border-none rounded-lg px-3 py-1.5 text-xs w-40" data-testid="proof-url-input" />
                        <button onClick={() => handleVerify(e.id)} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold" data-testid="submit-proof-btn">Verify</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Charity Selection (full width) */}
        <section className="md:col-span-12 bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10" data-testid="charity-selection-section">
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
        </section>

        {/* Settings */}
        <section className="md:col-span-12 bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10" data-testid="settings-section">
          <h3 className="text-xl font-bold mb-6">Account Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl">
            <div className="p-4 bg-surface-container rounded-2xl">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Plan</p>
              <p className="font-bold capitalize">{user?.subscription_plan || 'None'}</p>
            </div>
            <div className="p-4 bg-surface-container rounded-2xl">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Status</p>
              <p className={`font-bold ${subActive ? 'text-primary' : 'text-error'}`}>{user?.subscription_status || 'Inactive'}</p>
            </div>
            <div className="p-4 bg-surface-container rounded-2xl">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Renewal</p>
              <p className="font-bold">{user?.subscription_end_date ? new Date(user.subscription_end_date).toLocaleDateString() : '--'}</p>
            </div>
          </div>
          {subActive && (
            <button onClick={handleCancelSub} className="mt-6 px-6 py-3 border border-error/30 text-error rounded-xl font-bold text-sm hover:bg-error/10 transition-colors" data-testid="cancel-subscription-btn">Cancel Subscription</button>
          )}
        </section>
      </div>
    </div>
  );
}
