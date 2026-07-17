'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { useProgressLogs } from '@/hooks/use-progress-logs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Camera,
  Dumbbell,
  Apple,
  Users,
  CalendarCheck,
  Target,
  Minus,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Coach, MealPlan, WorkoutPlan, CheckIn } from '@/lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from '@/components/charts';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MemberDashboard() {
  const { user, profile } = useAuth();
  const { logs, loading } = useProgressLogs(user?.id);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .order('checked_in_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setCheckIns((data as CheckIn[]) ?? []));
  }, [user]);

  useEffect(() => {
    if (!profile?.assigned_coach_id) {
      setCoach(null);
      return;
    }
    supabase
      .from('coaches')
      .select('*')
      .eq('id', profile.assigned_coach_id)
      .maybeSingle()
      .then(({ data }) => setCoach(data as Coach | null));
  }, [profile?.assigned_coach_id]);

  useEffect(() => {
    if (!user || profile?.plan !== 'premium') {
      setMeals([]);
      setWorkouts([]);
      return;
    }
    supabase
      .from('meal_plans')
      .select('*')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setMeals((data as MealPlan[]) ?? []));
    supabase
      .from('workout_plans')
      .select('*')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setWorkouts((data as WorkoutPlan[]) ?? []));
  }, [user, profile?.plan]);

  const isPremium = profile?.plan === 'premium';
  const latestWeight = logs.length ? logs[logs.length - 1].weight : profile?.starting_weight;
  const firstWeight = logs.length ? logs[0].weight : profile?.starting_weight;
  const weightDiff =
    latestWeight != null && firstWeight != null
      ? Number(latestWeight) - Number(firstWeight)
      : 0;
  const WeightIcon = weightDiff > 0 ? TrendingUp : weightDiff < 0 ? TrendingDown : Minus;

  const chartData = logs
    .filter((l) => l.weight != null)
    .map((l) => ({ date: fmtDate(l.logged_at), weight: Number(l.weight) }));

  const goalProgress = Math.min(
    100,
    Math.round((logs.length / 12) * 100)
  );

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysMeals = meals.filter((m) => m.day_of_week === today);
  const todaysWorkouts = workouts.filter((w) => w.day_of_week === today);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl tracking-wide">
          Hey, {profile?.full_name?.split(' ')[0] ?? 'Athlete'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your training snapshot for today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Current Weight</span>
              <WeightIcon className="h-4 w-4 text-accent" />
            </div>
            <div className="mt-2 font-display text-3xl">
              {latestWeight != null ? `${latestWeight} kg` : '—'}
            </div>
            <div className={`text-xs mt-1 ${weightDiff > 0 ? 'text-destructive' : weightDiff < 0 ? 'text-green-400' : 'text-muted-foreground'}`}>
              {weightDiff > 0 ? `+${weightDiff.toFixed(1)}` : weightDiff < 0 ? `${weightDiff.toFixed(1)}` : '0.0'} kg since start
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Check-Ins</span>
              <Camera className="h-4 w-4 text-accent" />
            </div>
            <div className="mt-2 font-display text-3xl">{logs.length}</div>
            <div className="text-xs text-muted-foreground mt-1">progress logs</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Gym Visits</span>
              <CalendarCheck className="h-4 w-4 text-accent" />
            </div>
            <div className="mt-2 font-display text-3xl">{checkIns.length}</div>
            <div className="text-xs text-muted-foreground mt-1">recent check-ins</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Plan</span>
              <Target className="h-4 w-4 text-accent" />
            </div>
            <div className="mt-2 font-display text-3xl capitalize">{profile?.plan ?? 'basic'}</div>
            <div className="text-xs text-muted-foreground mt-1 capitalize">{profile?.subscription_status ?? 'pending'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Weight chart */}
      <Card className="glass-card">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="font-display text-xl tracking-wide">Weight Trend</CardTitle>
          <Link href="/member/dashboard/progress">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {chartData.length > 1 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ee5a2a" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f5a442" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#ee5a2a" strokeWidth={2} fill="url(#weightGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground">
              <TrendingUp className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">Log at least 2 weekly check-ins to see your weight trend.</p>
              <Link href="/member/dashboard/progress">
                <Button size="sm" variant="outline" className="mt-4">
                  <Camera className="mr-1.5 h-4 w-4" /> Log your first check-in
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's plan */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-accent" /> Today&apos;s Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPremium ? (
              <>
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Meals ({todaysMeals.length})</h4>
                  {todaysMeals.length ? (
                    <div className="space-y-2">
                      {todaysMeals.map((m) => (
                        <div key={m.id} className="rounded-lg border border-border bg-card/40 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{m.meal_name}</span>
                            <span className="text-xs text-muted-foreground">{m.time_of_day}</span>
                          </div>
                          {m.calories && <span className="text-xs text-muted-foreground">{m.calories} kcal</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No meals assigned for {today}.</p>
                  )}
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Workouts ({todaysWorkouts.length})</h4>
                  {todaysWorkouts.length ? (
                    <div className="space-y-2">
                      {todaysWorkouts.map((w) => (
                        <div key={w.id} className="rounded-lg border border-border bg-card/40 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{w.exercise_name}</span>
                            <span className="text-xs text-muted-foreground">{w.sets}×{w.reps}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No workouts assigned for {today}.</p>
                  )}
                </div>
                <Link href="/member/dashboard/plans">
                  <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                    View full week <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <div className="text-center py-6">
                <Apple className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Upgrade to <span className="text-gradient-brand font-medium">Premium</span> to unlock coach-assigned meal &amp; workout plans.
                </p>
                <Link href="/member/dashboard/profile">
                  <Button size="sm" className="mt-4 bg-gradient-brand text-primary-foreground hover:opacity-90">
                    Manage subscription
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coach */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" /> Your Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isPremium && coach ? (
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-card border border-border shrink-0">
                  {coach.photo_path ? (
                    <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${coach.photo_path}`} alt={coach.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-display text-2xl text-accent">{coach.name[0]}</div>
                  )}
                </div>
                <div>
                  <div className="font-display text-lg tracking-wide">{coach.name}</div>
                  {coach.specialty && <div className="text-sm text-accent">{coach.specialty}</div>}
                  {coach.bio && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{coach.bio}</div>}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {isPremium ? 'No coach assigned yet — admin will assign one soon.' : 'Premium members get a dedicated personal coach.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goal progress */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" /> 12-Week Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">{logs.length} of 12 weekly check-ins</span>
            <span className="font-medium">{goalProgress}%</span>
          </div>
          <Progress value={goalProgress} className="h-2" />
        </CardContent>
      </Card>
    </div>
  );
}
