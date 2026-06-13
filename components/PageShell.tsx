/**
 * Shared chrome for every non-lesson route, so all pages read as one app:
 * a bordered header (title + meta + optional action) above a scrollable body.
 * Small grayscale primitives (Chip, ProgressBar, IconBadge) live here too to
 * keep the page set visually consistent.
 */
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export default function PageShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="flex-1 min-w-0 flex flex-col bg-white" aria-label={title}>
      <header className="flex items-end justify-between gap-4 px-8 py-6 border-b border-[#c8c8c8] flex-shrink-0">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1a1a1a] leading-tight">{title}</h1>
          {subtitle && <p className="text-[12px] text-[#7a7a7a] mt-1">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="flex-1 overflow-y-auto px-8 py-7">{children}</div>
    </main>
  );
}

/** Small uppercase status label. */
export function Chip({
  children,
  tone = 'muted',
}: {
  children: ReactNode;
  tone?: 'muted' | 'solid' | 'outline';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] tracking-[0.4px] uppercase',
        tone === 'solid' && 'bg-[#1a1a1a] text-white',
        tone === 'outline' && 'border border-[#9a9a9a] text-[#7a7a7a]',
        tone === 'muted' && 'bg-[#f4f4f4] text-[#7a7a7a]'
      )}
    >
      {children}
    </span>
  );
}

/** Thin grayscale progress bar (0–100). */
export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 w-full rounded-full bg-[#eaeaea] overflow-hidden">
      <div className="h-full rounded-full bg-[#1a1a1a]" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Square icon tile used in list rows. */
export function IconBadge({ children }: { children: ReactNode }) {
  return (
    <span className="flex-shrink-0 w-10 h-10 rounded-lg border border-[#c8c8c8] bg-[#f4f4f4] text-[#1a1a1a] flex items-center justify-center">
      {children}
    </span>
  );
}

/** Circular initials avatar. */
export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span className="flex-shrink-0 w-10 h-10 rounded-full border border-[#c8c8c8] bg-white text-[#1a1a1a] flex items-center justify-center text-[12px] font-semibold tracking-[0.5px]">
      {initials}
    </span>
  );
}
