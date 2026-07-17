'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RockGymLogo } from '@/components/rock-gym-logo';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Upload, User, Lock, Mail } from 'lucide-react';
import { uploadFile, PROFILE_BUCKET, publicUrl } from '@/lib/storage';
import type { Plan } from '@/lib/types';

const initialForm = {
  full_name: '',
  email: '',
  password: '',
  phone: '',
  date_of_birth: '',
  gender: '',
  height: '',
  starting_weight: '',
  address: '',
  emergency_contact: '',
  fitness_goals: '',
  medical_notes: '',
  plan: 'basic' as Plan,
};

export default function MemberSignupPage() {
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setLoading(false);
      toast({ title: 'Sign up failed', description: authError.message, variant: 'destructive' });
      return;
    }

    const user = authData.user;
    if (!user) {
      setLoading(false);
      toast({ title: 'Sign up failed', description: 'No user returned.', variant: 'destructive' });
      return;
    }

    let photoPath: string | null = null;
    if (photo) {
      const path = `${user.id}/profile-${Date.now()}.jpg`;
      const { path: uploaded, error: upErr } = await uploadFile(PROFILE_BUCKET, path, photo);
      if (upErr) {
        toast({ title: 'Photo upload failed', description: upErr, variant: 'destructive' });
      } else {
        photoPath = uploaded;
      }
    }

    const { error: profileErr } = await supabase.from('profiles').insert({
      user_id: user.id,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender || null,
      height: form.height ? Number(form.height) : null,
      starting_weight: form.starting_weight ? Number(form.starting_weight) : null,
      address: form.address || null,
      emergency_contact: form.emergency_contact || null,
      fitness_goals: form.fitness_goals || null,
      medical_notes: form.medical_notes || null,
      plan: form.plan,
      subscription_status: form.plan === 'premium' ? 'pending' : 'paid',
      status: 'active',
      profile_photo_path: photoPath,
    });

    setLoading(false);
    if (profileErr) {
      toast({ title: 'Profile save failed', description: profileErr.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Account created!', description: 'Welcome to RockGym.fit.' });
    router.push('/member/dashboard');
  };

  return (
    <div className="w-full max-w-2xl">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>
      <Card className="glass-card border-border/60">
        <CardHeader className="space-y-3">
          <RockGymLogo showWordmark={false} size={48} className="mb-1" />
          <div>
            <CardTitle className="font-display text-3xl tracking-wide">Create Your Account</CardTitle>
            <CardDescription className="mt-1">
              Fill out your profile so we can tailor your experience. It only takes a minute.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo */}
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-border bg-card flex items-center justify-center shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <Label htmlFor="photo" className="cursor-pointer">
                  <div className="inline-flex items-center gap-2 rounded-md border border-input bg-background hover:bg-accent/10 px-3 py-2 text-sm transition-colors">
                    <Upload className="h-4 w-4" /> Upload profile photo
                  </div>
                </Label>
                <Input id="photo" type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                <p className="text-xs text-muted-foreground mt-1">JPG or PNG, up to 5MB.</p>
              </div>
            </div>

            {/* Account */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name *</Label>
                <Input id="full_name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@gmail.com" value={form.email} onChange={(e) => set('email', e.target.value)} required className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={6} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" placeholder="+1 555 000 1234" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </div>
            </div>

            {/* Personal */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of birth</Label>
                <Input id="date_of_birth" type="date" value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={form.gender}
                  onChange={(e) => set('gender', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" type="number" placeholder="175" value={form.height} onChange={(e) => set('height', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="starting_weight">Starting weight (kg)</Label>
                <Input id="starting_weight" type="number" step="0.1" placeholder="78.5" value={form.starting_weight} onChange={(e) => set('starting_weight', e.target.value)} />
              </div>
            </div>

            {/* Contact */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Iron St, Liftville" value={form.address} onChange={(e) => set('address', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Emergency contact</Label>
                <Input id="emergency_contact" placeholder="Jane Doe — +1 555 000 0000" value={form.emergency_contact} onChange={(e) => set('emergency_contact', e.target.value)} />
              </div>
            </div>

            {/* Goals + medical */}
            <div className="space-y-2">
              <Label htmlFor="fitness_goals">Fitness goals</Label>
              <Textarea id="fitness_goals" placeholder="e.g. Lose 10kg, build muscle, run a 10k..." value={form.fitness_goals} onChange={(e) => set('fitness_goals', e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical_notes">Medical notes / injuries (optional)</Label>
              <Textarea id="medical_notes" placeholder="e.g. Lower back strain — avoid heavy deadlifts" value={form.medical_notes} onChange={(e) => set('medical_notes', e.target.value)} rows={2} />
            </div>

            {/* Plan */}
            <div className="space-y-3">
              <Label>Choose your plan</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => set('plan', 'basic')}
                  className={`text-left rounded-xl border p-4 transition-all ${
                    form.plan === 'basic' ? 'border-[#ee5a2a] bg-gradient-brand-soft' : 'border-border bg-card hover:border-border/80'
                  }`}
                >
                  <div className="font-display text-lg tracking-wide">Basic</div>
                  <div className="text-xs text-muted-foreground mt-1">Progress tracking, check-ins, charts.</div>
                </button>
                <button
                  type="button"
                  onClick={() => set('plan', 'premium')}
                  className={`text-left rounded-xl border p-4 transition-all ${
                    form.plan === 'premium' ? 'border-[#ee5a2a] bg-gradient-brand-soft' : 'border-border bg-card hover:border-border/80'
                  }`}
                >
                  <div className="font-display text-lg tracking-wide text-gradient-brand">Premium</div>
                  <div className="text-xs text-muted-foreground mt-1">Everything in Basic + coach, meals &amp; workouts.</div>
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90 h-11">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/member/login" className="text-accent hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
