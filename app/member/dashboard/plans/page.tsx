'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DAYS_OF_WEEK, MealPlan, WorkoutPlan, Coach } from '@/lib/types';
import { Apple, Dumbbell, Users, Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PlansPage() {
  const { user, profile } = useAuth();
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [activeDay, setActiveDay] = useState<string>(
    new Date().toLocaleDateString('en-US', { weekday: 'long' })
  );

  useEffect(() => {
    if (!user || profile?.plan !== 'premium') return;
    supabase
      .from('meal_plans')
      .select('*')
      .eq('member_id', user.id)
      .then(({ data }) => setMeals((data as MealPlan[]) ?? []));
    supabase
      .from('workout_plans')
      .select('*')
      .eq('member_id', user.id)
      .then(({ data }) => setWorkouts((data as WorkoutPlan[]) ?? []));
    if (profile.assigned_coach_id) {
      supabase
        .from('coaches')
        .select('*')
        .eq('id', profile.assigned_coach_id)
        .maybeSingle()
        .then(({ data }) => setCoach(data as Coach | null));
    }
  }, [user, profile]);

  if (profile?.plan !== 'premium') {
    return (
      <div className="animate-fade-in-up">
        <h1 className="font-display text-4xl tracking-wide mb-2">My Plans</h1>
        <Card className="glass-card max-w-lg mx-auto mt-8">
          <CardContent className="pt-10 pb-10 text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-brand-soft border border-[#ee5a2a]/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7 text-accent" />
            </div>
            <h2 className="font-display text-2xl tracking-wide">Premium Feature</h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto">
              Meal and workout plans are assigned by your personal coach. Upgrade to Premium to unlock them.
            </p>
            <Link href="/member/dashboard/profile">
              <Button className="mt-6 bg-gradient-brand text-primary-foreground hover:opacity-90">
                Manage subscription
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dayMeals = meals.filter((m) => m.day_of_week === activeDay);
  const dayWorkouts = workouts.filter((w) => w.day_of_week === activeDay);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-4xl tracking-wide">My Plans</h1>
        <p className="text-muted-foreground mt-1">Your coach-built meal &amp; workout plan, organized by day.</p>
      </div>

      {/* Coach banner */}
      {coach && (
        <Card className="glass-card">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-full overflow-hidden bg-card border border-border shrink-0">
              {coach.photo_path ? (
                <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${coach.photo_path}`} alt={coach.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-display text-xl text-accent">{coach.name[0]}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Assigned Coach</div>
              <div className="font-display text-lg tracking-wide">{coach.name}</div>
              {coach.specialty && <div className="text-sm text-accent">{coach.specialty}</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-2">
        {DAYS_OF_WEEK.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
              activeDay === day
                ? 'bg-gradient-brand text-primary-foreground'
                : 'bg-card/40 border border-border text-muted-foreground hover:text-foreground hover:border-border/80'
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Meals */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
              <Apple className="h-5 w-5 text-accent" /> Meal Plan — {activeDay}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dayMeals.length ? (
              dayMeals.map((m) => (
                <div key={m.id} className="rounded-lg border border-border bg-card/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{m.meal_name}</span>
                    <span className="text-xs text-muted-foreground bg-accent/10 px-2 py-0.5 rounded">{m.time_of_day}</span>
                  </div>
                  {m.description && <p className="text-sm text-muted-foreground mt-1">{m.description}</p>}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    {m.calories && <span>{m.calories} kcal</span>}
                    {m.protein_g != null && <span>P: {m.protein_g}g</span>}
                    {m.carbs_g != null && <span>C: {m.carbs_g}g</span>}
                    {m.fats_g != null && <span>F: {m.fats_g}g</span>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No meals assigned for {activeDay}.</p>
            )}
          </CardContent>
        </Card>

        {/* Workouts */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-accent" /> Workout Plan — {activeDay}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dayWorkouts.length ? (
              dayWorkouts.map((w) => (
                <div key={w.id} className="rounded-lg border border-border bg-card/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{w.exercise_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {w.sets && `${w.sets} sets`} {w.reps && `× ${w.reps}`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    {w.rest_seconds != null && <span>Rest: {w.rest_seconds}s</span>}
                  </div>
                  {w.notes && <p className="text-sm text-muted-foreground mt-1">{w.notes}</p>}
                  {w.video_link && (
                    <a href={w.video_link} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline mt-1 inline-block">
                      Watch demo video →
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No workouts assigned for {activeDay}.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
