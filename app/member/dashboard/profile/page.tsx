'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { uploadFile, PROFILE_BUCKET } from '@/lib/storage';
import { Loader2, Upload, User, Save, CreditCard } from 'lucide-react';
import type { Plan } from '@/lib/types';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? '',
      phone: profile.phone ?? '',
      date_of_birth: profile.date_of_birth ?? '',
      gender: profile.gender ?? '',
      height: profile.height?.toString() ?? '',
      starting_weight: profile.starting_weight?.toString() ?? '',
      address: profile.address ?? '',
      emergency_contact: profile.emergency_contact ?? '',
      fitness_goals: profile.fitness_goals ?? '',
      medical_notes: profile.medical_notes ?? '',
    });
    if (profile.profile_photo_path) {
      setPhotoPreview(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${profile.profile_photo_path}`);
    }
  }, [profile]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSaving(true);

    let photoPath = profile.profile_photo_path;
    if (photo) {
      const path = `${user.id}/profile-${Date.now()}.jpg`;
      const { path: uploaded, error } = await uploadFile(PROFILE_BUCKET, path, photo);
      if (!error) photoPath = uploaded;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        height: form.height ? Number(form.height) : null,
        starting_weight: form.starting_weight ? Number(form.starting_weight) : null,
        address: form.address || null,
        emergency_contact: form.emergency_contact || null,
        fitness_goals: form.fitness_goals || null,
        medical_notes: form.medical_notes || null,
        profile_photo_path: photoPath,
      })
      .eq('user_id', user.id);

    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    refreshProfile();
  };

  const handleUpgrade = async (plan: Plan) => {
    if (!user || !profile) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        plan,
        subscription_status: plan === 'premium' ? 'paid' : 'paid',
      })
      .eq('user_id', user.id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Plan updated', description: `You're now on the ${plan} plan.` });
    refreshProfile();
  };

  return (
    <div className="space-y-8 animate-fade-in-up max-w-3xl">
      <div>
        <h1 className="font-display text-4xl tracking-wide">My Profile</h1>
        <p className="text-muted-foreground mt-1">View and update your personal details and subscription.</p>
      </div>

      {/* Subscription card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-accent" /> Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[160px]">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Current Plan</div>
              <div className="font-display text-2xl capitalize text-gradient-brand">{profile?.plan ?? 'basic'}</div>
              <div className="text-xs text-muted-foreground mt-1 capitalize">Status: {profile?.subscription_status ?? 'pending'}</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={profile?.plan === 'basic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleUpgrade('basic')}
                className={profile?.plan === 'basic' ? 'bg-gradient-brand text-primary-foreground' : ''}
              >
                Basic
              </Button>
              <Button
                variant={profile?.plan === 'premium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleUpgrade('premium')}
                className={profile?.plan === 'premium' ? 'bg-gradient-brand text-primary-foreground' : ''}
              >
                Premium
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Demo only — no real payment is processed. Upgrading to Premium unlocks coach-assigned meal &amp; workout plans.
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Photo */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-border bg-card flex items-center justify-center shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <Label htmlFor="profile-photo" className="cursor-pointer">
                  <div className="inline-flex items-center gap-2 rounded-md border border-input bg-background hover:bg-accent/10 px-3 py-2 text-sm transition-colors">
                    <Upload className="h-4 w-4" /> Change photo
                  </div>
                </Label>
                <Input id="profile-photo" type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-wide">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" value={form.full_name ?? ''} onChange={(e) => set('full_name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email ?? ''} disabled className="opacity-60" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of birth</Label>
              <Input id="date_of_birth" type="date" value={form.date_of_birth ?? ''} onChange={(e) => set('date_of_birth', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                value={form.gender ?? ''}
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
              <Input id="height" type="number" value={form.height ?? ''} onChange={(e) => set('height', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="starting_weight">Starting weight (kg)</Label>
              <Input id="starting_weight" type="number" step="0.1" value={form.starting_weight ?? ''} onChange={(e) => set('starting_weight', e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="emergency_contact">Emergency contact</Label>
              <Input id="emergency_contact" value={form.emergency_contact ?? ''} onChange={(e) => set('emergency_contact', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Goals + medical */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-wide">Fitness &amp; Medical</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fitness_goals">Fitness goals</Label>
              <Textarea id="fitness_goals" value={form.fitness_goals ?? ''} onChange={(e) => set('fitness_goals', e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical_notes">Medical notes / injuries</Label>
              <Textarea id="medical_notes" value={form.medical_notes ?? ''} onChange={(e) => set('medical_notes', e.target.value)} rows={2} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span className="ml-2">Save Changes</span>
        </Button>
      </form>
    </div>
  );
}
