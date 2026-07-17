'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Profile } from '@/lib/types';
import { Search, Users, Loader2, Ban, CheckCircle2, Crown } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'basic' | 'premium'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');
  const { toast } = useToast();

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMembers((data as Profile[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        !search ||
        m.full_name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase());
      const matchesPlan = planFilter === 'all' || m.plan === planFilter;
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [members, search, planFilter, statusFilter]);

  const toggleBan = async (m: Profile) => {
    const newStatus = m.status === 'banned' ? 'active' : 'banned';
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', m.id);
    if (error) {
      toast({ title: 'Action failed', description: error.message, variant: 'destructive' });
      return;
    }
    setMembers((prev) => prev.map((p) => (p.id === m.id ? { ...p, status: newStatus } : p)));
    toast({
      title: newStatus === 'banned' ? 'Member banned' : 'Member reinstated',
      description: `${m.full_name} is now ${newStatus}.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-4xl tracking-wide">Members</h1>
        <p className="text-muted-foreground mt-1">{members.length} total — search, filter, and manage.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as any)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All plans</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length ? (
        <div className="grid gap-3">
          {filtered.map((m) => (
            <Card key={m.id} className="glass-card hover:border-[#ee5a2a]/40 transition-colors">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-card border border-border shrink-0">
                  {m.profile_photo_path ? (
                    <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${m.profile_photo_path}`} alt={m.full_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-display text-lg text-accent">{m.full_name[0]}</div>
                  )}
                </div>
                <Link href={`/admin/dashboard/members/${m.user_id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{m.full_name}</span>
                    {m.plan === 'premium' && <Crown className="h-3.5 w-3.5 text-accent shrink-0" />}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                </Link>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded capitalize ${m.plan === 'premium' ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'}`}>{m.plan}</span>
                  <span className={`text-xs px-2 py-0.5 rounded capitalize ${m.status === 'active' ? 'bg-green-500/15 text-green-400' : m.status === 'banned' ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground'}`}>{m.status}</span>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      {m.status === 'banned' ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Ban className="h-4 w-4 text-destructive" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{m.status === 'banned' ? 'Reinstate member?' : 'Ban member?'}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {m.status === 'banned'
                          ? `This will restore ${m.full_name}'s account access.`
                          : `This will ban ${m.full_name}. They will be unable to log in or use the app.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => toggleBan(m)}
                        className={m.status === 'banned' ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive hover:bg-destructive/90'}
                      >
                        {m.status === 'banned' ? 'Reinstate' : 'Ban'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Users className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm">No members match your filters.</p>
        </div>
      )}
    </div>
  );
}
