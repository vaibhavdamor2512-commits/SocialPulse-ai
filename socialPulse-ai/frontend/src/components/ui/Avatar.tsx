/**
 * src/components/ui/Avatar.tsx
 */
import { cn } from '@/lib/utils';
import { initials } from '@/lib/utils';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = { xs: 'w-6 h-6 text-[9px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' } as const;

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  return (
    <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', sizes[size], className)}>
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-brand-gradient text-white font-bold">
          {initials(name)}
        </div>
      )}
    </div>
  );
}
