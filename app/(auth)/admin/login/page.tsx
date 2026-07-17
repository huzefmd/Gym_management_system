'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RockGymLogo } from '@/components/rock-gym-logo';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/components/providers/admin-provider';
import { ArrowLeft, Loader2, Lock, ShieldAlert, User } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (!ok) {
      toast({ title: 'Login failed', description: 'Invalid admin credentials.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Admin verified', description: 'Welcome, Coach Admin.' });
    router.push('/admin/dashboard');
  };

  return (
    <div className="w-full max-w-md">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>
      <Card className="glass-card border-border/60">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-brand-soft border border-[#ee5a2a]/30 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-accent" />
            </div>
            <RockGymLogo showWordmark={false} size={32} />
          </div>
          <div>
            <CardTitle className="font-display text-3xl tracking-wide">Admin Login</CardTitle>
            <CardDescription className="mt-1">Restricted access — gym staff only.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="username" placeholder="admin" value={username} onChange={(e) => setUsername(e.target.value)} required className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="admin-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-9" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enter Admin'}
            </Button>
          </form>
          <div className="mt-6 rounded-lg border border-dashed border-border bg-card/40 px-4 py-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Demo credentials:</span> username <code className="text-accent">admin</code> / password <code className="text-accent">admin</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
