'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckIn } from '@/lib/types';
import { CalendarCheck, Loader2, Flame, Clock } from 'lucide-react';

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function CheckInPage() {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .order('checked_in_at', { ascending: false });
    setCheckIns((data as CheckIn[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleCheckIn = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from('check_ins').insert({ user_id: user.id });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Check-in failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Checked in!', description: 'Enjoy your workout.' });
    load();
  };

  const today = new Date().toDateString();
  const checkedInToday = checkIns.some((c) => new Date(c.checked_in_at).toDateString() === today);

  // streak: consecutive days with a check-in
  let streak = 0;
  const dates = new Set(checkIns.map((c) => new Date(c.checked_in_at).toDateString()));
  let cursor = new Date();
  while (dates.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-4xl tracking-wide">Gym Check-In</h1>
        <p className="text-muted-foreground mt-1">Log your visit and build your attendance streak.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Current Streak</span>
              <Flame className="h-5 w-5 text-accent" />
            </div>
            <div className="mt-2 font-display text-4xl">{streak} {streak === 1 ? 'day' : 'days'}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Visits</span>
              <CalendarCheck className="h-5 w-5 text-accent" />
            </div>
            <div className="mt-2 font-display text-4xl">{checkIns.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center py-6">
            <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-4 transition-all ${
              checkedInToday ? 'bg-green-500/20 border-2 border-green-500/40' : 'bg-gradient-brand-soft border-2 border-[#ee5a2a]/30'
            }`}>
              <CalendarCheck className={`h-10 w-10 ${checkedInToday ? 'text-green-400' : 'text-accent'}`} />
            </div>
            {checkedInToday ? (
              <p className="text-sm text-muted-foreground">You&apos;ve already checked in today. See you tomorrow!</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">Ready to train? Check in to log today&apos;s visit.</p>
                <Button onClick={handleCheckIn} disabled={submitting} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check In Now'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" /> Recent Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : checkIns.length ? (
            <div className="space-y-2">
              {checkIns.slice(0, 15).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-4 py-3">
                  <span className="text-sm">{fmt(c.checked_in_at)}</span>
                  <CalendarCheck className="h-4 w-4 text-accent" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No visits logged yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
