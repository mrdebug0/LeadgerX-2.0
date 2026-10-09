import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, rightElement, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-xl border transition-all duration-150 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
              icon ? 'pl-10' : ''
            } ${rightElement ? 'pr-11' : ''} ${
              error ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200'
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
