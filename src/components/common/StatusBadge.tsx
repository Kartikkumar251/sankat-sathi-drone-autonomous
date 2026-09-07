import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'green' | 'red' | 'amber' | 'cyan' | 'purple' | 'gray';
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'cyan',
  pulse = false,
  size = 'md',
  icon,
}) => {
  const variantStyles = {
    green: 'bg-emerald-950/70 text-emerald-400 border-emerald-600/50 shadow-emerald-900/20',
    red: 'bg-red-950/70 text-red-400 border-red-600/50 shadow-red-900/20',
    amber: 'bg-amber-950/70 text-amber-400 border-amber-600/50 shadow-amber-900/20',
    cyan: 'bg-cyan-950/70 text-cyan-400 border-cyan-600/50 shadow-cyan-900/20',
    purple: 'bg-purple-950/70 text-purple-400 border-purple-600/50 shadow-purple-900/20',
    gray: 'bg-slate-900/80 text-slate-400 border-slate-700/50 shadow-slate-900/20',
  };

  const ledColors = {
    green: 'bg-emerald-400 led-green',
    red: 'bg-red-400 led-red',
    amber: 'bg-amber-400 led-amber',
    cyan: 'bg-cyan-400 led-cyan',
    purple: 'bg-purple-400 led-cyan',
    gray: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 font-semibold gap-1',
    md: 'text-xs px-2.5 py-1 font-semibold gap-1.5',
    lg: 'text-sm px-3 py-1.5 font-bold gap-2',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '4px',
        border: '1px solid',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
      className={`font-mono border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {pulse && (
        <span
          style={{ width: '6px', height: '6px', borderRadius: '50%' }}
          className={`${ledColors[variant]} led-pulse flex-shrink-0`}
        />
      )}
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      <span>{status}</span>
    </span>
  );
};
