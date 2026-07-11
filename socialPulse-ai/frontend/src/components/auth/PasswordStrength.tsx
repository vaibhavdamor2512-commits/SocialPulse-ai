/**
 * src/components/auth/PasswordStrength.tsx
 * Visual password strength bar + criteria checklist.
 * Shown below the password field on the signup form.
 */
'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface Criterion {
  label: string;
  test: (pw: string) => boolean;
}

const CRITERIA: Criterion[] = [
  { label: 'At least 8 characters',        test: (pw) => pw.length >= 8 },
  { label: 'Uppercase letter',             test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Lowercase letter',             test: (pw) => /[a-z]/.test(pw) },
  { label: 'Number',                       test: (pw) => /\d/.test(pw) },
  { label: 'Special character (!@#$…)',    test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

type Strength = 0 | 1 | 2 | 3 | 4;

function getStrength(password: string): Strength {
  const passed = CRITERIA.filter((c) => c.test(password)).length;
  return Math.min(4, passed) as Strength;
}

const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const BAR_COLORS: Record<Strength, string> = {
  0: 'bg-base-border',
  1: 'bg-red-400',
  2: 'bg-accent-orange',
  3: 'bg-yellow-400',
  4: 'bg-accent-green',
};
const TEXT_COLORS: Record<Strength, string> = {
  0: 'text-text-muted',
  1: 'text-red-400',
  2: 'text-accent-orange',
  3: 'text-yellow-400',
  4: 'text-accent-green',
};

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1 h-1.5">
          {([1, 2, 3, 4] as const).map((level) => (
            <div
              key={level}
              className={cn(
                'flex-1 rounded-full transition-all duration-300',
                strength >= level ? BAR_COLORS[strength] : 'bg-base-border',
              )}
            />
          ))}
        </div>
        {strength > 0 && (
          <span className={cn('text-[10px] font-semibold w-10 text-right', TEXT_COLORS[strength])}>
            {LABELS[strength]}
          </span>
        )}
      </div>

      {/* Criteria list */}
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {CRITERIA.map((c) => {
          const met = c.test(password);
          return (
            <li key={c.label} className="flex items-center gap-1.5">
              <span
                className={cn(
                  'w-3 h-3 rounded-full flex-shrink-0 border transition-colors duration-200',
                  met
                    ? 'bg-accent-green border-accent-green/50'
                    : 'bg-transparent border-base-border',
                )}
              />
              <span className={cn('text-[10px]', met ? 'text-text-secondary' : 'text-text-muted')}>
                {c.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
