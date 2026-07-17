'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Coach, Profile } from '@/lib/types';
import { UserCog, Plus, Trash2, Pencil, X, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Coach | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: '',
    specialty: '',
    bio: '',
    email: '',
    phone: '',
  });

  const load = async () => {
    const [c, m] = await Promise.all([
      supabase.from('coaches').select('*').order('name'),
      supabase.from('profiles').select('*').eq('plan', 'premium'),
    ]);
    setCoaches((c.data as Coach[]) ?? []);
    setMembers((m.data as Profile[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', specialty: '', bio: '', email: '', phone: '' });
    setOpen(true);
  };

  const openEdit = (coach: Coach) => {
    setEditing(coach);
    setForm({
      name: coach.name,
      specialty: coach.specialty ?? '',
      bio: coach.bio ?? '',
      email: coach.email ?? '',
      phone: coach.phone ?? '',
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    if (editing) {
      const { error } = await supabase
        .from('coaches')
        .update({
          name: form.name,
          specialty: form.specialty || null,
          bio: form.bio || null,
          email: form.email || null,
          phone: form.phone || null,
        })
        .eq('id', editing.id);
      if (error) {
        toast({ title: 'Failed', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Coach updated' });
    } else {
      const { error } = await supabase.from('coaches').insert({
        name: form.name,
        specialty: form.specialty || null,
        bio: form.bio || null,
        email: form.email || null,
        phone: form.phone || null,
      });
      if (error) {
        toast({ title: 'Failed', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Coach added' });
    }
    setOpen(false);
    load();
  };

  const remove = async (coach: Coach) => {
    const { error } = await supabase.from('coaches').delete().eq('id', coach.id);
    if (error) {
      toast({ title: 'Failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Coach removed' });
    load();
  };

  const assignedCount = (coachId: string) =>
    members.filter((m) => m.assigned_coach_id === coachId).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-wide">Coaches</h1>
          <p className="text-muted-foreground mt-1">{coaches.length} coaches on staff.</p>
        </div>
        <Button onClick={openNew} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4 mr-1" /> Add Coach
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      ) : coaches.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coaches.map((coach) => (
            <Card key={coach.id} className="glass-card group">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-card border border-border shrink-0 flex items-center justify-center">
                    {coach.photo_path ? (
                      <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${coach.photo_path}`} alt={coach.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-display text-2xl text-accent">{coach.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-lg tracking-wide">{coach.name}</div>
                    {coach.specialty && <div className="text-sm text-accent">{coach.specialty}</div>}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Users className="h-3 w-3" /> {assignedCount(coach.id)} premium member{assignedCount(coach.id) !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                {coach.bio && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{coach.bio}</p>}
                {coach.email && <p className="text-xs text-muted-foreground mt-2">{coach.email}</p>}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => openEdit(coach)} className="flex-1">
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(coach)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <UserCog className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm">No coaches yet. Add your first coach to get started.</p>
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-wide">
              {editing ? 'Edit Coach' : 'Add Coach'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input id="specialty" placeholder="e.g. Strength & Conditioning" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Short bio..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-gradient-brand text-primary-foreground hover:opacity-90">
                {editing ? 'Save Changes' : 'Add Coach'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
