'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '@/components/providers/admin-provider';
import { RockGymLogo } from '@/components/rock-gym-logo';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Dumbbell, UserCog, LogOut, ShieldAlert } from 'lucide-react';

const nav = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/dashboard/members', label: 'Members', icon: Users },
  { href: '/admin/dashboard/coaches', label: 'Coaches', icon: UserCog },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // small delay to let sessionStorage hydrate
    const t = setTimeout(() => {
      if (!isAdmin) router.replace('/admin/login');
    }, 50);
    return () => clearTimeout(t);
  }, [isAdmin, router]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside
        className={`${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:sticky top-0 z-40 h-screen w-64 shrink-0 border-r border-border/60 bg-card/40 backdrop-blur-xl transition-transform`}
      >
        <div className="h-16 flex items-center px-5 border-b border-border/60">
          <Link href="/admin/dashboard" onClick={() => setOpen(false)}>
            <RockGymLogo size={32} />
          </Link>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 rounded-lg bg-gradient-brand-soft border border-[#ee5a2a]/20 px-3 py-2">
            <ShieldAlert className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium">Admin Console</span>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sessionStorage.removeItem('rockgym_admin_session');
              router.push('/admin/login');
            }}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="md:hidden h-14 border-b border-border/60 flex items-center justify-between px-4 sticky top-0 z-30 bg-background/80 backdrop-blur-xl">
        <RockGymLogo size={28} />
        <button onClick={() => setOpen(!open)} className="p-2 rounded-md hover:bg-accent/10">
          <LayoutDashboard className="h-5 w-5" />
        </button>
      </div>
      {open && <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />}

      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
