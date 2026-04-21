import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDraws, enterDraw, getMyWinnings, submitVerification, getScores, getMyDraws, getDraw } from '../lib/api';
import { MIcon } from '../components/MIcon';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.19, 1, 0.22, 1] }
  })
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function DrawHistoryPage() {
  const { user } = useAuth();
  const [draws, setDraws] = useState([]);
  const [myDraws, setMyDraws] = useState([]);
  const [winnings, setWinnings] = useState(null);
  const [scores, setScores] = useState([]);
  const [proofUrl, setProofUrl] = useState('');
  const [selectedDraw, setSelectedDraw] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [drawsRes, winRes, scoresRes, myDrawsRes] = await Promise.all([
        getDraws(), getMyWinnings(), getScores(), getMyDraws()
      ]);
      setDraws(drawsRes.data.draws || []);
      setWinnings(winRes.data);
      setScores(scoresRes.data.scores || []);
      setMyDraws(myDrawsRes.data.entries || []);
    } catch {}
  };

  const handleEnterDraw = async (drawId) => {
    try { 
      await enterDraw(drawId); 
      alert('Successfully entered draw!'); 
      loadData(); 
    } catch (err) { 
      alert(err.response?.data?.detail || 'Failed'); 
    }
  };

  const handleVerify = async (entryId) => {
    try { 
      await submitVerification(entryId, { proof_url: proofUrl }); 
      alert('Verification submitted!'); 
      loadData(); 
    } catch (err) { 
      alert(err.response?.data?.detail || 'Failed'); 
    }
  };

  const handleViewResults = async (drawId) => {
    try {
      const res = await getDraw(drawId);
      setSelectedDraw(res.data);
    } catch (err) {
      alert('Failed to load draw results');
    }
  };

  const subActive = user?.subscription_status === 'active';

  return (
    <div className="pt-10 pb-32 px-6 md:px-12 max-w-5xl mx-auto overflow-x-hidden relative">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-2">Draw History</h1>
        <p className="text-on-surface-variant max-w-xl">Review upcoming scheduled draws, past results, and your personal winnings.</p>
      </header>

      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Draw Explanation */}
        <motion.section variants={fadeUp} className="md:col-span-4 bg-tertiary/10 rounded-[2rem] p-8 border border-tertiary/20 h-fit">
           <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary">
              <MIcon icon="auto_awesome" />
            </div>
            <h3 className="text-xl font-bold text-on-surface">How Draws Work</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center text-xs font-bold leading-none shrink-0 mt-0.5">1</span>
              <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Secure Selection:</strong> On the scheduled date, an admin invokes the Draw Engine. Sequences of numbers are independently processed and the winning draw numbers are published securely.</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center text-xs font-bold leading-none shrink-0 mt-0.5">2</span>
              <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Match & Win:</strong> The system identifies all entries. The more numbers that match between the simulation and your entry sequence, the larger your cut of the prize pool! (e.g. 5-Match, 4-Match).</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center text-xs font-bold leading-none shrink-0 mt-0.5">3</span>
              <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Verification:</strong> If you win, you must submit a verification URL (e.g. a link to your digital scorecard) below. Once our team approves it, your payout is issued!</p>
            </li>
          </ul>
        </motion.section>

        {/* Draw Interface */}
        <motion.section variants={fadeUp} className="md:col-span-8 bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10">
          <h3 className="text-xl font-bold mb-8">Draw Events</h3>
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
                  {draws.map((d) => {
                    const isEntered = myDraws.some(entry => entry.draw_id === d.id);
                    return (
                    <tr key={d.id}>
                      <td className="py-5 font-bold">Monthly Draw</td>
                      <td className="py-5 text-sm text-on-surface-variant">{d.draw_date}</td>
                      <td className="py-5">
                        <span className="flex items-center gap-2 text-xs">
                          <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'published' ? 'bg-outline' : 'bg-primary'}`} />
                          {d.status === 'published' ? 'Completed' : 'Scheduled'}
                        </span>
                      </td>
                      <td className="py-5 text-sm font-bold text-primary">${d.prize_pool_amount?.toFixed(2)}</td>
                      <td className="py-5 text-right">
                        {d.status === 'scheduled' ? (
                          isEntered ? (
                            <button disabled className="px-4 py-2 bg-surface-container-highest text-on-surface-variant rounded-xl text-xs font-bold" data-testid={`entered-draw-${d.id}`}>Entered</button>
                          ) : subActive && scores.length >= 5 ? (
                            <button onClick={() => handleEnterDraw(d.id)} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all" data-testid={`enter-draw-${d.id}`}>Enter</button>
                          ) : null
                        ) : d.status === 'published' ? (
                          <button onClick={() => handleViewResults(d.id)} className="px-4 py-2 bg-surface-container-highest text-on-surface rounded-xl text-xs font-bold hover:bg-surface-bright transition-all" data-testid={`view-results-${d.id}`}>View Results</button>
                        ) : null}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Winnings */}
          {winnings?.entries?.length > 0 && (
            <div className="mt-12 space-y-3 border-t border-outline-variant/10 pt-8">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Your Match Winnings</p>
              {winnings.entries.map((e) => (
                <div key={e.id} className="p-4 bg-surface-container-highest rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold">{e.match_count}-Number Match</p>
                    <p className="text-xs text-on-surface-variant capitalize">{e.verification_status.replace('_', ' ')} | {e.payout_status}</p>
                  </div>
                  <div className="md:text-right flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                    <p className="text-tertiary font-bold">${e.winnings_amount?.toFixed(2)}</p>
                    {e.verification_status === 'pending_upload' && (
                      <div className="flex items-center gap-2">
                        <input type="text" placeholder="Proof URL" value={proofUrl} onChange={(ev) => setProofUrl(ev.target.value)} className="bg-surface-container border-none rounded-lg px-3 py-1.5 text-xs w-48" data-testid="proof-url-input" />
                        <button onClick={() => handleVerify(e.id)} className="px-4 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold" data-testid="submit-proof-btn">Verify</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </motion.div>

      {/* Results Modal */}
      <AnimatePresence>
        {selectedDraw && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-surface rounded-3xl p-8 max-w-lg w-full border border-outline-variant/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-2xl font-black text-on-surface text-center">Draw Results</h3>
                <button onClick={() => setSelectedDraw(null)} className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container-highest">
                  <MIcon icon="close" />
                </button>
              </div>

              <div className="mb-8 relative z-10">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest text-center mb-3">Winning Numbers</p>
                <div className="flex justify-center gap-3">
                  {selectedDraw.result?.winning_numbers?.map((num, i) => (
                    <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              {selectedDraw.user_entry ? (
                <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant/10 relative z-10">
                  <p className="text-sm font-bold text-on-surface mb-2">Your Entry</p>
                  <div className="flex gap-2 justify-center mb-3">
                    {selectedDraw.user_entry.entry_numbers.map((num, i) => {
                      const isMatch = selectedDraw.result?.winning_numbers?.includes(num);
                      return (
                        <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isMatch ? 'bg-primary text-on-primary ring-2 ring-primary ring-offset-2 ring-offset-surface-container' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                          {num}
                        </div>
                      )
                    })}
                  </div>
                  {selectedDraw.user_entry.is_winner ? (
                    <div className="text-center mt-4 p-3 bg-tertiary/10 rounded-xl">
                      <p className="text-tertiary font-black text-lg">You Won!</p>
                      <p className="text-xs text-on-surface-variant">{selectedDraw.user_entry.match_count} matches · ${selectedDraw.user_entry.winnings_amount.toFixed(2)}</p>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-on-surface-variant mt-2">No winning match this time.</p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-surface-container rounded-2xl text-center relative z-10">
                  <p className="text-sm text-on-surface-variant">You did not enter this draw.</p>
                </div>
              )}
              {selectedDraw.winners && selectedDraw.winners.length > 0 && (
                <div className="mt-4 p-5 bg-surface-container rounded-2xl border border-outline-variant/10 relative z-10 max-h-40 overflow-y-auto">
                  <p className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                    <MIcon icon="emoji_events" className="text-tertiary text-lg" /> Draw Winners
                  </p>
                  <div className="space-y-3">
                    {selectedDraw.winners.map((w, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-outline-variant/5 pb-2 last:border-0 last:pb-0">
                        <p className="text-sm text-on-surface font-bold">{w.user_name || 'Anonymous'}</p>
                        <div className="text-right">
                          <p className="text-xs font-bold text-tertiary">{w.match_count} Matches</p>
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">${w.winnings_amount?.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
