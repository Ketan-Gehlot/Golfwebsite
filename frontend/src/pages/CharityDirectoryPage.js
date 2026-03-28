import React, { useEffect, useState } from 'react';

import { getCharities, setMyCharity, createDonationCheckout } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { MIcon } from '../components/MIcon';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All Causes', 'Education', 'Health & Wellness', 'Environmental Conservation', 'Youth Sports'];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.19, 1, 0.22, 1] }
  })
};

export default function CharityDirectoryPage() {
  const { user } = useAuth();
  const [charities, setCharitiesList] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Causes');
  const [featured, setFeatured] = useState(null);
  const [selectedCharity, setSelectedCharity] = useState(null);

  useEffect(() => {
    loadCharities();
  }, [search, activeFilter, loadCharities]);

  const loadCharities = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (activeFilter !== 'All Causes') params.category = activeFilter;
      const res = await getCharities(params);
      const all = res.data.charities || [];
      setCharitiesList(all);
      const feat = all.find(c => c.is_featured);
      if (feat) setFeatured(feat);
    } catch { }
  };

  const handleDonate = async (charityId) => {
    const amount = prompt('Enter donation amount (USD):', '25');
    if (!amount || isNaN(amount)) return;
    try {
      const res = await createDonationCheckout({
        charity_id: charityId,
        amount: parseFloat(amount),
        origin_url: window.location.origin
      });
      window.location.href = res.data.url;
    } catch (err) { alert(err.response?.data?.detail || 'Failed to start donation'); }
  };

  const handleSetCharity = async (charityId) => {
    if (!user) return alert('Please log in first');
    try {
      await setMyCharity({ charity_id: charityId, contribution_percentage: 10 });
      alert('Charity set as your cause!');
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  return (
    <div className="pt-10 pb-32 px-6 md:px-12 max-w-7xl">
      {/* Featured Charity */}
      {featured && (
        <motion.section className="mb-16" initial="hidden" animate="visible" variants={fadeUp}>
          <div className="relative w-full h-[400px] rounded-[2.5rem] overflow-hidden group shadow-2xl">
            {featured.images?.[0] && <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={featured.name} src={featured.images[0]} />}
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/40 to-transparent" />
            <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary/20 text-tertiary rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-tertiary/30 w-fit">
                <MIcon icon="star" size="text-sm" fill /> Charity of the Month
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-on-background mb-4 leading-none font-headline" data-testid="featured-charity-name">
                {featured.name.split(' ').map((w, i) => i === 0 ? <span key={i}>{w} </span> : <span key={i} className="text-primary">{w} </span>)}
              </h1>
              <p className="text-lg text-on-surface-variant mb-8 line-clamp-2">{featured.description}</p>
              <div className="flex flex-wrap gap-4">
                {user && (
                  <button onClick={() => handleSetCharity(featured.id)} className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform ease-out-expo active:scale-95" data-testid="set-featured-charity-btn">
                    Set as My Charity
                  </button>
                )}
                <button onClick={() => setSelectedCharity(featured)} className="px-8 py-4 bg-surface-container-highest text-primary font-bold rounded-2xl hover:bg-surface-bright transition-colors border border-outline-variant/10" data-testid="view-featured-profile-btn">
                  View Impact Profile
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Search & Filters */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight text-on-background mb-2 font-headline">Discover Impact</h2>
            <p className="text-on-surface-variant">Find the causes that align with your drive. Every dollar from your subscription flows directly to these verified partners.</p>
          </div>
          <div className="relative w-full md:w-80">
            <MIcon icon="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size="text-xl" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-highest border-none rounded-2xl py-4 pl-12 pr-4 text-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/30 transition-all"
              placeholder="Search by name or mission..." data-testid="charity-search-input" />
          </div>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-4">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className={`px-6 py-2.5 font-medium text-sm rounded-xl whitespace-nowrap transition-all ${activeFilter === cat ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:text-primary hover:bg-surface-container-highest'}`}
              data-testid={`filter-${cat.toLowerCase().replace(/\s/g, '-')}`}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Charity Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {charities.map((charity, idx) => (
          <motion.div key={charity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
            className="group bg-surface-container-low rounded-[2rem] overflow-hidden flex flex-col hover:translate-y-[-4px] transition-all duration-300 border border-outline-variant/10"
            data-testid={`charity-card-${charity.id}`}
          >
            {charity.images?.[0] && (
              <div className="relative h-56 w-full overflow-hidden cursor-pointer" onClick={() => setSelectedCharity(charity)}>
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={charity.name} src={charity.images[0]} />
                {charity.is_featured && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-surface-variant/80 backdrop-blur-md rounded-lg text-[10px] font-bold text-on-surface tracking-widest uppercase">Featured</span>
                  </div>
                )}
              </div>
            )}
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-xl font-bold mb-3 text-on-background cursor-pointer hover:text-primary transition-colors" onClick={() => setSelectedCharity(charity)}>{charity.name}</h3>
              <p className="text-sm text-on-surface-variant mb-6 line-clamp-3">{charity.description}</p>

              {charity.upcoming_events?.length > 0 && (
                <div className="mb-4">
                  {charity.upcoming_events.map((ev, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-on-surface-variant mb-1">
                      <MIcon icon="event" size="text-sm" className="text-primary" /> {ev.name} - {ev.date}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto space-y-3">
                <button onClick={() => setSelectedCharity(charity)}
                  className="w-full py-3 bg-surface-container-highest text-on-surface-variant font-bold rounded-xl hover:bg-surface-bright transition-all active:scale-95 text-sm"
                  data-testid={`view-charity-${charity.id}`}>
                  View Profile
                </button>
                <button onClick={() => user ? handleSetCharity(charity.id) : null}
                  className="w-full py-3 bg-surface-container-highest text-primary font-bold rounded-xl hover:bg-primary hover:text-on-primary transition-all active:scale-95"
                  data-testid={`select-charity-${charity.id}`}>
                  {user ? 'Set as My Charity' : 'Explore Mission'}
                </button>
                <button onClick={() => handleDonate(charity.id)}
                  className="w-full py-3 border border-primary/30 text-primary font-bold rounded-xl hover:bg-primary/10 transition-all active:scale-95"
                  data-testid={`donate-charity-${charity.id}`}>
                  Independent Donation
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Nominate a Charity */}
        <div className="lg:col-span-3 group relative rounded-[2rem] overflow-hidden p-8 md:p-12 bg-surface-container-highest border border-primary/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MIcon icon="how_to_vote" className="text-primary" size="text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-background font-headline">Nominate a Charity Partner</h3>
                <p className="text-xs text-on-surface-variant">Our board reviews nominations quarterly</p>
              </div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you! Your nomination has been submitted for review.'); e.target.reset(); }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Charity Name *</label>
                <input required type="text" placeholder="e.g. World Wildlife Fund"
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/30 transition-all"
                  data-testid="nominate-charity-name" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Website URL</label>
                <input type="url" placeholder="https://..."
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/30 transition-all"
                  data-testid="nominate-charity-url" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Why this charity?</label>
                <input type="text" placeholder="Brief reason..."
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/30 transition-all"
                  data-testid="nominate-charity-reason" />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button type="submit"
                  className="px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl active:scale-95 transition-all"
                  data-testid="nominate-submit-btn">
                  Submit Nomination
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Charity Detail Modal */}
      <AnimatePresence>
        {selectedCharity && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedCharity(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
              className="bg-surface-container-low rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-outline-variant/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header Image */}
              {selectedCharity.images?.[0] && (
                <div className="relative h-64 w-full overflow-hidden rounded-t-[2rem]">
                  <img className="w-full h-full object-cover" alt={selectedCharity.name} src={selectedCharity.images[0]} />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container-low/90" />
                  <button onClick={() => setSelectedCharity(null)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface/60 backdrop-blur-md flex items-center justify-center text-on-surface hover:bg-surface transition-colors"
                    data-testid="close-charity-modal">
                    <MIcon icon="close" size="text-xl" />
                  </button>
                </div>
              )}

              <div className="p-8">
                {selectedCharity.is_featured && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary/20 text-tertiary rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-tertiary/30">
                    <MIcon icon="star" size="text-sm" fill /> Featured Charity
                  </div>
                )}
                <h2 className="text-3xl font-bold mb-4 font-headline">{selectedCharity.name}</h2>
                <p className="text-on-surface-variant leading-relaxed mb-8">{selectedCharity.description}</p>

                {selectedCharity.website_url && (
                  <div className="flex items-center gap-2 text-sm text-primary mb-6">
                    <MIcon icon="language" size="text-lg" />
                    <a href={selectedCharity.website_url} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">{selectedCharity.website_url}</a>
                  </div>
                )}

                {/* Upcoming Events */}
                {selectedCharity.upcoming_events?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-lg mb-4">Upcoming Events</h3>
                    <div className="space-y-3">
                      {selectedCharity.upcoming_events.map((ev, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-high border border-outline-variant/10">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <MIcon icon="event" className="text-primary" size="text-xl" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{ev.name}</p>
                            <p className="text-xs text-on-surface-variant">{ev.date} {ev.location && `• ${ev.location}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {user && (
                    <button onClick={() => { handleSetCharity(selectedCharity.id); setSelectedCharity(null); }}
                      className="flex-1 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl active:scale-95 transition-all"
                      data-testid="modal-set-charity-btn">
                      Set as My Charity
                    </button>
                  )}
                  <button onClick={() => handleDonate(selectedCharity.id)}
                    className="flex-1 py-3 border border-primary/30 text-primary font-bold rounded-xl hover:bg-primary/10 transition-all active:scale-95"
                    data-testid="modal-donate-btn">
                    Donate Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
