import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`card-tech rounded-tech p-6 ${className}`}>
      {children}
    </div>
  );
}
