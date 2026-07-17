import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export function RockGymLogo({
  className,
  size = 40,
  showWordmark = true,
  wordmarkClassName,
}: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="RockGym logo"
      >
        <defs>
          <linearGradient id="rockGrad" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ee5a2a" />
            <stop offset="1" stopColor="#f5a442" />
          </linearGradient>
        </defs>
        {/* boulder body */}
        <path
          d="M32 6 L52 18 L56 40 L44 58 L20 58 L8 40 L12 18 Z"
          fill="url(#rockGrad)"
          stroke="#1a1410"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* facet cracks */}
        <path
          d="M32 6 L32 30 M32 30 L12 18 M32 30 L52 18 M32 30 L20 58 M32 30 L44 58 M32 30 L8 40 M32 30 L56 40"
          stroke="#1a1410"
          strokeWidth="1.4"
          strokeLinejoin="round"
          opacity="0.85"
        />
        {/* highlight */}
        <path
          d="M32 6 L24 22"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
      {showWordmark && (
        <span
          className={cn(
            'font-display tracking-wide text-xl leading-none text-foreground',
            wordmarkClassName
          )}
        >
          RockGym<span className="text-gradient-brand">.fit</span>
        </span>
      )}
    </div>
  );
}
