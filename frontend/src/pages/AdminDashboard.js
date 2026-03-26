import React, { useEffect, useState } from 'react';
import { adminGetUsers, adminUpdateUser, adminGetAnalytics, adminCreateCharity, adminUpdateCharity, adminDeleteCharity, getCharities, adminCreateDraw, adminSimulateDraw, adminPublishDraw, getDraws, adminGetWinners, adminReviewWinner, adminMarkPayout } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { motion } from 'framer-motion';
import { Users, Trophy, Heart, BarChart3, Plus, Play, Check, X, DollarSign, Shuffle, Eye } from 'lucide-react';

export default function AdminDashboard() {
  const [tab, setTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [charities, setCharities] = useState([]);
  const [draws, setDraws] = useState([]);
  const [winners, setWinners] = useState([]);
  const [simResult, setSimResult] = useState(null);

  // Forms
  const [newCharity, setNewCharity] = useState({ name: '', description: '', logo_url: '', website_url: '', is_featured: false });
  const [newDraw, setNewDraw] = useState({ draw_date: '', draw_logic_type: 'random' });
  const [editingCharity, setEditingCharity] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [a, u, c, d, w] = await Promise.all([
        adminGetAnalytics(), adminGetUsers(), getCharities(), getDraws(), adminGetWinners()
      ]);
      setAnalytics(a.data);
      setUsers(u.data.users || []);
      setCharities(c.data.charities || []);
      setDraws(d.data.draws || []);
      setWinners(w.data.winners || []);
    } catch {}
  };

  const handleCreateCharity = async () => {
    try {
      await adminCreateCharity(newCharity);
      setNewCharity({ name: '', description: '', logo_url: '', website_url: '', is_featured: false });
      const res = await getCharities();
      setCharities(res.data.charities || []);
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handleUpdateCharity = async () => {
    if (!editingCharity) return;
    try {
      await adminUpdateCharity(editingCharity.id, editingCharity);
      setEditingCharity(null);
      const res = await getCharities();
      setCharities(res.data.charities || []);
    } catch {}
  };

  const handleDeleteCharity = async (id) => {
    if (!window.confirm('Delete this charity?')) return;
    try {
      await adminDeleteCharity(id);
      const res = await getCharities();
      setCharities(res.data.charities || []);
    } catch {}
  };

  const handleCreateDraw = async () => {
    try {
      await adminCreateDraw(newDraw);
      setNewDraw({ draw_date: '', draw_logic_type: 'random' });
      const res = await getDraws();
      setDraws(res.data.draws || []);
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handleSimulate = async (drawId) => {
    try {
      const res = await adminSimulateDraw(drawId);
      setSimResult({ drawId, ...res.data });
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handlePublish = async (drawId, winningNumbers) => {
    try {
      await adminPublishDraw(drawId, { winning_numbers: winningNumbers });
      setSimResult(null);
      loadAll();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handleReview = async (entryId, status) => {
    try {
      await adminReviewWinner(entryId, { status });
      const res = await adminGetWinners();
      setWinners(res.data.winners || []);
    } catch {}
  };

  const handlePayout = async (entryId) => {
    try {
      await adminMarkPayout(entryId, { payout_status: 'paid' });
      const res = await adminGetWinners();
      setWinners(res.data.winners || []);
    } catch {}
  };

  const handleToggleAdmin = async (userId, currentAdmin) => {
    try {
      await adminUpdateUser(userId, { is_admin: !currentAdmin });
      const res = await adminGetUsers();
      setUsers(res.data.users || []);
    } catch {}
  };

  return (
    <div className="min-h-screen animated-gradient-bg py-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="uppercase tracking-[0.2em] text-xs text-primary mb-2">Administration</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-tighter text-foreground">
            Admin <span className="text-primary">Dashboard</span>
          </h1>
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-secondary/50 border border-border/50 mb-6 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger data-testid="admin-tab-analytics" value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"><BarChart3 className="h-3 w-3 mr-1" />Analytics</TabsTrigger>
            <TabsTrigger data-testid="admin-tab-users" value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"><Users className="h-3 w-3 mr-1" />Users</TabsTrigger>
            <TabsTrigger data-testid="admin-tab-charities" value="charities" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"><Heart className="h-3 w-3 mr-1" />Charities</TabsTrigger>
            <TabsTrigger data-testid="admin-tab-draws" value="draws" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"><Shuffle className="h-3 w-3 mr-1" />Draws</TabsTrigger>
            <TabsTrigger data-testid="admin-tab-winners" value="winners" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"><Trophy className="h-3 w-3 mr-1" />Winners</TabsTrigger>
          </TabsList>

          {/* Analytics */}
          <TabsContent value="analytics">
            {analytics && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Users" value={analytics.total_users} icon={Users} />
                <StatCard label="Active Subscribers" value={analytics.active_subscribers} icon={Check} />
                <StatCard label="Prize Pool" value={`$${analytics.current_prize_pool?.toFixed(2)}`} icon={Trophy} accent />
                <StatCard label="Total Revenue" value={`$${analytics.total_revenue?.toFixed(2)}`} icon={DollarSign} accent />
                <StatCard label="Charities" value={analytics.total_charities} icon={Heart} />
                <StatCard label="Total Draws" value={analytics.total_draws} icon={Shuffle} />
                <StatCard label="Total Winners" value={analytics.total_winners} icon={Trophy} />
              </div>
            )}
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <div className="border border-border/50 p-6 overflow-x-auto">
              <h3 className="font-serif text-xl text-foreground mb-4">All Users ({users.length})</h3>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Email</TableHead>
                    <TableHead className="text-muted-foreground">Subscription</TableHead>
                    <TableHead className="text-muted-foreground">Plan</TableHead>
                    <TableHead className="text-muted-foreground">Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} className="border-border/30">
                      <TableCell className="text-foreground">{u.first_name} {u.last_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={u.subscription_status === 'active' ? 'bg-primary/20 text-primary border-primary/30' : ''}>
                          {u.subscription_status || 'inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm capitalize">{u.subscription_plan || '-'}</TableCell>
                      <TableCell>
                        <Switch checked={u.is_admin} onCheckedChange={() => handleToggleAdmin(u.id, u.is_admin)} data-testid={`toggle-admin-${u.id}`} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Charities */}
          <TabsContent value="charities">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="border border-border/50 p-6">
                <h3 className="font-serif text-xl text-foreground mb-4">Add Charity</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Name</Label>
                    <Input data-testid="admin-charity-name" value={newCharity.name} onChange={(e) => setNewCharity({ ...newCharity, name: e.target.value })} className="mt-1 bg-secondary/50 border-border/50" />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Description</Label>
                    <Textarea data-testid="admin-charity-desc" value={newCharity.description} onChange={(e) => setNewCharity({ ...newCharity, description: e.target.value })} className="mt-1 bg-secondary/50 border-border/50" rows={3} />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Logo URL</Label>
                    <Input data-testid="admin-charity-logo" value={newCharity.logo_url} onChange={(e) => setNewCharity({ ...newCharity, logo_url: e.target.value })} className="mt-1 bg-secondary/50 border-border/50" />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Website URL</Label>
                    <Input value={newCharity.website_url} onChange={(e) => setNewCharity({ ...newCharity, website_url: e.target.value })} className="mt-1 bg-secondary/50 border-border/50" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={newCharity.is_featured} onCheckedChange={(v) => setNewCharity({ ...newCharity, is_featured: v })} />
                    <Label className="text-sm text-muted-foreground">Featured</Label>
                  </div>
                  <Button data-testid="admin-create-charity-btn" onClick={handleCreateCharity} className="w-full gold-glow active:scale-95">
                    <Plus className="h-4 w-4 mr-2" /> Add Charity
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-2 border border-border/50 p-6 overflow-x-auto">
                <h3 className="font-serif text-xl text-foreground mb-4">Charities ({charities.length})</h3>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-muted-foreground">Name</TableHead>
                      <TableHead className="text-muted-foreground">Featured</TableHead>
                      <TableHead className="text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {charities.map((c) => (
                      <TableRow key={c.id} className="border-border/30">
                        <TableCell className="text-foreground">{c.name}</TableCell>
                        <TableCell>{c.is_featured ? <Badge className="bg-primary/20 text-primary">Yes</Badge> : <span className="text-muted-foreground text-sm">No</span>}</TableCell>
                        <TableCell className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="border-border/50" onClick={() => setEditingCharity({ ...c })}>
                                <Eye className="h-3 w-3 mr-1" /> Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card border-border">
                              <DialogHeader><DialogTitle className="font-serif">Edit Charity</DialogTitle></DialogHeader>
                              {editingCharity && (
                                <div className="space-y-3">
                                  <Input value={editingCharity.name} onChange={(e) => setEditingCharity({ ...editingCharity, name: e.target.value })} className="bg-secondary/50 border-border/50" />
                                  <Textarea value={editingCharity.description} onChange={(e) => setEditingCharity({ ...editingCharity, description: e.target.value })} className="bg-secondary/50 border-border/50" rows={3} />
                                  <div className="flex items-center gap-2">
                                    <Switch checked={editingCharity.is_featured} onCheckedChange={(v) => setEditingCharity({ ...editingCharity, is_featured: v })} />
                                    <Label>Featured</Label>
                                  </div>
                                  <Button onClick={handleUpdateCharity} className="gold-glow">Save Changes</Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteCharity(c.id)} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                            <X className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Draws */}
          <TabsContent value="draws">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="border border-border/50 p-6">
                <h3 className="font-serif text-xl text-foreground mb-4">Create Draw</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Draw Date</Label>
                    <Input data-testid="admin-draw-date" type="date" value={newDraw.draw_date} onChange={(e) => setNewDraw({ ...newDraw, draw_date: e.target.value })} className="mt-1 bg-secondary/50 border-border/50" />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Logic Type</Label>
                    <Select value={newDraw.draw_logic_type} onValueChange={(v) => setNewDraw({ ...newDraw, draw_logic_type: v })}>
                      <SelectTrigger data-testid="admin-draw-logic" className="mt-1 bg-secondary/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="random">Random</SelectItem>
                        <SelectItem value="algorithmic">Algorithmic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button data-testid="admin-create-draw-btn" onClick={handleCreateDraw} className="w-full gold-glow active:scale-95">
                    <Plus className="h-4 w-4 mr-2" /> Create Draw
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-2 border border-border/50 p-6 overflow-x-auto">
                <h3 className="font-serif text-xl text-foreground mb-4">All Draws</h3>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Type</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Pool</TableHead>
                      <TableHead className="text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draws.map((d) => (
                      <TableRow key={d.id} className="border-border/30">
                        <TableCell className="text-sm">{d.draw_date}</TableCell>
                        <TableCell className="text-sm capitalize">{d.draw_logic_type}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={d.status === 'published' ? 'bg-primary/20 text-primary' : ''}>{d.status}</Badge>
                        </TableCell>
                        <TableCell className="text-primary font-serif">${d.prize_pool_amount?.toFixed(2)}</TableCell>
                        <TableCell className="flex gap-2">
                          {d.status === 'scheduled' && (
                            <>
                              <Button data-testid={`simulate-draw-${d.id}`} size="sm" variant="outline" onClick={() => handleSimulate(d.id)} className="border-primary/30 text-primary">
                                <Play className="h-3 w-3 mr-1" /> Simulate
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {simResult && (
                  <div className="mt-6 p-6 border border-primary/30 bg-primary/5">
                    <h4 className="font-serif text-lg text-foreground mb-3">Simulation Results</h4>
                    <p className="text-sm text-muted-foreground mb-2">Winning Numbers: <span className="text-primary font-semibold text-lg">{simResult.winning_numbers?.join(' - ')}</span></p>
                    <p className="text-sm text-muted-foreground">Total Entries: {simResult.total_entries}</p>
                    <p className="text-sm text-muted-foreground">5-Match: {simResult.simulation_results?.['5_match']?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">4-Match: {simResult.simulation_results?.['4_match']?.length || 0}</p>
                    <p className="text-sm text-muted-foreground mb-4">3-Match: {simResult.simulation_results?.['3_match']?.length || 0}</p>
                    <Button data-testid="publish-draw-btn" onClick={() => handlePublish(simResult.drawId, simResult.winning_numbers)} className="gold-glow active:scale-95">
                      <Check className="h-4 w-4 mr-2" /> Publish Results
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Winners */}
          <TabsContent value="winners">
            <div className="border border-border/50 p-6 overflow-x-auto">
              <h3 className="font-serif text-xl text-foreground mb-4">Winner Verification ({winners.length})</h3>
              {winners.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8">No winners yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-muted-foreground">User</TableHead>
                      <TableHead className="text-muted-foreground">Match</TableHead>
                      <TableHead className="text-muted-foreground">Amount</TableHead>
                      <TableHead className="text-muted-foreground">Verification</TableHead>
                      <TableHead className="text-muted-foreground">Payout</TableHead>
                      <TableHead className="text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {winners.map((w) => (
                      <TableRow key={w.id} className="border-border/30">
                        <TableCell className="text-foreground">{w.user_name}</TableCell>
                        <TableCell className="font-serif text-primary">{w.match_count}-match</TableCell>
                        <TableCell>${w.winnings_amount?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={w.verification_status === 'approved' ? 'bg-green-500/20 text-green-400' : w.verification_status === 'rejected' ? 'bg-destructive/20 text-destructive' : ''}>
                            {w.verification_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={w.payout_status === 'paid' ? 'bg-primary/20 text-primary' : ''}>
                            {w.payout_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          {w.verification_status === 'pending' && (
                            <>
                              <Button data-testid={`approve-${w.id}`} size="sm" onClick={() => handleReview(w.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white">
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button data-testid={`reject-${w.id}`} size="sm" variant="outline" onClick={() => handleReview(w.id, 'rejected')} className="border-destructive/30 text-destructive">
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {w.verification_status === 'approved' && w.payout_status !== 'paid' && (
                            <Button data-testid={`payout-${w.id}`} size="sm" onClick={() => handlePayout(w.id)} className="gold-glow">
                              <DollarSign className="h-3 w-3 mr-1" /> Pay
                            </Button>
                          )}
                          {w.proof_url && (
                            <a href={w.proof_url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="border-border/50"><Eye className="h-3 w-3" /></Button>
                            </a>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="border border-border/50 p-5">
      <Icon className={`h-4 w-4 ${accent ? 'text-primary' : 'text-muted-foreground'} mb-2`} />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-serif text-2xl mt-1 ${accent ? 'text-primary' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}
