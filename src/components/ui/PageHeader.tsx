import React from 'react';

interface Breadcrumb {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, action, actions }: PageHeaderProps) {
  const headerActions = actions || action;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="text-xs text-content-muted mb-2 flex items-center gap-1.5">
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-content-muted">/</span>}
                <span className={idx === breadcrumbs.length - 1 ? 'text-content-secondary font-medium' : ''}>
                  {bc.label}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="text-lg sm:text-xl font-semibold text-content tracking-tight leading-tight">{title}</h1>
        {description && <p className="text-xs text-content-secondary mt-0.5">{description}</p>}
      </div>
      {headerActions && <div>{headerActions}</div>}
    </div>
  );
}

export default PageHeader;
