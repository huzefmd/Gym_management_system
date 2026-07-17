'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { RockGymLogo } from '@/components/rock-gym-logo';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Camera, Dumbbell, Apple, Users, LogOut, CalendarCheck, Bell } from 'lucide-react';
import { useState } from 'react';

const nav = [
  { href: '/member/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/member/dashboard/progress', label: 'Progress', icon: Camera },
  { href: '/member/dashboard/plans', label: 'My Plans', icon: Dumbbell },
  { href: '/member/dashboard/checkin', label: 'Check-In', icon: CalendarCheck },
  { href: '/member/dashboard/profile', label: 'Profile', icon: Users },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/member/login');
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside
        className={`${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:sticky top-0 z-40 h-screen w-64 shrink-0 border-r border-border/60 bg-card/40 backdrop-blur-xl transition-transform`}
      >
        <div className="h-16 flex items-center px-5 border-b border-border/60">
          <Link href="/member/dashboard" onClick={() => setOpen(false)}>
            <RockGymLogo size={32} />
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full overflow-hidden bg-card border border-border shrink-0">
              {profile?.profile_photo_path ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${profile.profile_photo_path}`}
                  alt={profile.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{profile?.full_name ?? 'Member'}</div>
              <div className="text-xs text-muted-foreground capitalize">{profile?.plan ?? 'basic'} plan</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden h-14 border-b border-border/60 flex items-center justify-between px-4 sticky top-0 z-30 bg-background/80 backdrop-blur-xl">
        <RockGymLogo size={28} />
        <button onClick={() => setOpen(!open)} className="p-2 rounded-md hover:bg-accent/10">
          <LayoutDashboard className="h-5 w-5" />
        </button>
      </div>
      {open && <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />}

      {/* Main */}
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
