import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { Trophy, Heart, Target, ArrowRight, Star, Users, Gift, ChevronRight } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) navigate('/dashboard');
    else navigate('/signup');
  };

  return (
    <div className="min-h-screen animated-gradient-bg">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://static.prod-images.emergentagent.com/jobs/f10c4201-1bbb-4fa1-9c71-dc484ab535ed/images/0a2f770f5131bb741d1886cf4fd3048062c6a32a5b97f642eebd62493247cfd7.png"
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-2xl"
          >
            <motion.p variants={fadeUp} className="uppercase tracking-[0.2em] text-xs text-primary mb-6">
              Play with Purpose
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light tracking-tighter text-foreground leading-[1.1] mb-6"
            >
              Your Scores,<br />
              <span className="text-primary font-semibold">Their Future</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-base text-muted-foreground max-w-lg mb-10 leading-relaxed">
              A subscription platform where your golf scores fund charitable impact and enter you into monthly prize draws. Play the game you love. Change lives.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Button
                data-testid="hero-cta-btn"
                onClick={handleCTA}
                className="gold-glow px-8 py-6 text-base font-medium active:scale-95 transition-transform"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                data-testid="hero-learn-btn"
                variant="outline"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-6 text-base border-primary/30 text-primary hover:bg-primary/10"
              >
                How It Works
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Active Members', value: '2,400+', icon: Users },
            { label: 'Prize Pool', value: '$48,000', icon: Trophy },
            { label: 'Charities Supported', value: '35+', icon: Heart },
            { label: 'Total Donated', value: '$120K+', icon: Gift },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-left"
            >
              <stat.icon className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl sm:text-3xl font-serif font-semibold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="uppercase tracking-[0.2em] text-xs text-primary mb-4">The Process</motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl sm:text-5xl font-light tracking-tighter text-foreground mb-16">
              Simple Steps,<br /><span className="text-primary">Real Impact</span>
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Subscribe & Choose',
                desc: 'Pick a monthly or yearly plan. Select a charity close to your heart. A portion of your subscription goes directly to them.',
                icon: Star,
              },
              {
                step: '02',
                title: 'Enter Your Scores',
                desc: 'Submit your latest 5 Stableford golf scores. These become your draw numbers for the monthly prize pool.',
                icon: Target,
              },
              {
                step: '03',
                title: 'Win & Give Back',
                desc: 'Every month, a draw is held. Match 3, 4, or all 5 numbers to win. The jackpot rolls over if unclaimed.',
                icon: Trophy,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <span className="text-xs text-primary/60 font-mono">{item.step}</span>
                <item.icon className="h-8 w-8 text-primary mt-4 mb-4" />
                <h3 className="font-serif text-2xl text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Charity Impact */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                <motion.p variants={fadeUp} className="uppercase tracking-[0.2em] text-xs text-primary mb-4">Charity Impact</motion.p>
                <motion.h2 variants={fadeUp} className="font-serif text-4xl sm:text-5xl font-light tracking-tighter text-foreground mb-6">
                  Every Round<br /><span className="text-primary">Makes a Difference</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed mb-8">
                  When you subscribe, you choose where your contribution goes. From reforestation projects to youth sports initiatives, your passion for golf creates real-world change.
                </motion.p>
                <motion.div variants={fadeUp}>
                  <Link to="/charities">
                    <Button variant="outline" data-testid="explore-charities-btn" className="border-primary/30 text-primary hover:bg-primary/10">
                      Explore Charities <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://static.prod-images.emergentagent.com/jobs/f10c4201-1bbb-4fa1-9c71-dc484ab535ed/images/cf701cb38e4476bc1ee4790912924a998ca8d1bfc8eb3c80fa343503bf8245b1.png"
                alt="Charity impact"
                className="w-full rounded-sm border border-border/30"
              />
              <div className="absolute -bottom-6 -left-6 p-6 glass rounded-sm">
                <p className="text-3xl font-serif text-primary font-semibold">$120K+</p>
                <p className="text-sm text-muted-foreground">donated to charities</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Prize Pool */}
      <section className="py-24 border-t border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://static.prod-images.emergentagent.com/jobs/f10c4201-1bbb-4fa1-9c71-dc484ab535ed/images/7a2ed3aa4b54e79554d3be77663ed3b21a8615e0a30e83367f5a0f6e307825de.png"
            alt="" className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="uppercase tracking-[0.2em] text-xs text-primary mb-4">Monthly Draws</motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl sm:text-5xl font-light tracking-tighter text-foreground mb-16">
              Prize Pool<br /><span className="text-primary">Breakdown</span>
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { match: '5-Number Match', share: '40%', rollover: true, tier: 'Jackpot' },
              { match: '4-Number Match', share: '35%', rollover: false, tier: 'Second' },
              { match: '3-Number Match', share: '25%', rollover: false, tier: 'Third' },
            ].map((item, i) => (
              <motion.div
                key={item.match}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 border border-border/50 hover:border-primary/40 transition-all"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{item.tier} Tier</p>
                <h3 className="font-serif text-3xl text-foreground mb-2">{item.match}</h3>
                <p className="text-4xl font-serif text-primary font-semibold mb-4">{item.share}</p>
                <p className="text-sm text-muted-foreground">
                  {item.rollover ? 'Rolls over if unclaimed' : 'Split equally among winners'}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl sm:text-5xl font-light tracking-tighter text-foreground mb-6">
              Ready to Play<br /><span className="text-primary">With Purpose?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mb-10 max-w-md mx-auto">
              Join thousands of golfers making a difference. From just $9.99/month.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Button
                data-testid="cta-subscribe-btn"
                onClick={handleCTA}
                size="lg"
                className="gold-glow px-10 py-6 text-base font-medium active:scale-95 transition-transform"
              >
                Subscribe Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
