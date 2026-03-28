import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getScores } from '../lib/api';
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

// Demo leaderboard data (in a real app, this would come from an API endpoint)
const DEMO_LEADERBOARD = [
  { rank: 1, name: 'James McAllister', avg: 38.4, rounds: 24, charity: 'Green Earth Foundation', badge: 'gold' },
  { rank: 2, name: 'Sarah Chen', avg: 37.8, rounds: 22, charity: 'Youth Sports Initiative', badge: 'silver' },
  { rank: 3, name: 'Robert Wallace', avg: 36.2, rounds: 20, charity: 'Ocean Conservation Society', badge: 'bronze' },
  { rank: 4, name: 'Emily Thompson', avg: 35.9, rounds: 19, charity: 'Mental Health Alliance', badge: null },
  { rank: 5, name: 'Michael O\'Brien', avg: 35.1, rounds: 18, charity: 'Community Food Bank', badge: null },
  { rank: 6, name: 'Grace Wilson', avg: 34.6, rounds: 17, charity: 'Green Earth Foundation', badge: null },
  { rank: 7, name: 'David Murray', avg: 34.2, rounds: 16, charity: 'Youth Sports Initiative', badge: null },
  { rank: 8, name: 'Lisa Armstrong', avg: 33.8, rounds: 15, charity: 'Ocean Conservation Society', badge: null },
  { rank: 9, name: 'Thomas Reid', avg: 33.1, rounds: 14, charity: 'Mental Health Alliance', badge: null },
  { rank: 10, name: 'Anna Scott', avg: 32.7, rounds: 13, charity: 'Green Earth Foundation', badge: null },
];

const badgeColors = {
  gold: 'from-yellow-400 to-amber-600',
  silver: 'from-gray-300 to-gray-500',
  bronze: 'from-amber-600 to-orange-800',
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [myScores, setMyScores] = useState([]);

  useEffect(() => {
    if (user) {
      getScores().then(res => setMyScores(res.data.scores || [])).catch(() => {});
    }
  }, [user]);

  const myAvg = myScores.length > 0 ? (myScores.reduce((s, sc) => s + sc.score, 0) / myScores.length).toFixed(1) : null;

  return (
    <div className="pt-10 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
      <motion.div initial="hidden" animate="visible" variants={stagger}>
        <motion.header variants={fadeUp} className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-2 font-headline" data-testid="leaderboard-title">Impact Leaderboard</h1>
          <p className="text-on-surface-variant max-w-xl">The top-performing golfers in our community, ranked by average Stableford score. Play well, give more.</p>
        </motion.header>

        {/* Your Position */}
        {user && myAvg && (
          <motion.div variants={fadeUp} className="mb-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </div>
              <div>
                <p className="font-bold text-on-surface">{user.first_name} {user.last_name}</p>
                <p className="text-xs text-on-surface-variant">Your Average: <span className="text-primary font-bold">{myAvg} pts</span> · {myScores.length} rounds</p>
              </div>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">Your Stats</span>
          </motion.div>
        )}

        {/* Leaderboard Table */}
        <motion.div variants={fadeUp} className="rounded-[2rem] bg-surface-container-low border border-outline-variant/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest w-16">Rank</th>
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Player</th>
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Avg Score</th>
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest hidden md:table-cell">Rounds</th>
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest hidden lg:table-cell">Supporting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {DEMO_LEADERBOARD.map((player) => (
                  <tr key={player.rank} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="px-8 py-5">
                      {player.badge ? (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${badgeColors[player.badge]} flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
                          {player.rank}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold text-xs">
                          {player.rank}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-bold text-sm text-on-surface">{player.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-primary font-black text-lg">{player.avg}</span>
                      <span className="text-[10px] text-on-surface-variant ml-1">pts</span>
                    </td>
                    <td className="px-8 py-5 text-sm text-on-surface-variant hidden md:table-cell">{player.rounds}</td>
                    <td className="px-8 py-5 hidden lg:table-cell">
                      <span className="px-3 py-1 rounded-full bg-surface-container-highest text-[10px] font-bold text-on-surface-variant">{player.charity}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/5 flex justify-between items-center">
            <p className="text-xs text-on-surface-variant">Showing top {DEMO_LEADERBOARD.length} players</p>
            <p className="text-xs text-on-surface-variant">Updated monthly</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
