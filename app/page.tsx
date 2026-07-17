'use client';

import Link from 'next/link';
import { RockGymLogo } from '@/components/rock-gym-logo';
import { Button } from '@/components/ui/button';
import {
  Dumbbell,
  TrendingUp,
  Apple,
  Users,
  ShieldCheck,
  Camera,
  ArrowRight,
  CalendarCheck,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useAdmin } from '@/components/providers/admin-provider';

const features = [
  {
    icon: Camera,
    title: 'Weekly Progress Tracking',
    desc: 'Log your weight and upload progress photos every week. Watch your transformation unfold in a visual timeline and weight-trend chart.',
  },
  {
    icon: Apple,
    title: 'Custom Meal Plans',
    desc: 'Premium members get personalized meal plans with calories, macros, and timing — built by your coach and organized by day.',
  },
  {
    icon: Dumbbell,
    title: 'Tailored Workout Plans',
    desc: 'Daily exercise routines with sets, reps, rest, and video links — assigned to premium members and broken down by day of week.',
  },
  {
    icon: Users,
    title: 'Personal Coaching',
    desc: 'Premium members are paired with a dedicated coach who manages your training and nutrition every step of the way.',
  },
  {
    icon: CalendarCheck,
    title: 'Gym Check-Ins',
    desc: 'Log your gym visits and build an attendance streak. Consistency is the foundation of every transformation.',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    desc: 'Never miss a weekly check-in with in-app notifications and subscription renewal nudges.',
  },
];

const stats = [
  { value: '500+', label: 'Active Members' },
  { value: '12', label: 'Expert Coaches' },
  { value: '8.4k', label: 'Workouts Logged' },
  { value: '97%', label: 'Goal Success' },
];

export default function Home() {
  const { user, profile } = useAuth();
  const { isAdmin } = useAdmin();

  const memberHref = user ? '/member/dashboard' : '/member/login';
  const adminHref = isAdmin ? '/admin/dashboard' : '/admin/login';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label="RockGym.fit home">
            <RockGymLogo />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#plans" className="hover:text-foreground transition-colors">Plans</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Stats</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/admin/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Admin
              </Button>
            </Link>
            <Link href={memberHref}>
              <Button size="sm" className="bg-gradient-brand text-primary-foreground hover:opacity-90">
                {user ? 'My Dashboard' : 'Member Login'}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden flex-1 flex items-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-32 h-[36rem] w-[36rem] rounded-full bg-[#ee5a2a]/20 blur-[120px]" />
          <div className="absolute -bottom-40 -left-32 h-[36rem] w-[36rem] rounded-full bg-[#f5a442]/15 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground mb-6 animate-fade-in-up">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-brand" />
              New: Weekly progress timeline & coach-assigned plans
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[0.95] tracking-wide animate-fade-in-up">
              TRAIN HARD.
              <br />
              TRACK PROGRESS.
              <br />
              <span className="text-gradient-brand">LEVEL UP.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              RockGym.fit is the all-in-one platform for serious lifters. Log weekly
              check-ins, follow coach-built meal &amp; workout plans, and watch your
              transformation happen — all in one bold, modern dashboard.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Link href={memberHref}>
                <Button size="lg" className="bg-gradient-brand text-primary-foreground hover:opacity-90 w-full sm:w-auto">
                  {user ? 'Go to Dashboard' : 'Join as Member'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/member/signup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Create Account
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Already a member?{' '}
              <Link href="/member/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section id="stats" className="border-y border-border/60 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-4xl text-gradient-brand">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <h2 className="font-display text-4xl md:text-5xl tracking-wide">
              Everything you need to <span className="text-gradient-brand">transform</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              From your first check-in to your hundredth PR — RockGym.fit keeps every rep,
              meal, and milestone in one place.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group glass-card rounded-2xl p-6 hover:border-[#ee5a2a]/40 transition-all hover:-translate-y-1"
              >
                <div className="h-11 w-11 rounded-xl bg-gradient-brand-soft border border-[#ee5a2a]/20 flex items-center justify-center mb-4 group-hover:bg-gradient-brand group-hover:border-transparent transition-all">
                  <f.icon className="h-5 w-5 text-accent group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-display text-xl tracking-wide mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-20 md:py-28 border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display text-4xl md:text-5xl tracking-wide">
              Choose your <span className="text-gradient-brand">plan</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Start basic and upgrade to premium anytime to unlock coaching, meal plans, and workouts.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="glass-card rounded-2xl p-8">
              <h3 className="font-display text-2xl tracking-wide">Basic</h3>
              <p className="text-sm text-muted-foreground mt-1">For self-driven lifters</p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex gap-3"><ShieldCheck className="h-5 w-5 text-accent shrink-0" /> Full profile &amp; goals</li>
                <li className="flex gap-3"><Camera className="h-5 w-5 text-accent shrink-0" /> Weekly progress photos &amp; weight log</li>
                <li className="flex gap-3"><TrendingUp className="h-5 w-5 text-accent shrink-0" /> Weight-over-time chart</li>
                <li className="flex gap-3"><CalendarCheck className="h-5 w-5 text-accent shrink-0" /> Gym check-in log</li>
              </ul>
              <Link href="/member/signup" className="block mt-8">
                <Button variant="outline" className="w-full">Start Basic</Button>
              </Link>
            </div>
            <div className="relative glass-card rounded-2xl p-8 border-[#ee5a2a]/40 overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-brand text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-xl">
                POPULAR
              </div>
              <h3 className="font-display text-2xl tracking-wide text-gradient-brand">Premium</h3>
              <p className="text-sm text-muted-foreground mt-1">Coached to your goals</p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex gap-3"><Users className="h-5 w-5 text-accent shrink-0" /> Everything in Basic, plus:</li>
                <li className="flex gap-3"><Users className="h-5 w-5 text-accent shrink-0" /> Dedicated personal coach</li>
                <li className="flex gap-3"><Apple className="h-5 w-5 text-accent shrink-0" /> Custom daily meal plans</li>
                <li className="flex gap-3"><Dumbbell className="h-5 w-5 text-accent shrink-0" /> Tailored weekly workout plans</li>
                <li className="flex gap-3"><Bell className="h-5 w-5 text-accent shrink-0" /> Priority reminders &amp; notifications</li>
              </ul>
              <Link href="/member/signup" className="block mt-8">
                <Button className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">Go Premium</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="relative rounded-3xl overflow-hidden border border-border bg-card/40 p-10 md:p-16 text-center">
            <div className="absolute inset-0 -z-10 bg-gradient-brand-soft" />
            <h2 className="font-display text-4xl md:text-5xl tracking-wide">
              Your transformation starts <span className="text-gradient-brand">today</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md mx-auto">
              Join RockGym.fit and turn consistency into results.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/member/signup">
                <Button size="lg" className="bg-gradient-brand text-primary-foreground hover:opacity-90">
                  Create your account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button size="lg" variant="outline">Admin Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <RockGymLogo />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RockGym.fit. Built for lifters who mean business.
          </p>
        </div>
      </footer>
    </div>
  );
}
