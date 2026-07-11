'use client';

import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';

import { containerVariants, itemVariants } from '@/lib/motion';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll be in touch within 24 hours.');
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
          <Mail className="w-5 h-5 text-white" />
        </span>
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight">Contact Support</h1>
          <p className="text-xs text-text-muted">Get help from the SocialPulse AI team</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-widest text-text-muted">Subject</label>
                <Input placeholder="What do you need help with?" required />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-widest text-text-muted">Message</label>
                <textarea
                  rows={5}
                  placeholder="Describe your issue in detail..."
                  required
                  className="input-base resize-none w-full"
                />
              </div>
              <Button type="submit">Send message</Button>
            </form>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Email</p>
          <p className="text-sm text-white">support@socialpulse.ai</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Response time</p>
          <p className="text-sm text-white">Within 24 hours</p>
        </Card>
      </motion.div>
    </motion.div>
  );
}
