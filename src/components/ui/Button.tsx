import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'error';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = variant !== 'primary' ? `btn-${variant}` : 'btn-primary';
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  
  return (
    <button 
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <span className="loading loading-spinner loading-sm"></span>}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
    </button>
  );
}
