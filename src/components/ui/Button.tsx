import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'danger' | 'subtle' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 select-none whitespace-nowrap shrink-0 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-base px-6 py-3.5 rounded-2xl gap-2.5 shadow-sm',
  };

  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 border border-blue-500/30',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm hover:border-slate-300',
    glass:
      'glass-panel hover:bg-white text-slate-800 shadow-sm border border-white/60 hover:shadow',
    subtle:
      'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 font-semibold',
    danger:
      'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
