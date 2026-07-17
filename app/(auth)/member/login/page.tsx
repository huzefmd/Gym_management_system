'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RockGymLogo } from '@/components/rock-gym-logo';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Lock, Mail } from 'lucide-react';

export default function MemberLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Welcome back!', description: 'Redirecting to your dashboard...' });
    router.push('/member/dashboard');
  };

  return (
    <div className="w-full max-w-md">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>
      <Card className="glass-card border-border/60">
        <CardHeader className="space-y-3">
          <RockGymLogo showWordmark={false} size={48} className="mb-1" />
          <div>
            <CardTitle className="font-display text-3xl tracking-wide">Member Sign In</CardTitle>
            <CardDescription className="mt-1">Welcome back. Time to log your progress.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-9" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to RockGym?{' '}
            <Link href="/member/signup" className="text-accent hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
