import React, { useEffect, useState } from 'react';
import { adminGetUsers, adminUpdateUser, adminGetAnalytics, adminCreateCharity, adminDeleteCharity, getCharities, adminCreateDraw, adminSimulateDraw, adminPublishDraw, getDraws, adminGetWinners, adminReviewWinner, adminMarkPayout } from '../lib/api';
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

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [charities, setCharities] = useState([]);
  const [draws, setDraws] = useState([]);
  const [winners, setWinners] = useState([]);
  const [simResult, setSimResult] = useState(null);
  const [newCharity, setNewCharity] = useState({ name: '', description: '', logo_url: '', website_url: '', is_featured: false });
  const [newDraw, setNewDraw] = useState({ draw_date: '', draw_logic_type: 'random' });
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [a, u, c, d, w] = await Promise.all([adminGetAnalytics(), adminGetUsers(), getCharities(), getDraws(), adminGetWinners()]);
      setAnalytics(a.data); setUsers(u.data.users || []); setCharities(c.data.charities || []); setDraws(d.data.draws || []); setWinners(w.data.winners || []);
    } catch {}
  };

  const handleCreateCharity = async () => {
    try { await adminCreateCharity(newCharity); setNewCharity({ name: '', description: '', logo_url: '', website_url: '', is_featured: false }); loadAll(); } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handleDeleteCharity = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await adminDeleteCharity(id); loadAll(); } catch {}
  };

  const handleCreateDraw = async () => {
    try { await adminCreateDraw(newDraw); setNewDraw({ draw_date: '', draw_logic_type: 'random' }); loadAll(); } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handleSimulate = async (drawId) => {
    try { const res = await adminSimulateDraw(drawId); setSimResult({ drawId, ...res.data }); } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handlePublish = async (drawId, nums) => {
    try { await adminPublishDraw(drawId, { winning_numbers: nums }); setSimResult(null); loadAll(); } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handleReview = async (id, status) => { try { await adminReviewWinner(id, { status }); loadAll(); } catch {} };
  const handlePayout = async (id) => { try { await adminMarkPayout(id, { payout_status: 'paid' }); loadAll(); } catch {} };

  const filteredUsers = users.filter(u => !searchUser || u.email?.includes(searchUser) || u.first_name?.toLowerCase().includes(searchUser.toLowerCase()));

  return (
    <div className="pt-10 pb-24 px-6 md:px-12 min-h-screen max-w-7xl">
      {/* Header */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 font-headline" data-testid="admin-title">Platform Control</h1>
            <p className="text-on-surface-variant max-w-xl">Real-time metrics and operational management for the Kinetic Impact network.</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-all">
              <MIcon icon="download" size="text-sm" /><span className="text-sm font-semibold">Report</span>
            </button>
          </div>
        </div>

        {/* Analytics */}
        {analytics && (
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp}><StatCard label="Total Subscribers" value={analytics.total_users} change={`${analytics.active_subscribers} active`} /></motion.div>
            <motion.div variants={fadeUp}><StatCard label="Current Prize Pool" value={`$${analytics.current_prize_pool?.toFixed(2)}`} badge="Live" badgeColor="text-tertiary" /></motion.div>
            <motion.div variants={fadeUp}><StatCard label="Total Draws" value={analytics.total_draws} change={`${analytics.total_winners} winners`} /></motion.div>
            <motion.div variants={fadeUp}>
              <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Total Revenue</p>
                <h3 className="text-3xl font-black text-primary font-headline" data-testid="analytics-revenue">${analytics.total_revenue?.toFixed(2)}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(analytics.charity_distribution || {}).slice(0, 3).map(([name, count]) => (
                    <span key={name} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{name}: {count}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* Draw & Verification */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
        {/* Draw Engine */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MIcon icon="casino" className="text-primary" /> Draw Engine
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold uppercase">System Ready</span>
          </div>
          <div className="p-6 rounded-2xl bg-surface-container-high border border-outline-variant/20">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Draw Date</label>
            <input type="date" value={newDraw.draw_date} onChange={(e) => setNewDraw({ ...newDraw, draw_date: e.target.value })}
              className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 mb-4" data-testid="admin-draw-date" />
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Algorithm Mode</label>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => setNewDraw({ ...newDraw, draw_logic_type: 'random' })}
                className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-2 transition-all ${newDraw.draw_logic_type === 'random' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-surface-container-highest text-on-surface-variant hover:border-outline-variant'}`}
                data-testid="draw-mode-random">
                <MIcon icon="shuffle" size="text-xl" /> Random
              </button>
              <button onClick={() => setNewDraw({ ...newDraw, draw_logic_type: 'algorithmic' })}
                className={`p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-2 transition-all ${newDraw.draw_logic_type === 'algorithmic' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-surface-container-highest text-on-surface-variant hover:border-outline-variant'}`}
                data-testid="draw-mode-algorithmic">
                <MIcon icon="precision_manufacturing" size="text-xl" /> Algorithmic
              </button>
            </div>
            <div className="space-y-3">
              <button onClick={handleCreateDraw} className="w-full py-3 rounded-xl bg-surface-container-highest text-white font-bold text-sm hover:bg-surface-bright transition-all" data-testid="admin-create-draw-btn">Create Draw</button>
            </div>
          </div>

          {/* Active Draws */}
          {draws.filter(d => d.status === 'scheduled').map(d => (
            <div key={d.id} className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20">
              <p className="text-sm font-bold mb-2">{d.draw_date} - <span className="text-primary">${d.prize_pool_amount?.toFixed(2)}</span></p>
              <div className="flex gap-2">
                <button onClick={() => handleSimulate(d.id)} className="flex-1 py-2 rounded-xl bg-surface-container-highest text-primary font-bold text-xs hover:bg-surface-bright transition-all" data-testid={`simulate-draw-${d.id}`}>Simulate</button>
              </div>
            </div>
          ))}

          {/* Simulation Result */}
          {simResult && (
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Simulation</p>
              <p className="text-xl font-black text-primary mb-2">{simResult.winning_numbers?.join(' - ')}</p>
              <p className="text-xs text-on-surface-variant mb-1">Entries: {simResult.total_entries}</p>
              <p className="text-xs text-on-surface-variant mb-1">5-Match: {simResult.simulation_results?.['5_match']?.length || 0}</p>
              <p className="text-xs text-on-surface-variant mb-1">4-Match: {simResult.simulation_results?.['4_match']?.length || 0}</p>
              <p className="text-xs text-on-surface-variant mb-4">3-Match: {simResult.simulation_results?.['3_match']?.length || 0}</p>
              <button onClick={() => handlePublish(simResult.drawId, simResult.winning_numbers)}
                className="w-full py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm shadow-xl shadow-primary/20" data-testid="publish-draw-btn">
                Publish Results
              </button>
            </div>
          )}
        </div>

        {/* Verification Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MIcon icon="verified" className="text-secondary" /> Verification Queue
            </h2>
            <span className="text-xs text-on-surface-variant font-medium">{winners.length} Winners</span>
          </div>

          {winners.length === 0 ? (
            <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/10 text-center">
              <p className="text-on-surface-variant">No winners yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {winners.map((w) => (
                <div key={w.id} className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/10 flex flex-col md:flex-row gap-6 items-center" data-testid={`winner-card-${w.id}`}>
                  <div className="flex-grow text-center md:text-left">
                    <h4 className="text-lg font-bold text-white mb-1">{w.user_name}</h4>
                    <p className="text-xs text-on-surface-variant mb-4">{w.match_count}-Number Match | ${w.winnings_amount?.toFixed(2)} | {w.verification_status}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${w.payout_status === 'paid' ? 'bg-primary/10 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        {w.payout_status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    {w.verification_status === 'pending' && (
                      <>
                        <button onClick={() => handleReview(w.id, 'rejected')} className="flex-1 md:flex-none p-3 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-all" data-testid={`reject-${w.id}`}><MIcon icon="close" size="text-xl" /></button>
                        <button onClick={() => handleReview(w.id, 'approved')} className="flex-1 md:flex-none p-3 px-6 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all font-bold text-sm" data-testid={`approve-${w.id}`}>Approve</button>
                      </>
                    )}
                    {w.verification_status === 'approved' && w.payout_status !== 'paid' && (
                      <button onClick={() => handlePayout(w.id)} className="px-6 py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm" data-testid={`payout-${w.id}`}>Pay Out</button>
                    )}
                    {w.proof_url && (
                      <a href={w.proof_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-surface-container-highest text-on-surface-variant hover:text-white transition-colors"><MIcon icon="zoom_in" size="text-xl" /></a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Charity Management */}
      <section className="mb-12">
        <h2 className="text-2xl font-black text-white mb-6">Charity Management</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10">
            <h3 className="font-bold mb-4">Add Charity</h3>
            <div className="space-y-3">
              <input placeholder="Charity Name" value={newCharity.name} onChange={(e) => setNewCharity({...newCharity, name: e.target.value})} className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm text-on-surface" data-testid="admin-charity-name" />
              <textarea placeholder="Description" value={newCharity.description} onChange={(e) => setNewCharity({...newCharity, description: e.target.value})} className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm text-on-surface resize-none" rows={3} data-testid="admin-charity-desc" />
              <input placeholder="Logo URL" value={newCharity.logo_url} onChange={(e) => setNewCharity({...newCharity, logo_url: e.target.value})} className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm text-on-surface" data-testid="admin-charity-logo" />
              <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                <input type="checkbox" checked={newCharity.is_featured} onChange={(e) => setNewCharity({...newCharity, is_featured: e.target.checked})} className="rounded bg-surface-container-highest border-outline-variant text-primary focus:ring-primary" />
                Featured
              </label>
              <button onClick={handleCreateCharity} className="w-full py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold active:scale-95 transition-all" data-testid="admin-create-charity-btn">Add Charity</button>
            </div>
          </div>
          <div className="lg:col-span-2 rounded-2xl bg-surface-container-low border border-outline-variant/10 overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold mb-4">All Charities ({charities.length})</h3>
            </div>
            <div className="divide-y divide-outline-variant/5">
              {charities.map(c => (
                <div key={c.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-container-high/40 transition-colors">
                  <div>
                    <p className="font-bold text-on-surface">{c.name}</p>
                    <p className="text-xs text-on-surface-variant">{c.is_featured ? 'Featured' : 'Standard'}</p>
                  </div>
                  <button onClick={() => handleDeleteCharity(c.id)} className="text-on-surface-variant hover:text-error transition-colors" data-testid={`delete-charity-${c.id}`}>
                    <MIcon icon="delete" size="text-xl" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Management Table */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-white">Subscriber Directory</h2>
          <div className="relative">
            <MIcon icon="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size="text-sm" />
            <input type="text" value={searchUser} onChange={(e) => setSearchUser(e.target.value)}
              className="bg-surface-container-high border-none rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary w-48 md:w-64 transition-all"
              placeholder="Search members..." data-testid="admin-user-search" />
          </div>
        </div>
        <div className="rounded-3xl bg-surface-container-low border border-outline-variant/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Subscriber</th>
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Plan</th>
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Renewal</th>
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {u.first_name?.[0]}{u.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{u.first_name} {u.last_name}</p>
                          <p className="text-[10px] text-on-surface-variant">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.subscription_status === 'active' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                        {(u.subscription_status || 'INACTIVE').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-on-surface-variant capitalize">{u.subscription_plan || '--'}</td>
                    <td className="px-8 py-6">
                      {u.subscription_end_date ? (
                        <span className={`text-xs font-bold ${new Date(u.subscription_end_date) < new Date() ? 'text-error' : 'text-primary'}`}>
                          {new Date(u.subscription_end_date).toLocaleDateString()}
                          {new Date(u.subscription_end_date) < new Date() && <span className="ml-1 text-[10px]">EXPIRED</span>}
                        </span>
                      ) : (
                        <span className="text-xs text-on-surface-variant">--</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.is_admin ? 'bg-secondary/10 text-secondary' : 'text-on-surface-variant'}`}>
                        {u.is_admin ? 'ADMIN' : 'USER'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-surface-container-lowest flex justify-between items-center border-t border-outline-variant/5">
            <p className="text-xs text-on-surface-variant">Showing {filteredUsers.length} of {users.length} subscribers</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, change, badge, badgeColor }) {
  return (
    <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">{label}</p>
      <h3 className="text-3xl font-black text-white">{value}</h3>
      <div className="mt-4 flex items-center gap-2">
        {change && <span className="text-primary text-xs font-bold">{change}</span>}
        {badge && <span className={`text-xs font-bold ${badgeColor || 'text-primary'}`}>{badge}</span>}
        <span className="text-[10px] text-on-surface-variant">vs last month</span>
      </div>
    </div>
  );
}
