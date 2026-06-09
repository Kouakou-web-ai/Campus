import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-surface-raised p-4 rounded-full mb-4">
        <Icon className="w-10 h-10 text-content-muted" />
      </div>
      <h3 className="text-lg font-semibold text-content mb-2">{title}</h3>
      <p className="text-content-secondary max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}export default EmptyState;
