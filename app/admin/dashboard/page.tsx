'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Crown, UserPlus, UserCog, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Profile, Coach } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from '@/components/charts';

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AdminDashboard() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('coaches').select('*').order('created_at', { ascending: false }),
    ]).then(([m, c]) => {
      setMembers((m.data as Profile[]) ?? []);
      setCoaches((c.data as Coach[]) ?? []);
      setLoading(false);
    });
  }, []);

  const active = members.filter((m) => m.status === 'active');
  const premium = members.filter((m) => m.plan === 'premium');
  const banned = members.filter((m) => m.status === 'banned');
  const recent = members.slice(0, 5);

  // sign-ups per day (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const chartData = last7.map((d) => {
    const count = members.filter(
      (m) => new Date(m.created_at).toDateString() === d.toDateString()
    ).length;
    return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), signups: count };
  });

  const stats = [
    { label: 'Total Members', value: members.length, icon: Users, sub: `${active.length} active` },
    { label: 'Premium Members', value: premium.length, icon: Crown, sub: `${members.length - premium.length} basic` },
    { label: 'Coaches', value: coaches.length, icon: UserCog, sub: 'on staff' },
    { label: 'Banned / Flagged', value: banned.length, icon: UserPlus, sub: 'suspended' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-4xl tracking-wide">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">Gym-wide stats and recent activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</span>
                <s.icon className="h-4 w-4 text-accent" />
              </div>
              <div className="mt-2 font-display text-4xl">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sign-ups chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" /> New Sign-Ups (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="signups" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i === chartData.length - 1 ? '#ee5a2a' : '#f5a442'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent sign-ups */}
        <Card className="glass-card">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="font-display text-xl tracking-wide">Recent Sign-Ups</CardTitle>
            <Link href="/admin/dashboard/members" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.length ? (
              recent.map((m) => (
                <Link
                  key={m.id}
                  href={`/admin/dashboard/members/${m.user_id}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card/40 px-3 py-2.5 hover:border-[#ee5a2a]/40 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full overflow-hidden bg-card border border-border shrink-0">
                    {m.profile_photo_path ? (
                      <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${m.profile_photo_path}`} alt={m.full_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs font-medium text-muted-foreground">{m.full_name[0]}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{m.full_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${m.plan === 'premium' ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'}`}>{m.plan}</span>
                    <span className="text-xs text-muted-foreground">{fmt(m.created_at)}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No members yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
