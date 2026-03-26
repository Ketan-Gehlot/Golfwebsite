import React, { useEffect, useState } from 'react';
import { getCharities } from '../lib/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { Search, Heart, ExternalLink, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CharityDirectoryPage() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadCharities();
  }, [search, filter]);

  const loadCharities = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filter === 'featured') params.featured = true;
      const res = await getCharities(params);
      setCharities(res.data.charities || []);
    } catch {}
  };

  return (
    <div className="min-h-screen animated-gradient-bg py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <p className="uppercase tracking-[0.2em] text-xs text-primary mb-4">Our Partners</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-light tracking-tighter text-foreground mb-4">
            Charity<br /><span className="text-primary">Directory</span>
          </h1>
          <p className="text-muted-foreground max-w-lg">Explore the charities you can support through your subscription. Every contribution makes a real difference.</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-testid="charity-search-input"
              placeholder="Search charities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary/50 border-border/50"
            />
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="filter-all"
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter !== 'all' ? 'border-border/50 text-muted-foreground' : ''}
            >All</Button>
            <Button
              data-testid="filter-featured"
              variant={filter === 'featured' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('featured')}
              className={filter !== 'featured' ? 'border-border/50 text-muted-foreground' : ''}
            >Featured</Button>
          </div>
        </div>

        {charities.length === 0 ? (
          <div className="text-center py-16 border border-border/50">
            <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No charities found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map((charity, i) => (
              <motion.div
                key={charity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="border border-border/50 hover:border-primary/30 transition-all group"
              >
                {charity.images?.[0] && (
                  <div className="h-40 overflow-hidden">
                    <img src={charity.images[0]} alt={charity.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {charity.logo_url && (
                        <img src={charity.logo_url} alt="" className="w-10 h-10 rounded-full object-cover border border-border/50" />
                      )}
                      <div>
                        <h3 className="font-serif text-lg text-foreground">{charity.name}</h3>
                        {charity.is_featured && <Badge className="bg-primary/20 text-primary border-primary/30 mt-1 text-xs">Featured</Badge>}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{charity.description}</p>

                  {charity.upcoming_events?.length > 0 && (
                    <div className="mb-4">
                      {charity.upcoming_events.map((ev, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 text-primary" />
                          <span>{ev.name} - {ev.date}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {charity.website_url && (
                      <a href={charity.website_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="border-border/50 text-muted-foreground hover:text-foreground">
                          <ExternalLink className="h-3 w-3 mr-1" /> Website
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
