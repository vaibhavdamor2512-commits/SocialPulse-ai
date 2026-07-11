/**
 * src/app/(auth)/login/page.tsx
 * Full login page — email/password form + Google/GitHub OAuth placeholders.
 *
 * Validation:  client-side (no Zod dep) + server error display
 * Auth flow:   useAuth().login → setTokens → /dashboard
 * Animations:  Framer Motion fade-up stagger
 */
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

import { useAuth }          from '@/hooks/useAuth';
import { Input }            from '@/components/ui/Input';
import { Button }           from '@/components/ui/Button';
import { SocialButtons }    from '@/components/auth/SocialButtons';
import { containerVariants, itemVariants } from '@/lib/motion';

// ── Validation ────────────────────────────────────────────────────────────────
interface FormErrors {
  email?: string;
  password?: string;
}

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {};
  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  return errors;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [errors,      setErrors]      = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [touched,     setTouched]     = useState({ email: false, password: false });

  const emailRef = useRef<HTMLInputElement>(null);

  // Validate on blur
  const handleBlur = (field: 'email' | 'password') => {
    setTouched((t) => ({ ...t, [field]: true }));
    const e = validate(email, password);
    setErrors((prev) => ({ ...prev, [field]: e[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const errs = validate(email, password);
    setTouched({ email: true, password: true });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setServerError(
        typeof detail === 'string' ? detail : 'Invalid email or password. Please try again.',
      );
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-sm"
    >
      {/* Heading */}
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
          Welcome back
        </h2>
        <p className="text-sm text-text-muted mt-1.5">
          Sign in to your SocialPulse AI account
        </p>
      </motion.div>

      {/* Social buttons */}
      <motion.div variants={itemVariants}>
        <SocialButtons action="Sign in" />
      </motion.div>

      {/* Divider */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-base-border" />
        <span className="text-xs text-text-muted">or continue with email</span>
        <div className="flex-1 h-px bg-base-border" />
      </motion.div>

      {/* Form */}
      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        {/* Server-level error banner */}
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-400 leading-relaxed">{serverError}</p>
          </motion.div>
        )}

        {/* Email */}
        <Input
          ref={emailRef}
          label="Email address"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (touched.email) setErrors((prev) => ({ ...prev, email: validate(e.target.value, password).email }));
          }}
          onBlur={() => handleBlur('email')}
          error={touched.email ? errors.email : undefined}
          leftElement={<Mail className="w-4 h-4" />}
          disabled={isLoggingIn}
        />

        {/* Password */}
        <Input
          label="Password"
          type={showPw ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (touched.password) setErrors((prev) => ({ ...prev, password: validate(email, e.target.value).password }));
          }}
          onBlur={() => handleBlur('password')}
          error={touched.password ? errors.password : undefined}
          leftElement={<Lock className="w-4 h-4" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="focus:outline-none hover:text-text-primary transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          disabled={isLoggingIn}
        />

        {/* Forgot password row */}
        <div className="flex justify-end -mt-1">
          <button
            type="button"
            onClick={() => {
              // Placeholder — password reset not yet wired
              import('react-hot-toast').then(({ default: toast }) =>
                toast('Password reset coming soon — contact support@socialpulse.ai', { icon: '📧' })
              );
            }}
            className="text-xs text-brand-indigo hover:text-accent-indigo transition-colors focus:outline-none"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoggingIn}
          className="w-full mt-1"
        >
          {isLoggingIn ? 'Signing in…' : 'Sign In'}
        </Button>
      </motion.form>

      {/* Signup link */}
      <motion.p
        variants={itemVariants}
        className="text-center text-xs text-text-muted mt-6"
      >
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-brand-indigo hover:text-accent-indigo font-medium transition-colors"
        >
          Create one free →
        </Link>
      </motion.p>

      {/* Demo shortcut */}
      <motion.div
        variants={itemVariants}
        className="mt-5 p-3 rounded-lg bg-base-surface border border-base-border"
      >
        <p className="text-[10px] text-text-muted text-center mb-2 uppercase tracking-widest">
          Demo credentials
        </p>
        <button
          type="button"
          onClick={() => {
            setEmail('demo@socialpulse.ai');
            setPassword('Demo1234!');
            setErrors({});
            setServerError('');
            setTouched({ email: false, password: false });
          }}
          className="w-full text-xs text-text-secondary hover:text-white text-center
                     transition-colors focus:outline-none py-0.5"
        >
          demo@socialpulse.ai / Demo1234!
        </button>
      </motion.div>
    </motion.div>
  );
}
