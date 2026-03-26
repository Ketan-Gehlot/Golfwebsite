import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MIcon } from '../components/MIcon';

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
          <img className="w-full h-full object-cover" alt="Abstract digital energy visualization" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwbIiiXzFwKZ4YgzWkvXkjYxevWc713ypzmzaN2G3YtacAmEsZoWzp1rrqoJ8k_EkFIPTgi4IKeTTfLfzmHX_mJ6ypHjxPNZ8W1VlSNMTH_G4rijnoTar4-9GBT_r94ochG5IpftAEMLivrJrvrdYjX2UokD_hhTdrDBFzWEj4Xaao07KhhZR9BjmnbwUkoCbkPGBdc2nqTP-nMkn_sVtRF6Lki7ykdR6PLpQc5JGC9D1yCHmZwvJvcO8DY_T1PCseXSCIIzEjP6At" />
        </div>
        <div className="relative z-20 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-secondary-container/30 border border-outline-variant/20 px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-label uppercase tracking-widest text-on-secondary-container">The Philanthropic Player</span>
          </div>
          <h1 className="text-[3.5rem] md:text-[5rem] leading-[1.05] font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-on-surface to-on-surface-variant" data-testid="hero-title">
            Golf with a Heart,<br/>Play with Purpose.
          </h1>
          <p className="text-xl text-on-surface-variant max-w-xl mb-12 leading-relaxed">
            Transform every scorecard into a catalyst for change. Join an elite community of golfers turning professional passion into humanitarian impact.
          </p>
          <div className="flex flex-wrap gap-6">
            <button onClick={handleCTA} className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-10 py-5 rounded-xl font-bold text-lg shadow-[0_0_40px_rgba(76,215,246,0.3)] hover:scale-105 transition-transform ease-out-expo" data-testid="hero-cta-btn">
              Start Your Impact
            </button>
            <button onClick={() => navigate(user ? '/dashboard' : '/login')} className="bg-surface-container-highest text-primary px-10 py-5 rounded-xl font-bold text-lg hover:bg-surface-bright transition-colors" data-testid="hero-draws-btn">
              View Live Draws
            </button>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-24 px-8 border-y border-outline-variant/10 bg-surface-container-lowest">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          <div className="text-center md:text-left">
            <div className="text-on-surface-variant font-label uppercase tracking-widest mb-2">Total Contributions</div>
            <div className="text-5xl font-bold text-primary" data-testid="stat-contributions">$4,820,150</div>
          </div>
          <div className="text-center md:text-left border-x border-outline-variant/10 px-12">
            <div className="text-on-surface-variant font-label uppercase tracking-widest mb-2">Impact Partners</div>
            <div className="text-5xl font-bold text-tertiary" data-testid="stat-partners">142</div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-on-surface-variant font-label uppercase tracking-widest mb-2">Winner Payouts</div>
            <div className="text-5xl font-bold text-secondary" data-testid="stat-payouts">$1,240,000</div>
          </div>
        </div>
      </section>

      {/* Core Pillars (Bento Grid) */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="mb-20">
          <h2 className="text-4xl font-bold tracking-tight mb-4">The Kinetic Ecosystem</h2>
          <div className="h-1 w-24 bg-primary rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Subscription Engine */}
          <div className="md:col-span-8 group relative overflow-hidden rounded-3xl bg-surface-container-low p-12 hover:bg-surface-container transition-colors duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-20 -mt-20" />
            <MIcon icon="card_membership" className="text-primary text-5xl mb-8" size="text-5xl" />
            <h3 className="text-3xl font-bold mb-4">Subscription Engine</h3>
            <p className="text-on-surface-variant text-lg max-w-md mb-8">Seamlessly manage your charitable journey with flexible tiers designed for maximum impact and exclusive member rewards.</p>
            <ul className="space-y-4 text-on-surface">
              <li className="flex items-center gap-3"><MIcon icon="check_circle" className="text-primary" size="text-xl" /> Automated monthly giving cycles</li>
              <li className="flex items-center gap-3"><MIcon icon="check_circle" className="text-primary" size="text-xl" /> Tax-deductible receipt generation</li>
            </ul>
          </div>
          {/* Performance Tracking */}
          <div className="md:col-span-4 group overflow-hidden rounded-3xl bg-surface-container-high p-12 hover:ring-1 ring-primary/30 transition-all duration-500">
            <MIcon icon="query_stats" className="text-tertiary text-5xl mb-8" size="text-5xl" />
            <h3 className="text-2xl font-bold mb-4">Performance Tracking</h3>
            <p className="text-on-surface-variant mb-8 leading-relaxed">Log your rounds, track your improvement, and climb the Impact Leaderboard with every birdie.</p>
            <img className="w-full h-40 object-cover rounded-xl mt-4 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="Data visualization" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDy0uEI4dp9uNjsBk3iISO-eNaagLSW9GASNXe1VYqt40oWKURk3LQQ2enNMJeKm385WkX2EK1eaLAG7v9wuqA0QiiV_p_Xd8ryxd-LBvmC0ybTJNp9Z0ErwKg4weYaZZjgxO1hYcNT_yrBzn0nBpCx6XcosKUgFHjJbnMtRQ_Hbv9QSnHiohfw-XrKXjt_M4jbh1gRqYgJ-UuiodLDrvbbqFrb0aGGi_4Rrevzp-5B_IonvoXpTiH4-LWJs58kbew4W_c-pwPtpQ2W" />
          </div>
          {/* Monthly Prize Draws */}
          <div className="md:col-span-12 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container-low to-surface-container-lowest p-12 border border-outline-variant/10">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <MIcon icon="military_tech" className="text-secondary text-5xl mb-8" size="text-5xl" />
                <h3 className="text-3xl font-bold mb-4">Monthly Prize Draws</h3>
                <p className="text-on-surface-variant text-lg max-w-xl">Every subscription serves as an entry into our exclusive monthly prize pool. Win world-class golf experiences while your contribution funds vital global initiatives.</p>
              </div>
              <div className="w-full md:w-80 h-48 rounded-2xl glass-panel border border-outline-variant/20 p-8 flex flex-col justify-center">
                <div className="text-on-surface-variant text-xs uppercase tracking-widest mb-2">Next Draw Pool</div>
                <div className="text-4xl font-black text-white">$25,000</div>
                <div className="text-primary text-sm mt-4 font-bold">12 Days Remaining</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charity Impact Section */}
      <section className="py-32 bg-[#0b0b0b] relative">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/20 blur-[80px] rounded-full" />
            <img className="relative z-10 w-full aspect-square object-cover rounded-[3rem]" alt="Community volunteers" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAFAmOJZ1tS5sFtnJSSd5GGBNjzh1NLtpJK1JtBslzJvXhsr4DfcKxTnHekzwBcp-t9sxAz2vkEmtA7oKsKuGCXQQ0MqVOo0MKzZETEV0cs_pJgjmuqFKTcsb6mj-gRI3wvxL7HSjf9IRf5PWVJNVMAPMOhqB1xySU9h5UOQrNmw_b1acroWdlwLfqC676dmoGQXhEAxVqQ_CE9WhhtP2kanMqaUaslC7kYeeb7EiH1gFY1BGxQ0hTUlTvueyqaFNLcVV27wbtKg9G" />
            <div className="absolute bottom-8 left-8 right-8 z-20 glass-panel p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-primary-container p-2 rounded-lg">
                  <MIcon icon="volunteer_activism" className="text-surface" size="text-xl" />
                </div>
                <div className="font-bold text-white">The Clean Water Project</div>
              </div>
              <p className="text-sm text-on-surface-variant">Your contributions this month are providing filtration systems to 15 rural communities.</p>
            </div>
          </div>
          <div>
            <h2 className="text-5xl font-bold tracking-tighter mb-8">Direct Impact.<br/>Real Stories.</h2>
            <p className="text-xl text-on-surface-variant leading-relaxed mb-12">
              We believe in transparency. Choose exactly where your kinetic energy goes—from reforestation and clean water to local youth sports development.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              <div className="p-6 rounded-2xl bg-surface-container-high border-l-4 border-primary">
                <div className="text-primary font-bold text-2xl mb-1">85%</div>
                <div className="text-xs font-label uppercase text-on-surface-variant">Direct to Cause</div>
              </div>
              <div className="p-6 rounded-2xl bg-surface-container-high border-l-4 border-tertiary">
                <div className="text-tertiary font-bold text-2xl mb-1">100%</div>
                <div className="text-xs font-label uppercase text-on-surface-variant">Impact Verified</div>
              </div>
            </div>
            <button onClick={() => navigate('/charities')} className="flex items-center gap-3 text-primary font-bold text-lg hover:gap-5 transition-all group" data-testid="explore-charities-btn">
              Select Your Cause <MIcon icon="arrow_forward" size="text-xl" />
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-8 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">Choose Your Impact Level</h2>
        <p className="text-on-surface-variant mb-16">Select the plan that aligns with your passion and purpose.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface-container-low p-12 rounded-[2.5rem] border border-outline-variant/10 hover:scale-[1.02] transition-transform ease-out-expo">
            <div className="text-on-surface-variant font-label uppercase tracking-widest mb-4">Standard Kinetic</div>
            <div className="text-6xl font-bold mb-4">$9.99<span className="text-xl text-on-surface-variant font-normal">/mo</span></div>
            <p className="text-on-surface-variant mb-8">Fuel the mission monthly.</p>
            <ul className="space-y-4 mb-12 text-left">
              <li className="flex items-center gap-3"><MIcon icon="check" className="text-primary" size="text-xl" /> 1 Monthly Draw Entry</li>
              <li className="flex items-center gap-3"><MIcon icon="check" className="text-primary" size="text-xl" /> Performance Score Tracking</li>
              <li className="flex items-center gap-3"><MIcon icon="check" className="text-primary" size="text-xl" /> Monthly Impact Reports</li>
            </ul>
            <button onClick={() => navigate(user ? '/subscription' : '/signup')} className="w-full py-4 rounded-xl border border-primary text-primary font-bold hover:bg-primary/10 transition-colors" data-testid="cta-monthly-btn">Select Monthly</button>
          </div>
          <div className="relative bg-surface-container-highest p-12 rounded-[2.5rem] shadow-[0_40px_100px_rgba(76,215,246,0.15)] border border-primary/20 hover:scale-[1.02] transition-transform ease-out-expo">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary-container px-6 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Best Value</div>
            <div className="text-on-surface-variant font-label uppercase tracking-widest mb-4">Elite Kinetic</div>
            <div className="text-6xl font-bold mb-4">$99.99<span className="text-xl text-on-surface-variant font-normal">/yr</span></div>
            <p className="text-on-surface-variant mb-8">Maximum impact, 2 months free.</p>
            <ul className="space-y-4 mb-12 text-left">
              <li className="flex items-center gap-3"><MIcon icon="check" className="text-primary" size="text-xl" /> 3 Monthly Draw Entries</li>
              <li className="flex items-center gap-3"><MIcon icon="check" className="text-primary" size="text-xl" /> Elite Tier Leaderboard Access</li>
              <li className="flex items-center gap-3"><MIcon icon="check" className="text-primary" size="text-xl" /> Direct Charity Selection Control</li>
            </ul>
            <button onClick={() => navigate(user ? '/subscription' : '/signup')} className="w-full py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold shadow-lg" data-testid="cta-yearly-btn">Start Yearly Impact</button>
          </div>
        </div>
      </section>
    </div>
  );
}
