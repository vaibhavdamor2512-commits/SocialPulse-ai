/**
 * src/hooks/useAuth.ts
 * Authentication hook — login, logout, auto-fetch current user.
 */
'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { authApi, clearTokens, setTokens } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { useStore } from '@/store';

export function useAuth() {
  const router = useRouter();
  const qc = useQueryClient();
  const { setUser, logout: storeLogout } = useStore();

  // Fetch current user if token present
  const { data: user, isLoading } = useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Keep Zustand in sync
  if (user) setUser(user);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (tokens) => {
      setTokens(tokens);
      const me = await authApi.me();
      setUser(me);
      qc.setQueryData(QUERY_KEYS.me, me);
      router.push('/dashboard');
    },
    onError: () => {
      toast.error('Invalid email or password.');
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: async (_user, vars) => {
      const tokens = await authApi.login({ email: vars.email, password: vars.password });
      setTokens(tokens);
      const me = await authApi.me();
      setUser(me);
      qc.setQueryData(QUERY_KEYS.me, me);
      router.push('/dashboard');
      toast.success('Account created! Welcome to SocialPulse AI.');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? 'Sign up failed. Please try again.';
      toast.error(typeof msg === 'string' ? msg : 'Sign up failed.');
    },
  });

  const logout = useCallback(() => {
    clearTokens();
    storeLogout();
    qc.clear();
    router.push('/login');
  }, [router, qc, storeLogout]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    logout,
    isLoggingIn: loginMutation.isPending,
    isSigningUp: signupMutation.isPending,
  };
}
