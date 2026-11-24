import {
  DoorOpen,
  Flame,
  Heart,
  Mic,
  Sun,
  Theater,
} from 'lucide-react';
import { MissionIconKey } from '../types/game';

interface MissionIconProps {
  icon: MissionIconKey;
  className?: string;
}

export function MissionIcon({ icon, className = 'w-6 h-6' }: MissionIconProps) {
  switch (icon) {
    case 'door':
      return <DoorOpen className={className} aria-hidden="true" />;
    case 'heart':
      return <Heart className={className} aria-hidden="true" />;
    case 'flame':
      return <Flame className={className} aria-hidden="true" />;
    case 'mic':
      return <Mic className={className} aria-hidden="true" />;
    case 'theater':
      return <Theater className={className} aria-hidden="true" />;
    case 'sun':
      return <Sun className={className} aria-hidden="true" />;
  }
}
