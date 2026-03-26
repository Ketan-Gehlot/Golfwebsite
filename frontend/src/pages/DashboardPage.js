import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getScores, addScore, deleteScore, getMyCharity, getCharities, setMyCharity, getDraws, enterDraw, getMyWinnings, submitVerification, cancelSubscription } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { motion } from 'framer-motion';
import { Plus, Trash2, Trophy, Heart, Target, Gift, Clock, Check, X, Upload, AlertCircle, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [draws, setDraws] = useState([]);
  const [winnings, setWinnings] = useState(null);
  const [myCharity, setMyCharityData] = useState(null);
  const [charities, setCharitiesList] = useState([]);
  const [newScore, setNewScore] = useState({ score: '', score_date: '' });
  const [charitySelect, setCharitySelect] = useState({ charity_id: '', contribution_percentage: '10' });
  const [proofUrl, setProofUrl] = useState('');
  const [tab, setTab] = useState('scores');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [scoresRes, drawsRes, winRes, charityRes, charitiesRes] = await Promise.all([
        getScores(), getDraws(), getMyWinnings(), getMyCharity().catch(() => null), getCharities()
      ]);
      setScores(scoresRes.data.scores || []);
      setDraws(drawsRes.data.draws || []);
      setWinnings(winRes.data);
      if (charityRes?.data && !charityRes.data.message) setMyCharityData(charityRes.data);
      setCharitiesList(charitiesRes.data.charities || []);
    } catch {}
  };

  const handleAddScore = async (e) => {
    e.preventDefault();
    try {
      await addScore({ score: parseInt(newScore.score), score_date: newScore.score_date });
      setNewScore({ score: '', score_date: '' });
      const res = await getScores();
      setScores(res.data.scores || []);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add score');
    }
  };

  const handleDeleteScore = async (id) => {
    try {
      await deleteScore(id);
      const res = await getScores();
      setScores(res.data.scores || []);
    } catch {}
  };

  const handleSetCharity = async () => {
    try {
      await setMyCharity({
        charity_id: charitySelect.charity_id,
        contribution_percentage: parseFloat(charitySelect.contribution_percentage)
      });
      const res = await getMyCharity();
      if (res.data && !res.data.message) setMyCharityData(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to set charity');
    }
  };

  const handleEnterDraw = async (drawId) => {
    try {
      await enterDraw(drawId);
      alert('Successfully entered draw!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to enter draw');
    }
  };

  const handleVerify = async (entryId) => {
    try {
      await submitVerification(entryId, { proof_url: proofUrl });
      alert('Verification submitted!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit');
    }
  };

  const handleCancelSub = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      await cancelSubscription();
      await refreshUser();
    }
  };

  const subActive = user?.subscription_status === 'active';

  return (
    <div className="min-h-screen animated-gradient-bg py-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="uppercase tracking-[0.2em] text-xs text-primary mb-2">Dashboard</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-tighter text-foreground">
            Welcome, <span className="text-primary">{user?.first_name}</span>
          </h1>
        </motion.div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatusCard icon={Crown} label="Subscription" value={subActive ? user?.subscription_plan || 'Active' : 'Inactive'} accent={subActive} />
          <StatusCard icon={Target} label="Scores Entered" value={`${scores.length}/5`} />
          <StatusCard icon={Heart} label="Charity" value={myCharity?.charity_name || 'None'} />
          <StatusCard icon={Trophy} label="Total Won" value={`$${winnings?.total_won?.toFixed(2) || '0.00'}`} accent />
        </div>

        {!subActive && (
          <div className="p-6 border border-primary/30 bg-primary/5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-foreground font-medium">Subscription Required</p>
                <p className="text-sm text-muted-foreground">Subscribe to enter scores and join draws.</p>
              </div>
            </div>
            <Button data-testid="dashboard-subscribe-btn" onClick={() => navigate('/subscription')} className="gold-glow active:scale-95">
              Subscribe Now
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-secondary/50 border border-border/50 mb-6 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger data-testid="tab-scores" value="scores" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Scores</TabsTrigger>
            <TabsTrigger data-testid="tab-charity" value="charity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Charity</TabsTrigger>
            <TabsTrigger data-testid="tab-draws" value="draws" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Draws</TabsTrigger>
            <TabsTrigger data-testid="tab-winnings" value="winnings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Winnings</TabsTrigger>
            <TabsTrigger data-testid="tab-settings" value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Settings</TabsTrigger>
          </TabsList>

          {/* Scores Tab */}
          <TabsContent value="scores">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="border border-border/50 p-6">
                <h3 className="font-serif text-xl text-foreground mb-4">Add Score</h3>
                <form onSubmit={handleAddScore} className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Stableford Score (1-45)</Label>
                    <Input data-testid="score-input" type="number" min="1" max="45" value={newScore.score} onChange={(e) => setNewScore({ ...newScore, score: e.target.value })} required className="mt-1 bg-secondary/50 border-border/50" placeholder="36" />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Date Played</Label>
                    <Input data-testid="score-date-input" type="date" value={newScore.score_date} onChange={(e) => setNewScore({ ...newScore, score_date: e.target.value })} required className="mt-1 bg-secondary/50 border-border/50" />
                  </div>
                  <Button data-testid="add-score-btn" type="submit" disabled={!subActive} className="gold-glow active:scale-95">
                    <Plus className="h-4 w-4 mr-2" /> Add Score
                  </Button>
                </form>
              </div>

              <div className="border border-border/50 p-6">
                <h3 className="font-serif text-xl text-foreground mb-4">Your Scores</h3>
                <p className="text-xs text-muted-foreground mb-4">Latest 5 scores are retained. New scores replace the oldest.</p>
                {scores.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-8">No scores entered yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead className="text-muted-foreground">Score</TableHead>
                        <TableHead className="text-muted-foreground">Date</TableHead>
                        <TableHead className="text-muted-foreground w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scores.map((s) => (
                        <TableRow key={s.id} className="border-border/30">
                          <TableCell className="font-serif text-xl text-primary">{s.score}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{s.score_date}</TableCell>
                          <TableCell>
                            <button data-testid={`delete-score-${s.id}`} onClick={() => handleDeleteScore(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {scores.length === 5 && (
                  <div className="mt-4 p-3 bg-primary/5 border border-primary/20 text-sm">
                    <p className="text-foreground">Your draw numbers: <span className="text-primary font-semibold">{scores.map(s => s.score).join(' - ')}</span></p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Charity Tab */}
          <TabsContent value="charity">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="border border-border/50 p-6">
                <h3 className="font-serif text-xl text-foreground mb-4">Select Your Charity</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Charity</Label>
                    <Select value={charitySelect.charity_id} onValueChange={(v) => setCharitySelect({ ...charitySelect, charity_id: v })}>
                      <SelectTrigger data-testid="charity-select" className="mt-1 bg-secondary/50 border-border/50">
                        <SelectValue placeholder="Choose a charity" />
                      </SelectTrigger>
                      <SelectContent>
                        {charities.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Contribution % (min 10%)</Label>
                    <Input data-testid="contribution-input" type="number" min="10" max="100" value={charitySelect.contribution_percentage} onChange={(e) => setCharitySelect({ ...charitySelect, contribution_percentage: e.target.value })} className="mt-1 bg-secondary/50 border-border/50" />
                  </div>
                  <Button data-testid="save-charity-btn" onClick={handleSetCharity} className="gold-glow active:scale-95">
                    <Heart className="h-4 w-4 mr-2" /> Save Selection
                  </Button>
                </div>
              </div>
              <div className="border border-border/50 p-6">
                <h3 className="font-serif text-xl text-foreground mb-4">Current Selection</h3>
                {myCharity ? (
                  <div>
                    <p className="text-foreground font-medium">{myCharity.charity_name}</p>
                    <p className="text-primary text-2xl font-serif mt-2">{myCharity.contribution_percentage}%</p>
                    <p className="text-sm text-muted-foreground mt-1">of your subscription goes to this charity</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm py-8">No charity selected yet. Choose one to start giving back!</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Draws Tab */}
          <TabsContent value="draws">
            <div className="border border-border/50 p-6">
              <h3 className="font-serif text-xl text-foreground mb-4">Monthly Draws</h3>
              {draws.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8">No draws available yet. Check back soon!</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Prize Pool</TableHead>
                      <TableHead className="text-muted-foreground">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draws.map((d) => (
                      <TableRow key={d.id} className="border-border/30">
                        <TableCell className="text-sm">{d.draw_date}</TableCell>
                        <TableCell>
                          <Badge variant={d.status === 'published' ? 'default' : 'secondary'} className={d.status === 'published' ? 'bg-primary/20 text-primary border-primary/30' : ''}>
                            {d.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-serif text-primary">${d.prize_pool_amount?.toFixed(2)}</TableCell>
                        <TableCell>
                          {d.status === 'scheduled' && subActive && scores.length >= 5 && (
                            <Button data-testid={`enter-draw-${d.id}`} size="sm" onClick={() => handleEnterDraw(d.id)} className="active:scale-95">
                              Enter Draw
                            </Button>
                          )}
                          {d.status === 'published' && (
                            <Button variant="outline" size="sm" onClick={() => navigate(`/draws/${d.id}`)} className="border-primary/30 text-primary">
                              View Results
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Winnings Tab */}
          <TabsContent value="winnings">
            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              <div className="border border-border/50 p-6">
                <p className="text-sm text-muted-foreground">Total Won</p>
                <p className="font-serif text-3xl text-primary">${winnings?.total_won?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="border border-border/50 p-6">
                <p className="text-sm text-muted-foreground">Pending Payout</p>
                <p className="font-serif text-3xl text-foreground">${winnings?.pending_payout?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="border border-border/50 p-6">
                <p className="text-sm text-muted-foreground">Paid Out</p>
                <p className="font-serif text-3xl text-foreground">${winnings?.paid_out?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            {winnings?.entries?.length > 0 ? (
              <div className="border border-border/50 p-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-muted-foreground">Match</TableHead>
                      <TableHead className="text-muted-foreground">Amount</TableHead>
                      <TableHead className="text-muted-foreground">Verification</TableHead>
                      <TableHead className="text-muted-foreground">Payout</TableHead>
                      <TableHead className="text-muted-foreground">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {winnings.entries.map((e) => (
                      <TableRow key={e.id} className="border-border/30">
                        <TableCell className="font-serif text-primary">{e.match_count}-match</TableCell>
                        <TableCell>${e.winnings_amount?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={e.verification_status === 'approved' ? 'bg-green-500/20 text-green-400' : ''}>{e.verification_status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={e.payout_status === 'paid' ? 'bg-primary/20 text-primary' : ''}>{e.payout_status}</Badge>
                        </TableCell>
                        <TableCell>
                          {e.verification_status === 'pending_upload' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="border-primary/30 text-primary">
                                  <Upload className="h-3 w-3 mr-1" /> Verify
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-card border-border">
                                <DialogHeader>
                                  <DialogTitle className="font-serif text-foreground">Submit Verification</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm text-muted-foreground">Screenshot URL of your scores</Label>
                                    <Input data-testid="proof-url-input" value={proofUrl} onChange={(ev) => setProofUrl(ev.target.value)} placeholder="https://..." className="mt-1 bg-secondary/50 border-border/50" />
                                  </div>
                                  <Button data-testid="submit-proof-btn" onClick={() => handleVerify(e.id)} className="gold-glow">Submit Proof</Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="border border-border/50 p-8 text-center">
                <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No winnings yet. Enter draws to start winning!</p>
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="border border-border/50 p-6 max-w-md">
              <h3 className="font-serif text-xl text-foreground mb-4">Subscription</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={subActive ? 'default' : 'secondary'} className={subActive ? 'bg-primary/20 text-primary border-primary/30' : ''}>
                    {user?.subscription_status || 'inactive'}
                  </Badge>
                </div>
                {user?.subscription_plan && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="text-foreground capitalize">{user.subscription_plan}</span>
                  </div>
                )}
                {user?.subscription_end_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Renewal Date</span>
                    <span className="text-foreground">{new Date(user.subscription_end_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              {subActive ? (
                <Button data-testid="cancel-subscription-btn" variant="outline" onClick={handleCancelSub} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                  Cancel Subscription
                </Button>
              ) : (
                <Button data-testid="resubscribe-btn" onClick={() => navigate('/subscription')} className="gold-glow">
                  Subscribe
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatusCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="border border-border/50 p-4">
      <Icon className={`h-4 w-4 ${accent ? 'text-primary' : 'text-muted-foreground'} mb-2`} />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-medium text-sm mt-1 truncate ${accent ? 'text-primary' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}
