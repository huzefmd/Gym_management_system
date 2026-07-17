'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Crown,
  Trash2,
  Plus,
  Apple,
  Dumbbell,
  UserCog,
  Camera,
} from 'lucide-react';
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
import { Profile, Coach, MealPlan, WorkoutPlan, ProgressLog, DAYS_OF_WEEK, MEAL_TIMES } from '@/lib/types';

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;
  const { toast } = useToast();

  const [member, setMember] = useState<Profile | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [assignedCoach, setAssignedCoach] = useState<Coach | null>(null);
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);

  // new meal form
  const [mealForm, setMealForm] = useState({
    day_of_week: 'Monday',
    meal_name: '',
    description: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fats_g: '',
    time_of_day: 'Breakfast',
  });
  // new workout form
  const [workoutForm, setWorkoutForm] = useState({
    day_of_week: 'Monday',
    exercise_name: '',
    sets: '',
    reps: '',
    rest_seconds: '',
    notes: '',
    video_link: '',
  });

  const loadAll = async () => {
    const [m, c, ml, w, p] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', memberId).maybeSingle(),
      supabase.from('coaches').select('*').order('name'),
      supabase.from('meal_plans').select('*').eq('member_id', memberId).order('created_at', { ascending: false }),
      supabase.from('workout_plans').select('*').eq('member_id', memberId).order('created_at', { ascending: false }),
      supabase.from('progress_logs').select('*').eq('user_id', memberId).order('logged_at', { ascending: false }),
    ]);
    const memberData = m.data as Profile | null;
    setMember(memberData);
    setCoaches((c.data as Coach[]) ?? []);
    setMeals((ml.data as MealPlan[]) ?? []);
    setWorkouts((w.data as WorkoutPlan[]) ?? []);
    setProgressLogs((p.data as ProgressLog[]) ?? []);
    if (memberData?.assigned_coach_id) {
      const { data } = await supabase.from('coaches').select('*').eq('id', memberData.assigned_coach_id).maybeSingle();
      setAssignedCoach(data as Coach | null);
    } else {
      setAssignedCoach(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [memberId]);

  const isPremium = member?.plan === 'premium';

  const assignCoach = async (coachId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ assigned_coach_id: coachId || null })
      .eq('user_id', memberId);
    if (error) {
      toast({ title: 'Failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Coach assigned' });
    loadAll();
  };

  const toggleBan = async () => {
    if (!member) return;
    const newStatus = member.status === 'banned' ? 'active' : 'banned';
    await supabase.from('profiles').update({ status: newStatus }).eq('id', member.id);
    toast({ title: newStatus === 'banned' ? 'Member banned' : 'Member reinstated' });
    loadAll();
  };

  const addMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealForm.meal_name) return;
    const { error } = await supabase.from('meal_plans').insert({
      member_id: memberId,
      coach_id: member?.assigned_coach_id ?? null,
      day_of_week: mealForm.day_of_week,
      meal_name: mealForm.meal_name,
      description: mealForm.description || null,
      calories: mealForm.calories ? Number(mealForm.calories) : null,
      protein_g: mealForm.protein_g ? Number(mealForm.protein_g) : null,
      carbs_g: mealForm.carbs_g ? Number(mealForm.carbs_g) : null,
      fats_g: mealForm.fats_g ? Number(mealForm.fats_g) : null,
      time_of_day: mealForm.time_of_day,
    });
    if (error) {
      toast({ title: 'Failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Meal added' });
    setMealForm({ ...mealForm, meal_name: '', description: '', calories: '', protein_g: '', carbs_g: '', fats_g: '' });
    loadAll();
  };

  const addWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutForm.exercise_name) return;
    const { error } = await supabase.from('workout_plans').insert({
      member_id: memberId,
      coach_id: member?.assigned_coach_id ?? null,
      day_of_week: workoutForm.day_of_week,
      exercise_name: workoutForm.exercise_name,
      sets: workoutForm.sets ? Number(workoutForm.sets) : null,
      reps: workoutForm.reps || null,
      rest_seconds: workoutForm.rest_seconds ? Number(workoutForm.rest_seconds) : null,
      notes: workoutForm.notes || null,
      video_link: workoutForm.video_link || null,
    });
    if (error) {
      toast({ title: 'Failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Workout added' });
    setWorkoutForm({ ...workoutForm, exercise_name: '', sets: '', reps: '', rest_seconds: '', notes: '', video_link: '' });
    loadAll();
  };

  const deleteMeal = async (id: string) => {
    await supabase.from('meal_plans').delete().eq('id', id);
    loadAll();
    toast({ title: 'Meal removed' });
  };

  const deleteWorkout = async (id: string) => {
    await supabase.from('workout_plans').delete().eq('id', id);
    loadAll();
    toast({ title: 'Workout removed' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Member not found.</p>
        <Link href="/admin/dashboard/members">
          <Button variant="outline" className="mt-4">Back to members</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard/members">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl tracking-wide">{member.full_name}</h1>
            {isPremium && <Crown className="h-5 w-5 text-accent" />}
          </div>
          <p className="text-sm text-muted-foreground">{member.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded capitalize ${member.plan === 'premium' ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'}`}>{member.plan}</span>
          <span className={`text-xs px-2 py-1 rounded capitalize ${member.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-destructive/15 text-destructive'}`}>{member.status}</span>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant={member.status === 'banned' ? 'default' : 'destructive'} size="sm">
              {member.status === 'banned' ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <Ban className="h-4 w-4 mr-1" />}
              {member.status === 'banned' ? 'Reinstate' : 'Ban'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{member.status === 'banned' ? 'Reinstate member?' : 'Ban member?'}</AlertDialogTitle>
              <AlertDialogDescription>
                {member.status === 'banned' ? 'This will restore account access.' : 'This will suspend account access.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={toggleBan}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Profile details */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass-card lg:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="h-28 w-28 rounded-full overflow-hidden bg-card border-2 border-border mb-4">
              {member.profile_photo_path ? (
                <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${member.profile_photo_path}`} alt={member.full_name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-display text-4xl text-accent">{member.full_name[0]}</div>
              )}
            </div>
            <div className="w-full space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{member.phone || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">DOB</span><span>{member.date_of_birth ? fmt(member.date_of_birth) : '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Gender</span><span className="capitalize">{member.gender || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Height</span><span>{member.height ? `${member.height} cm` : '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Start weight</span><span>{member.starting_weight ? `${member.starting_weight} kg` : '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><span>{fmt(member.created_at)}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-wide">Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Address</span><p className="mt-1">{member.address || '—'}</p></div>
            <div><span className="text-muted-foreground">Emergency contact</span><p className="mt-1">{member.emergency_contact || '—'}</p></div>
            <div className="sm:col-span-2"><span className="text-muted-foreground">Fitness goals</span><p className="mt-1">{member.fitness_goals || '—'}</p></div>
            <div className="sm:col-span-2"><span className="text-muted-foreground">Medical notes</span><p className="mt-1">{member.medical_notes || '—'}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Progress history */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <Camera className="h-5 w-5 text-accent" /> Progress History ({progressLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progressLogs.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {progressLogs.map((log) => (
                <div key={log.id} className="rounded-xl overflow-hidden border border-border bg-card">
                  {log.photo_path ? (
                    <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/progress-photos/${log.photo_path}`} alt={fmt(log.logged_at)} className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="aspect-square w-full bg-card flex items-center justify-center"><Camera className="h-8 w-8 text-muted-foreground opacity-40" /></div>
                  )}
                  <div className="p-2">
                    <div className="text-xs font-medium">{fmt(log.logged_at)}</div>
                    <div className="text-xs text-accent">{log.weight != null ? `${log.weight} kg` : '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No progress logs yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Coach assignment (premium only) */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <UserCog className="h-5 w-5 text-accent" /> Coach Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPremium ? (
            <div className="space-y-3">
              {assignedCoach && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card/40 p-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-card border border-border">
                    {assignedCoach.photo_path ? (
                      <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${assignedCoach.photo_path}`} alt={assignedCoach.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-accent">{assignedCoach.name[0]}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{assignedCoach.name}</div>
                    <div className="text-xs text-muted-foreground">{assignedCoach.specialty}</div>
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="coach-select">Assign a coach</Label>
                <select
                  id="coach-select"
                  value={member.assigned_coach_id ?? ''}
                  onChange={(e) => assignCoach(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">No coach</option>
                  {coaches.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.specialty || 'General'}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Coach assignment is only available for Premium members.</p>
          )}
        </CardContent>
      </Card>

      {/* Meal & Workout plans (premium only) */}
      {isPremium && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Meal plan */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
                <Apple className="h-5 w-5 text-accent" /> Meal Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {meals.map((m) => (
                  <div key={m.id} className="flex items-start justify-between rounded-lg border border-border bg-card/40 p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{m.meal_name}</span>
                        <span className="text-xs text-muted-foreground">{m.day_of_week} · {m.time_of_day}</span>
                      </div>
                      {m.calories && <span className="text-xs text-muted-foreground">{m.calories} kcal</span>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMeal(m.id)} className="shrink-0 h-8 w-8">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
                {!meals.length && <p className="text-sm text-muted-foreground text-center py-4">No meals assigned.</p>}
              </div>
              <form onSubmit={addMeal} className="space-y-3 border-t border-border pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <select value={mealForm.day_of_week} onChange={(e) => setMealForm({ ...mealForm, day_of_week: e.target.value })} className="rounded-md border border-input bg-background px-2 py-2 text-sm">
                    {DAYS_OF_WEEK.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={mealForm.time_of_day} onChange={(e) => setMealForm({ ...mealForm, time_of_day: e.target.value })} className="rounded-md border border-input bg-background px-2 py-2 text-sm">
                    {MEAL_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <Input placeholder="Meal name" value={mealForm.meal_name} onChange={(e) => setMealForm({ ...mealForm, meal_name: e.target.value })} required />
                <Input placeholder="Description" value={mealForm.description} onChange={(e) => setMealForm({ ...mealForm, description: e.target.value })} />
                <div className="grid grid-cols-4 gap-2">
                  <Input type="number" placeholder="kcal" value={mealForm.calories} onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })} />
                  <Input type="number" placeholder="P g" value={mealForm.protein_g} onChange={(e) => setMealForm({ ...mealForm, protein_g: e.target.value })} />
                  <Input type="number" placeholder="C g" value={mealForm.carbs_g} onChange={(e) => setMealForm({ ...mealForm, carbs_g: e.target.value })} />
                  <Input type="number" placeholder="F g" value={mealForm.fats_g} onChange={(e) => setMealForm({ ...mealForm, fats_g: e.target.value })} />
                </div>
                <Button type="submit" size="sm" className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
                  <Plus className="h-4 w-4 mr-1" /> Add Meal
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Workout plan */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-accent" /> Workout Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {workouts.map((w) => (
                  <div key={w.id} className="flex items-start justify-between rounded-lg border border-border bg-card/40 p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{w.exercise_name}</span>
                        <span className="text-xs text-muted-foreground">{w.day_of_week}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{w.sets && `${w.sets} sets`}{w.reps && ` × ${w.reps}`}{w.rest_seconds != null && ` · ${w.rest_seconds}s rest`}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteWorkout(w.id)} className="shrink-0 h-8 w-8">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
                {!workouts.length && <p className="text-sm text-muted-foreground text-center py-4">No workouts assigned.</p>}
              </div>
              <form onSubmit={addWorkout} className="space-y-3 border-t border-border pt-4">
                <select value={workoutForm.day_of_week} onChange={(e) => setWorkoutForm({ ...workoutForm, day_of_week: e.target.value })} className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm">
                  {DAYS_OF_WEEK.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <Input placeholder="Exercise name" value={workoutForm.exercise_name} onChange={(e) => setWorkoutForm({ ...workoutForm, exercise_name: e.target.value })} required />
                <div className="grid grid-cols-3 gap-2">
                  <Input type="number" placeholder="Sets" value={workoutForm.sets} onChange={(e) => setWorkoutForm({ ...workoutForm, sets: e.target.value })} />
                  <Input placeholder="Reps (e.g. 8-12)" value={workoutForm.reps} onChange={(e) => setWorkoutForm({ ...workoutForm, reps: e.target.value })} />
                  <Input type="number" placeholder="Rest (s)" value={workoutForm.rest_seconds} onChange={(e) => setWorkoutForm({ ...workoutForm, rest_seconds: e.target.value })} />
                </div>
                <Input placeholder="Video link (optional)" value={workoutForm.video_link} onChange={(e) => setWorkoutForm({ ...workoutForm, video_link: e.target.value })} />
                <Textarea placeholder="Notes" value={workoutForm.notes} onChange={(e) => setWorkoutForm({ ...workoutForm, notes: e.target.value })} rows={2} />
                <Button type="submit" size="sm" className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
                  <Plus className="h-4 w-4 mr-1" /> Add Exercise
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
