import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`card-premium ${className}`} {...props}>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}
