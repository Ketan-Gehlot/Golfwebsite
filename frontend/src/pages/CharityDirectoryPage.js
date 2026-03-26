import React, { useEffect, useState } from 'react';
import { getCharities, setMyCharity } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { MIcon } from '../components/MIcon';

const CATEGORIES = ['All Causes', 'Education', 'Health & Wellness', 'Environmental Conservation', 'Youth Sports'];

export default function CharityDirectoryPage() {
  const { user } = useAuth();
  const [charities, setCharitiesList] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Causes');
  const [featured, setFeatured] = useState(null);

  useEffect(() => { loadCharities(); }, [search]);

  const loadCharities = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      const res = await getCharities(params);
      const all = res.data.charities || [];
      setCharitiesList(all);
      const feat = all.find(c => c.is_featured);
      if (feat) setFeatured(feat);
    } catch {}
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
        <section className="mb-16">
          <div className="relative w-full h-[400px] rounded-[2.5rem] overflow-hidden group shadow-2xl">
            {featured.images?.[0] && <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={featured.name} src={featured.images[0]} />}
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/40 to-transparent" />
            <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary/20 text-tertiary rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-tertiary/30 w-fit">
                <MIcon icon="star" size="text-sm" fill /> Charity of the Month
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-on-background mb-4 leading-none" data-testid="featured-charity-name">
                {featured.name.split(' ').map((w, i) => i === 0 ? <span key={i}>{w} </span> : <span key={i} className="text-primary">{w} </span>)}
              </h1>
              <p className="text-lg text-on-surface-variant mb-8 line-clamp-2">{featured.description}</p>
              <div className="flex flex-wrap gap-4">
                {user && (
                  <button onClick={() => handleSetCharity(featured.id)} className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform ease-out-expo active:scale-95" data-testid="set-featured-charity-btn">
                    Set as My Charity
                  </button>
                )}
                {featured.website_url && (
                  <a href={featured.website_url} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-surface-container-highest text-primary font-bold rounded-2xl hover:bg-surface-bright transition-colors border border-outline-variant/10">
                    View Impact Profile
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search & Filters */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight text-on-background mb-2">Discover Impact</h2>
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
        {charities.map((charity) => (
          <div key={charity.id} className="group bg-surface-container-low rounded-[2rem] overflow-hidden flex flex-col hover:translate-y-[-4px] transition-all duration-300 border border-outline-variant/10" data-testid={`charity-card-${charity.id}`}>
            {charity.images?.[0] && (
              <div className="relative h-56 w-full overflow-hidden">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={charity.name} src={charity.images[0]} />
                {charity.is_featured && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-surface-variant/80 backdrop-blur-md rounded-lg text-[10px] font-bold text-on-surface tracking-widest uppercase">Featured</span>
                  </div>
                )}
              </div>
            )}
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-xl font-bold mb-3 text-on-background">{charity.name}</h3>
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

              <div className="mt-auto space-y-4">
                <button onClick={() => user ? handleSetCharity(charity.id) : null}
                  className="w-full py-3 bg-surface-container-highest text-primary font-bold rounded-xl hover:bg-primary hover:text-on-primary transition-all active:scale-95"
                  data-testid={`select-charity-${charity.id}`}>
                  {user ? 'Set as My Charity' : 'Explore Mission'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* CTA Card */}
        <div className="lg:col-span-2 group relative rounded-[2rem] overflow-hidden p-12 bg-surface-container-highest flex flex-col md:flex-row items-center gap-12 border border-primary/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 text-center md:text-left">
            <h3 className="text-3xl font-black text-on-background mb-4">Don't see your favorite charity?</h3>
            <p className="text-on-surface-variant mb-8 max-w-md">Our board reviews new charity partners quarterly. Nominate a verified organization to join our ecosystem.</p>
          </div>
          <div className="relative z-10 hidden md:flex w-48 h-48 items-center justify-center">
            <div className="w-full h-full rounded-full border-4 border-dashed border-primary/30 flex items-center justify-center p-8 text-primary">
              <MIcon icon="volunteer_activism" size="text-6xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
