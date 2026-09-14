import { Droplet, Flower2, Scissors, Sparkles, Wand2, Wind, type LucideIcon } from 'lucide-react';

import type { Service } from '@/lib/salon';

/*
 * Named imports only. `import * as Icons from 'lucide-react'` pulls all 1,600+
 * icons into the bundle -- this map keeps it to the six we actually draw.
 */
const ICONS: Record<Service['icon'], LucideIcon> = {
  scissors: Scissors,
  sparkles: Sparkles,
  droplet: Droplet,
  flower: Flower2,
  wand: Wand2,
  wind: Wind,
};

export function ServiceIcon({ name, className }: { name: Service['icon']; className?: string }) {
  const Icon = ICONS[name];
  // Decorative: the service name sits next to it, so announcing the icon would
  // just make screen readers say everything twice.
  return <Icon className={className} strokeWidth={1.25} aria-hidden="true" />;
}
