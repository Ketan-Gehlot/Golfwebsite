import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MIcon } from '../components/MIcon';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.19, 1, 0.22, 1] }
  })
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } }
};

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleCTA = () => navigate(user ? '/dashboard' : '/signup');

  return (
    <div className="bg-surface text-on-surface">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden px-8">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent z-10" />
          <img className="w-full h-full object-cover" alt="Abstract digital energy visualization" src="https://images.pexels.com/photos/914682/pexels-photo-914682.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=1920" />
        </div>
        <motion.div
          className="relative z-20 max-w-4xl"
          initial="hidden" animate="visible" variants={stagger}
        >
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-secondary-container/30 border border-outline-variant/20 px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-body uppercase tracking-widest text-on-secondary-container">The Philanthropic Player</span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-[3.5rem] md:text-[5rem] leading-[1.05] font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-on-surface to-on-surface-variant font-headline" data-testid="hero-title">
            Golf with a Heart,<br/>Play with Purpose.
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-xl text-on-surface-variant max-w-xl mb-12 leading-relaxed">
            Transform every scorecard into a catalyst for change. Join an elite community of golfers turning professional passion into humanitarian impact.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-6">
            <button onClick={handleCTA} className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-10 py-5 rounded-xl font-bold text-lg shadow-[0_0_40px_rgba(76,215,246,0.3)] hover:scale-105 transition-transform ease-out-expo active:scale-95" data-testid="hero-cta-btn">
              Start Your Impact
            </button>
            <button onClick={() => navigate(user ? '/dashboard' : '/login')} className="bg-surface-container-highest text-primary px-10 py-5 rounded-xl font-bold text-lg hover:bg-surface-bright transition-colors" data-testid="hero-draws-btn">
              View Live Draws
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-24 px-8 border-y border-outline-variant/10 bg-surface-container-lowest">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center md:text-left">
            <div className="text-on-surface-variant font-body uppercase tracking-widest mb-2">Total Contributions</div>
            <div className="text-5xl font-bold text-primary font-headline" data-testid="stat-contributions">$4,820,150</div>
          </motion.div>
          <motion.div variants={fadeUp} className="text-center md:text-left border-x border-outline-variant/10 px-12">
            <div className="text-on-surface-variant font-body uppercase tracking-widest mb-2">Impact Partners</div>
            <div className="text-5xl font-bold text-tertiary font-headline" data-testid="stat-partners">142</div>
          </motion.div>
          <motion.div variants={fadeUp} className="text-center md:text-left">
            <div className="text-on-surface-variant font-body uppercase tracking-widest mb-2">Winner Payouts</div>
            <div className="text-5xl font-bold text-secondary font-headline" data-testid="stat-payouts">$1,240,000</div>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section — PRD: Clearly communicates what the user does, how they win, charity impact */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-20">
            <p className="text-xs font-body uppercase tracking-[0.2em] text-primary mb-4">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter font-headline">How It Works</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', icon: 'person_add', title: 'Subscribe', desc: 'Choose a monthly ($9.99) or yearly ($99.99) plan. Part of your fee fuels prize pools and charity.' },
              { step: '02', icon: 'edit_note', title: 'Enter Scores', desc: 'Log your last 5 Stableford scores (1–45). They automatically become your draw entry numbers.' },
              { step: '03', icon: 'casino', title: 'Monthly Draw', desc: 'Each month, 5 winning numbers are drawn. Match 3, 4, or all 5 to win from the prize pool.' },
              { step: '04', icon: 'volunteer_activism', title: 'Give Back', desc: 'At least 10% of your subscription goes to your chosen charity. You can give more anytime.' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}
                className="group relative p-8 rounded-[2rem] bg-surface-container-low border border-outline-variant/10 hover:border-primary/20 hover:-translate-y-1 transition-all duration-500"
              >
                <div className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6">{item.step}</div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <MIcon icon={item.icon} className="text-primary" size="text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Draw Mechanics Section — PRD: Public visitors should understand draw mechanics */}
      <section className="py-32 px-8 bg-surface-container-lowest border-y border-outline-variant/10">
        <motion.div
          className="max-w-7xl mx-auto"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-16 max-w-2xl">
            <p className="text-xs font-body uppercase tracking-[0.2em] text-secondary mb-4">Draw System</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter font-headline mb-4">How You Win</h2>
            <p className="text-on-surface-variant text-lg">Your 5 latest golf scores are your lottery numbers. Every month, we draw 5 winning numbers — the more you match, the bigger your prize.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { match: '5-Number Match', share: '40%', rollover: 'Yes (Jackpot)', color: 'primary', icon: 'emoji_events' },
              { match: '4-Number Match', share: '35%', rollover: 'No', color: 'tertiary', icon: 'military_tech' },
              { match: '3-Number Match', share: '25%', rollover: 'No', color: 'secondary', icon: 'workspace_premium' },
            ].map((tier, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}
                className={`p-8 rounded-[2rem] bg-surface-container-low border border-${tier.color}/20 hover:-translate-y-1 transition-all duration-500`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-${tier.color}/10 flex items-center justify-center mb-6`}>
                  <MIcon icon={tier.icon} className={`text-${tier.color}`} size="text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">{tier.match}</h3>
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Pool Share</span>
                    <span className={`font-bold text-${tier.color}`}>{tier.share}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Rollover</span>
                    <span className="font-bold text-on-surface">{tier.rollover}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp}
            className="p-8 rounded-[2rem] bg-gradient-to-br from-surface-container-low to-surface-container-lowest border border-primary/10 flex flex-col md:flex-row items-center gap-8"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MIcon icon="info" className="text-primary" size="text-3xl" />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">Jackpot Rollover</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">If nobody matches all 5 numbers, the 40% jackpot pool rolls over to the next month — growing the prize until someone wins. Prizes are split equally among multiple winners in the same tier.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Core Pillars (Bento Grid) */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
          <motion.div variants={fadeUp} className="mb-20">
            <h2 className="text-4xl font-bold tracking-tight font-headline mb-4">The Kinetic Ecosystem</h2>
            <div className="h-1 w-24 bg-primary rounded-full" />
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Subscription Engine */}
            <motion.div variants={fadeUp} className="md:col-span-8 group relative overflow-hidden rounded-3xl bg-surface-container-low p-12 hover:bg-surface-container transition-colors duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-20 -mt-20" />
              <MIcon icon="card_membership" className="text-primary text-5xl mb-8" size="text-5xl" />
              <h3 className="text-3xl font-bold mb-4 font-headline">Subscription Engine</h3>
              <p className="text-on-surface-variant text-lg max-w-md mb-8">Seamlessly manage your charitable journey with flexible tiers designed for maximum impact and exclusive member rewards.</p>
              <ul className="space-y-4 text-on-surface">
                <li className="flex items-center gap-3"><MIcon icon="check_circle" className="text-primary" size="text-xl" /> Automated monthly giving cycles</li>
                <li className="flex items-center gap-3"><MIcon icon="check_circle" className="text-primary" size="text-xl" /> Tax-deductible receipt generation</li>
              </ul>
            </motion.div>
            {/* Performance Tracking */}
            <motion.div variants={fadeUp} className="md:col-span-4 group overflow-hidden rounded-3xl bg-surface-container-high p-12 hover:ring-1 ring-primary/30 transition-all duration-500">
              <MIcon icon="query_stats" className="text-tertiary text-5xl mb-8" size="text-5xl" />
              <h3 className="text-2xl font-bold mb-4 font-headline">Performance Tracking</h3>
              <p className="text-on-surface-variant mb-8 leading-relaxed">Log your rounds, track your improvement, and climb the Impact Leaderboard with every birdie.</p>
              <img className="w-full h-40 object-cover rounded-xl mt-4 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="Golf action shot" src="https://images.pexels.com/photos/6256834/pexels-photo-6256834.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" />
            </motion.div>
            {/* Monthly Prize Draws */}
            <motion.div variants={fadeUp} className="md:col-span-12 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container-low to-surface-container-lowest p-12 border border-outline-variant/10">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1">
                  <MIcon icon="military_tech" className="text-secondary text-5xl mb-8" size="text-5xl" />
                  <h3 className="text-3xl font-bold mb-4 font-headline">Monthly Prize Draws</h3>
                  <p className="text-on-surface-variant text-lg max-w-xl">Every subscription serves as an entry into our exclusive monthly prize pool. Win world-class golf experiences while your contribution funds vital global initiatives.</p>
                </div>
                <div className="w-full md:w-80 h-48 rounded-2xl glass-panel border border-outline-variant/20 p-8 flex flex-col justify-center">
                  <div className="text-on-surface-variant text-xs uppercase tracking-widest mb-2">Next Draw Pool</div>
                  <div className="text-4xl font-black text-white font-headline">$25,000</div>
                  <div className="text-primary text-sm mt-4 font-bold">12 Days Remaining</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Charity Impact Section */}
      <section className="py-32 bg-[#0b0b0b] relative">
        <motion.div
          className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="relative">
            <div className="absolute -inset-4 bg-primary/20 blur-[80px] rounded-full" />
            <img className="relative z-10 w-full aspect-square object-cover rounded-[3rem]" alt="Community volunteers" src="https://images.pexels.com/photos/6646916/pexels-photo-6646916.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" />
            <div className="absolute bottom-8 left-8 right-8 z-20 glass-panel p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-primary-container p-2 rounded-lg">
                  <MIcon icon="volunteer_activism" className="text-surface" size="text-xl" />
                </div>
                <div className="font-bold text-white">The Clean Water Project</div>
              </div>
              <p className="text-sm text-on-surface-variant">Your contributions this month are providing filtration systems to 15 rural communities.</p>
            </div>
          </motion.div>
          <motion.div variants={fadeUp}>
            <h2 className="text-5xl font-bold tracking-tighter mb-8 font-headline">Direct Impact.<br/>Real Stories.</h2>
            <p className="text-xl text-on-surface-variant leading-relaxed mb-12">
              We believe in transparency. Choose exactly where your kinetic energy goes—from reforestation and clean water to local youth sports development.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              <div className="p-6 rounded-2xl bg-surface-container-high border-l-4 border-primary">
                <div className="text-primary font-bold text-2xl mb-1">85%</div>
                <div className="text-xs font-body uppercase text-on-surface-variant">Direct to Cause</div>
              </div>
              <div className="p-6 rounded-2xl bg-surface-container-high border-l-4 border-tertiary">
                <div className="text-tertiary font-bold text-2xl mb-1">100%</div>
                <div className="text-xs font-body uppercase text-on-surface-variant">Impact Verified</div>
              </div>
            </div>
            <button onClick={() => navigate('/charities')} className="flex items-center gap-3 text-primary font-bold text-lg hover:gap-5 transition-all group" data-testid="explore-charities-btn">
              Select Your Cause <MIcon icon="arrow_forward" size="text-xl" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-8 max-w-5xl mx-auto text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-4 font-headline">Choose Your Impact Level</motion.h2>
          <motion.p variants={fadeUp} className="text-on-surface-variant mb-16">Select the plan that aligns with your passion and purpose.</motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={fadeUp} className="bg-surface-container-low p-12 rounded-[2.5rem] border border-outline-variant/10 hover:scale-[1.02] transition-transform ease-out-expo">
              <div className="text-on-surface-variant font-body uppercase tracking-widest mb-4">Standard Kinetic</div>
              <div className="text-6xl font-bold mb-4 font-headline">$9.99<span className="text-xl text-on-surface-variant font-normal">/mo</span></div>
              <p className="text-on-surface-variant mb-8">Fuel the mission monthly.</p>
              <ul className="space-y-4 mb-12 text-left">
                <li className="flex items-center gap-3"><MIcon icon="check" className="text-primary" size="text-xl" /> 1 Monthly Draw Entry</li>
                <li className="flex items-center gap-3"><MIcon icon="check" className="text-primary" size="text-xl" /> Performance Score Tracking</li>
                <li className="flex items-center gap-3"><MIcon icon="check" className="text-primary" size="text-xl" /> Monthly Impact Reports</li>
              </ul>
              <button onClick={() => navigate(user ? '/subscription' : '/signup')} className="w-full py-4 rounded-xl border border-primary text-primary font-bold hover:bg-primary/10 transition-colors active:scale-95" data-testid="cta-monthly-btn">Select Monthly</button>
            </motion.div>
            <motion.div variants={fadeUp} className="relative bg-surface-container-highest p-12 rounded-[2.5rem] shadow-[0_40px_100px_rgba(76,215,246,0.15)] border border-primary/20 hover:scale-[1.02] transition-transform ease-out-expo">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary-container px-6 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Best Value</div>
              <div className="text-on-surface-variant font-body uppercase tracking-widest mb-4">Elite Kinetic</div>
              <div className="text-6xl font-bold mb-4 font-headline">$99.99<span className="text-xl text-on-surface-variant font-normal">/yr</span></div>
              <p className="text-on-surface-variant mb-8">Maximum impact, 2 months free.</p>
              <ul className="space-y-4 mb-12 text-left">
                <li className="flex items-center gap-3"><MIcon icon="check" className="text-primary" size="text-xl" /> 3 Monthly Draw Entries</li>
                <li className="flex items-center gap-3"><MIcon icon="check" className="text-primary" size="text-xl" /> Elite Tier Leaderboard Access</li>
                <li className="flex items-center gap-3"><MIcon icon="check" className="text-primary" size="text-xl" /> Direct Charity Selection Control</li>
              </ul>
              <button onClick={() => navigate(user ? '/subscription' : '/signup')} className="w-full py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold shadow-lg active:scale-95 transition-all" data-testid="cta-yearly-btn">Start Yearly Impact</button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-8 text-center border-t border-outline-variant/10">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="max-w-3xl mx-auto"
        >
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 font-headline">Ready to Make Every Shot Count?</motion.h2>
          <motion.p variants={fadeUp} className="text-on-surface-variant text-lg mb-12">Join thousands of golfers who are changing the world, one scorecard at a time.</motion.p>
          <motion.div variants={fadeUp}>
            <button onClick={handleCTA} className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-12 py-5 rounded-xl font-bold text-lg shadow-[0_0_40px_rgba(76,215,246,0.3)] hover:scale-105 transition-transform ease-out-expo active:scale-95" data-testid="final-cta-btn">
              Subscribe & Start Playing
            </button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
