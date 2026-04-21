import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getScores, addScore, deleteScore } from '../lib/api';
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

export default function ScoreEntryPage() {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [scoreInputs, setScoreInputs] = useState(['', '', '', '', '']);
  const [scoreDate, setScoreDate] = useState('');

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      const res = await getScores();
      setScores(res.data.scores || []);
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
      loadScores();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add score');
    }
  };

  const handleDeleteScore = async (id) => {
    if (window.confirm('Delete this score?')) {
      try { 
        await deleteScore(id); 
        loadScores(); 
      } catch {}
    }
  };

  const subActive = user?.subscription_status === 'active';

  return (
    <div className="pt-10 pb-32 px-6 md:px-12 max-w-4xl mx-auto overflow-x-hidden">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-2">Score Entry</h1>
        <p className="text-on-surface-variant max-w-xl">Log your Stableford scores to participate in the Kinetic draws and rank on the leaderboard.</p>
      </header>

      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.section variants={fadeUp} className="bg-primary/5 rounded-[2rem] p-8 border border-primary/20 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <MIcon icon="help_outline" />
            </div>
            <h3 className="text-xl font-bold text-on-surface">How It Works</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <MIcon icon="check_circle" className="text-primary mt-0.5" size="text-lg" />
              <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Stableford Scoring:</strong> Enter your Stableford points from your golf rounds. This system rewards points based on the number of strokes taken at each hole relative to par, leveling the playing field for all handicaps.</p>
            </li>
            <li className="flex items-start gap-3">
              <MIcon icon="check_circle" className="text-primary mt-0.5" size="text-lg" />
              <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Eligibility:</strong> You must enter <strong className="text-primary">at least 5 valid scores</strong> within the period to qualify for entry into the scheduled Kinetic Draws.</p>
            </li>
            <li className="flex items-start gap-3">
              <MIcon icon="check_circle" className="text-primary mt-0.5" size="text-lg" />
              <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Leaderboard:</strong> Your average score is automatically calculated and placed on the global Impact Leaderboard.</p>
            </li>
          </ul>
        </motion.section>

        <motion.section variants={fadeUp} className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10">
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
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">Recent History ({scores.length}/5 minimum for draw)</p>
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
        </motion.section>
      </motion.div>
    </div>
  );
}
