import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral' | number;
  trendLabel?: string;
  icon?: any;
  gradient?: string;
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend,
  trendLabel,
  icon,
  gradient = 'bg-primary/10',
  description,
  className = '',
}: StatCardProps) {
  let isPositive = false;
  let isNegative = false;
  let trendDisplayValue = '';

  if (typeof trend === 'number') {
    isPositive = trend > 0;
    isNegative = trend < 0;
    trendDisplayValue = `${isPositive ? '+' : ''}${trend}%`;
  } else if (typeof trend === 'string') {
    isPositive = trend === 'up';
    isNegative = trend === 'down';
    if (change !== undefined) {
      trendDisplayValue = `${isPositive ? '↑' : isNegative ? '↓' : ''} ${change}%`;
    }
  }

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon;
    return <IconComponent className="w-5 h-5 text-primary" />;
  };

  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-content-secondary mb-1">{title}</p>
          <h4 className="text-2xl font-bold text-content">{value}</h4>
          
          {(trendDisplayValue || description || trendLabel) && (
            <div className="flex items-center mt-2 flex-wrap gap-1">
              {trendDisplayValue && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isPositive ? 'bg-emerald-50 text-emerald-600' 
                  : isNegative ? 'bg-red-50 text-red-600' 
                  : 'bg-surface-raised text-content-secondary'
                }`}>
                  {trendDisplayValue}
                </span>
              )}
              {(description || trendLabel) && (
                <span className="text-xs text-content-muted">{description || trendLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${gradient} flex items-center justify-center flex-shrink-0`}>
          {renderIcon()}
        </div>
      </div>
    </Card>
  );
}

export default StatCard;
