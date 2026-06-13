'use client';

import { useState } from 'react';
import {
  Pencil, BookOpen, Users, Folder, Flag,
  Bell, Clock, Headphones,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const TOP_ITEMS = [
  { icon: Pencil,      label: 'Lesson',        id: 'lesson' },
  { icon: BookOpen,    label: 'Workbook',      id: 'workbook' },
  { icon: Users,       label: 'People',        id: 'people' },
  { icon: Folder,      label: 'Files',         id: 'files' },
  { icon: Flag,        label: 'Flagged',       id: 'flagged' },
];

const BOTTOM_ITEMS = [
  { icon: Bell,        label: 'Notifications', id: 'notifications' },
  { icon: Clock,       label: 'History',       id: 'history' },
  { icon: Headphones,  label: 'Help & support',id: 'help' },
];

export default function ToolRail() {
  const [active, setActive] = useState('lesson');

  return (
    <nav
      className="flex flex-col items-center flex-shrink-0 w-14 bg-[#1a1a1a] py-3.5 gap-1"
      aria-label="Tool rail"
    >
      {/* Brand mark */}
      <div className="w-[34px] h-[34px] rounded-lg border border-white text-white flex items-center justify-center font-bold text-base mb-2 flex-shrink-0">
        N
      </div>

      {/* Top nav */}
      {TOP_ITEMS.map(({ icon: Icon, label, id }) => (
        <button
          key={id}
          title={label}
          aria-label={label}
          onClick={() => setActive(id)}
          className={cn(
            'w-[38px] h-[38px] rounded-lg flex items-center justify-center transition-colors flex-shrink-0',
            active === id
              ? 'bg-white text-[#1a1a1a]'
              : 'bg-transparent text-[#cfcfcf] hover:bg-[#2c2c2c] hover:text-white'
          )}
        >
          <Icon size={18} strokeWidth={1.6} />
        </button>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom nav */}
      {BOTTOM_ITEMS.map(({ icon: Icon, label, id }) => (
        <button
          key={id}
          title={label}
          aria-label={label}
          onClick={() => setActive(id)}
          className={cn(
            'w-[38px] h-[38px] rounded-lg flex items-center justify-center transition-colors flex-shrink-0',
            active === id
              ? 'bg-white text-[#1a1a1a]'
              : 'bg-transparent text-[#cfcfcf] hover:bg-[#2c2c2c] hover:text-white'
          )}
        >
          <Icon size={18} strokeWidth={1.6} />
        </button>
      ))}
    </nav>
  );
}
