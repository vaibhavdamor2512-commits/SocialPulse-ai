/**
 * src/app/(auth)/signup/page.tsx
 * Full signup page — name, email, password + confirm + strength meter.
 *
 * Validation:  client-side inline + blur + server error passthrough
 * Auth flow:   useAuth().signup → auto-login → /dashboard
 * Animations:  Framer Motion stagger
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

import { useAuth }             from '@/hooks/useAuth';
import { Input }               from '@/components/ui/Input';
import { Button }              from '@/components/ui/Button';
import { SocialButtons }       from '@/components/auth/SocialButtons';
import { PasswordStrength }    from '@/components/auth/PasswordStrength';
import { containerVariants, itemVariants } from '@/lib/motion';

// ── Validation ────────────────────────────────────────────────────────────────
interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

function validate(
  name: string,
  email: string,
  password: string,
  confirm: string,
): FormErrors {
  const errors: FormErrors = {};

  if (!name.trim()) {
    errors.name = 'Full name is required.';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'Include at least one uppercase letter.';
  } else if (!/\d/.test(password)) {
    errors.password = 'Include at least one number.';
  }

  if (!confirm) {
    errors.confirm = 'Please confirm your password.';
  } else if (confirm !== password) {
    errors.confirm = 'Passwords do not match.';
  }

  return errors;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const { signup, isSigningUp } = useAuth();

  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors,      setErrors]      = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [touched, setTouched] = useState({
    name: false, email: false, password: false, confirm: false,
  });

  const revalidateField = (
    field: keyof typeof touched,
    values = { name, email, password, confirm },
  ) => {
    const errs = validate(values.name, values.email, values.password, values.confirm);
    setErrors((prev) => ({ ...prev, [field]: errs[field] }));
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((t) => ({ ...t, [field]: true }));
    revalidateField(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const errs = validate(name, email, password, confirm);
    setTouched({ name: true, email: true, password: true, confirm: true });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await signup({ name: name.trim(), email: email.trim().toLowerCase(), password });
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setServerError(
        typeof detail === 'string' ? detail : 'Could not create account. Please try again.',
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
      <motion.div variants={itemVariants} className="mb-7">
        <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
          Create your account
        </h2>
        <p className="text-sm text-text-muted mt-1.5">
          Free 14-day trial — no credit card required
        </p>
      </motion.div>

      {/* Social buttons */}
      <motion.div variants={itemVariants}>
        <SocialButtons action="Sign up" />
      </motion.div>

      {/* Divider */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-base-border" />
        <span className="text-xs text-text-muted">or sign up with email</span>
        <div className="flex-1 h-px bg-base-border" />
      </motion.div>

      {/* Form */}
      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        {/* Server error banner */}
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

        {/* Full name */}
        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (touched.name) revalidateField('name', { name: e.target.value, email, password, confirm });
          }}
          onBlur={() => handleBlur('name')}
          error={touched.name ? errors.name : undefined}
          leftElement={<User className="w-4 h-4" />}
          disabled={isSigningUp}
        />

        {/* Email */}
        <Input
          label="Work email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (touched.email) revalidateField('email', { name, email: e.target.value, password, confirm });
          }}
          onBlur={() => handleBlur('email')}
          error={touched.email ? errors.email : undefined}
          leftElement={<Mail className="w-4 h-4" />}
          disabled={isSigningUp}
        />

        {/* Password */}
        <div>
          <Input
            label="Password"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched.password) revalidateField('password', { name, email, password: e.target.value, confirm });
              // Also re-check confirm if already touched
              if (touched.confirm) revalidateField('confirm', { name, email, password: e.target.value, confirm });
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
            disabled={isSigningUp}
          />
          <PasswordStrength password={password} />
        </div>

        {/* Confirm password */}
        <div className="relative">
          <Input
            label="Confirm password"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              if (touched.confirm) revalidateField('confirm', { name, email, password, confirm: e.target.value });
            }}
            onBlur={() => handleBlur('confirm')}
            error={touched.confirm ? errors.confirm : undefined}
            leftElement={
              confirm && confirm === password
                ? <CheckCircle2 className="w-4 h-4 text-accent-green" />
                : <Lock className="w-4 h-4" />
            }
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                className="focus:outline-none hover:text-text-primary transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            disabled={isSigningUp}
          />
        </div>

        {/* Terms notice */}
        <p className="text-[10px] text-text-muted leading-relaxed">
          By creating an account you agree to our{' '}
          <button
            type="button"
            className="text-brand-indigo hover:underline focus:outline-none"
            onClick={() => {
              import('react-hot-toast').then(({ default: toast }) =>
                toast('Terms of Service — coming soon.', { icon: '📄' })
              );
            }}
          >
            Terms of Service
          </button>{' '}
          and{' '}
          <button
            type="button"
            className="text-brand-indigo hover:underline focus:outline-none"
            onClick={() => {
              import('react-hot-toast').then(({ default: toast }) =>
                toast('Privacy Policy — coming soon.', { icon: '🔒' })
              );
            }}
          >
            Privacy Policy
          </button>
          .
        </p>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSigningUp}
          className="w-full"
        >
          {isSigningUp ? 'Creating account…' : 'Create Free Account'}
        </Button>
      </motion.form>

      {/* Login link */}
      <motion.p
        variants={itemVariants}
        className="text-center text-xs text-text-muted mt-6"
      >
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-brand-indigo hover:text-accent-indigo font-medium transition-colors"
        >
          Sign in →
        </Link>
      </motion.p>
    </motion.div>
  );
}
