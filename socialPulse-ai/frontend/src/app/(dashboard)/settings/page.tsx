'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { authApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { containerVariants, itemVariants } from '@/lib/motion';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const qc = useQueryClient();

  const [name, setName] = useState(user?.name ?? '');

  const updateMutation = useMutation({
    mutationFn: (body: { name: string }) => authApi.updateMe(body),
    onSuccess: (updated) => {
      qc.setQueryData(QUERY_KEYS.me, updated);
      toast.success('Profile updated successfully.');
    },
    onError: () => {
      toast.error('Failed to save. Please try again.');
    },
  });

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Name cannot be empty.');
      return;
    }
    if (trimmed === user?.name) {
      toast('No changes to save.');
      return;
    }
    updateMutation.mutate({ name: trimmed });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-2xl"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <span className="w-11 h-11 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-glow">
          <Settings className="w-5 h-5 text-white" />
        </span>
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight">Settings</h1>
          <p className="text-xs text-text-muted">Manage your account and preferences</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-4 space-y-4">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-widest text-text-muted">
                Display name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={updateMutation.isPending}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-widest text-text-muted">
                Email
              </label>
              <Input
                value={user?.email ?? ''}
                disabled
                className="opacity-60 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-widest text-text-muted">
                Plan
              </label>
              <Input
                value={user?.plan ?? 'free'}
                disabled
                className="opacity-60 cursor-not-allowed capitalize"
              />
            </div>
            <Button
              onClick={handleSave}
              loading={updateMutation.isPending}
              disabled={updateMutation.isPending}
            >
              Save changes
            </Button>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-4 space-y-4 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400">Danger zone</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-xs text-text-muted mb-3">
              Signing out will clear your session and tokens.
            </p>
            <Button
              variant="outline"
              onClick={logout}
              className="border-red-500/40 text-red-400 hover:bg-red-500/10"
            >
              Sign out
            </Button>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
