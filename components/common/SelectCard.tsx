'use client';

import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface SelectCardProps {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  premium?: boolean;
}

export function SelectCard({
  selected,
  onClick,
  children,
  disabled,
  premium,
}: SelectCardProps) {
  return (
    <Card
      className={`relative cursor-pointer transition-all ${
        selected
          ? 'border-2 border-amber-500 bg-amber-50/50 shadow-md'
          : 'border hover:border-gray-400 hover:shadow-sm'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      {premium && !selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
          🔒
        </div>
      )}
      {children}
    </Card>
  );
}
