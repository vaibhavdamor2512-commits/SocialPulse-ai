/**
 * src/lib/motion.ts
 * Shared Framer Motion animation variants — used across all pages.
 */

import type { Variants } from 'framer-motion';

// ── Page-level entrance ───────────────────────────────────────────────────────
export const pageVariants: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

// ── Staggered list ────────────────────────────────────────────────────────────
export const containerVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

export const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

// ── Card pop-in ───────────────────────────────────────────────────────────────
export const cardVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

// ── Slide in from left (sidebar items) ───────────────────────────────────────
export const slideLeftVariants: Variants = {
  hidden:  { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

// ── Fade up ───────────────────────────────────────────────────────────────────
export const fadeUpVariants: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

// ── Convenience: motion props for page wrapper ────────────────────────────────
export const pageMotion = {
  initial: 'hidden',
  animate: 'visible',
  variants: pageVariants,
} as const;

export const listMotion = {
  initial: 'hidden',
  animate: 'visible',
  variants: containerVariants,
} as const;
