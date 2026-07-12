/**
 * src/hooks/useAuth.ts
 * Authentication hook — login, logout, auto-fetch current user.
 */
'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

import { authApi, clearTokens, setTokens } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { useStore } from '@/store';

export function useAuth() {
  const router = useRouter();
  const qc = useQueryClient();
  const { setUser, logout: storeLogout } = useStore();

  const hasToken = typeof window !== 'undefined' && !!Cookies.get('access_token');

  const { data: user, isLoading } = useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: authApi.me,
    // Only run when there is a token in the cookie — avoids a 401 on every page load
    enabled: hasToken,
    retry: 0,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,

    onSuccess: async (tokens) => {
      try {
        setTokens(tokens);

        const me = await authApi.me();

        setUser(me);
        qc.setQueryData(QUERY_KEYS.me, me);

        toast.success('Login successful');

        router.push('/dashboard');
      } catch (err) {
        console.error('Post-login error:', err);
        toast.error('Login succeeded, but fetching your profile failed. Please try again.');
      }
    },

    onError: (err: any) => {
      // Clear any stale cached credentials so the form is not stuck
      clearTokens();
      storeLogout();
      qc.removeQueries({ queryKey: QUERY_KEYS.me });

      // Network error (server down / CORS) — give a clear message
      const isNetworkError = !err?.response && (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error');
      const message = isNetworkError
        ? 'Cannot reach the server. Make sure the backend is running on port 8000.'
        : err?.response?.data?.detail ??
          err?.message ??
          'Invalid email or password. Please try again.';

      toast.error(message);
    },
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,

    onSuccess: async (_user, vars) => {
      try {
        const tokens = await authApi.login({
          email: vars.email,
          password: vars.password,
        });

        setTokens(tokens);

        const me = await authApi.me();

        setUser(me);
        qc.setQueryData(QUERY_KEYS.me, me);

        toast.success('Account created successfully!');

        router.push('/dashboard');
      } catch (err) {
        console.error(err);
        toast.error('Signup succeeded but automatic login failed.');
      }
    },

    onError: (err: any) => {
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        'Signup failed';

      toast.error(message);
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