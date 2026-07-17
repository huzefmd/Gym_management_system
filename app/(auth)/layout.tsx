import { RockGymLogo } from '@/components/rock-gym-logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-[#ee5a2a]/15 blur-[120px]" />
        <div className="absolute -bottom-40 -left-32 h-[30rem] w-[30rem] rounded-full bg-[#f5a442]/10 blur-[120px]" />
      </div>
      <header className="h-16 border-b border-border/60 flex items-center px-4 sm:px-6">
        <a href="/" aria-label="RockGym.fit home">
          <RockGymLogo />
        </a>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}
