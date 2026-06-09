import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  className?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function ChartCard({
  title,
  subtitle,
  className = '',
  actions,
  children,
}: ChartCardProps) {
  return (
    <div className={`card-premium ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-content">{title}</h3>
          {subtitle && <p className="text-xs text-content-muted mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
