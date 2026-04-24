import React from 'react';
import { getStatusColors } from '../../utils/statusColors';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps {
  children: React.ReactNode;
  status?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, status, className }) => {
  const statusClasses = status ? getStatusColors(status) : 'bg-slate-100 text-slate-800 border-slate-200';
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
      statusClasses,
      className
    )}>
      {children}
    </span>
  );
};
