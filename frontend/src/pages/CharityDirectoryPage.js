import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [charities, setCharitiesList] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Causes');
  const [featured, setFeatured] = useState(null);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCharities = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (activeFilter !== 'All Causes') params.category = activeFilter;
      const res = await getCharities(params);
      const all = res.data.charities || [];
      setCharitiesList(all);
      const feat = all.find(c => c.is_featured);
      setFeatured(feat || null);
    } catch (err) {
      console.error('Failed to load charities:', err);
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter]);

  useEffect(() => { loadCharities(); }, [loadCharities]);

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
    <div className="pt-10 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
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
        {loading && (
          <div className="lg:col-span-3 flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-on-surface-variant text-sm">Loading charities...</p>
            </div>
          </div>
        )}
        {!loading && charities.length === 0 && (
          <div className="lg:col-span-3 flex flex-col items-center justify-center py-20">
            <MIcon icon="search_off" size="text-5xl" className="text-on-surface-variant/50 mb-4" />
            <h3 className="text-xl font-bold text-on-surface-variant mb-2">No charities found</h3>
            <p className="text-on-surface-variant/70 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
        {charities.map((charity, idx) => (
          <motion.div key={charity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
            className="group bg-surface-container-low rounded-2xl overflow-hidden flex flex-col hover:translate-y-[-4px] transition-all duration-300 border border-outline-variant/10 hover:border-primary/15"
            data-testid={`charity-card-${charity.id}`}
          >
            {/* Image or Placeholder */}
            <div className="relative h-44 w-full overflow-hidden cursor-pointer" onClick={() => setSelectedCharity(charity)}>
              {charity.images?.[0] ? (
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={charity.name} src={charity.images[0]} />
              ) : (
                <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                  <MIcon icon="volunteer_activism" className="text-on-surface-variant/30" size="text-5xl" />
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                {charity.is_featured && (
                  <span className="px-2 py-0.5 bg-tertiary/90 backdrop-blur-md rounded-lg text-[9px] font-bold text-on-tertiary tracking-widest uppercase flex items-center gap-1">
                    <MIcon icon="star" size="text-xs" fill /> Featured
                  </span>
                )}
                {charity.category && (
                  <span className="px-2 py-0.5 bg-surface/70 backdrop-blur-md rounded-lg text-[9px] font-bold text-on-surface tracking-wider uppercase">
                    {charity.category}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
              {/* Logo + Name */}
              <div className="flex items-start gap-3 mb-2">
                {charity.logo_url && (
                  <img src={charity.logo_url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-outline-variant/20" />
                )}
                <h3 className="text-base font-bold text-on-background cursor-pointer hover:text-primary transition-colors leading-snug" onClick={() => setSelectedCharity(charity)}>
                  {charity.name}
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant mb-4 line-clamp-2 leading-relaxed">{charity.description}</p>

              {/* Events */}
              {charity.upcoming_events?.length > 0 && (
                <div className="mb-3">
                  {charity.upcoming_events.slice(0, 1).map((ev, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                      <MIcon icon="event" size="text-xs" className="text-primary" /> {ev.name} — {ev.date}
                    </div>
                  ))}
                </div>
              )}

              {/* Website link */}
              {charity.website_url && (
                <a href={charity.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-primary hover:underline mb-3">
                  <MIcon icon="language" size="text-xs" /> Visit Website
                </a>
              )}

              {/* Action Buttons */}
              <div className="mt-auto space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setSelectedCharity(charity)}
                    className="py-2 bg-surface-container-highest text-on-surface-variant font-semibold rounded-lg hover:bg-surface-bright transition-all active:scale-95 text-xs"
                    data-testid={`view-charity-${charity.id}`}>
                    View Profile
                  </button>
                  <button onClick={() => user ? handleSetCharity(charity.id) : navigate('/signup')}
                    className="py-2 bg-surface-container-highest text-primary font-semibold rounded-lg hover:bg-primary hover:text-on-primary transition-all active:scale-95 text-xs"
                    data-testid={`select-charity-${charity.id}`}>
                    {user ? 'Set as Mine' : 'Join to Support'}
                  </button>
                </div>
                {user && (
                  <button onClick={() => handleDonate(charity.id)}
                    className="w-full py-2 border border-primary/20 text-primary font-semibold rounded-lg hover:bg-primary/10 transition-all active:scale-95 text-xs"
                    data-testid={`donate-charity-${charity.id}`}>
                    <MIcon icon="favorite" size="text-xs" className="mr-1" /> Donate Directly
                  </button>
                )}
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
