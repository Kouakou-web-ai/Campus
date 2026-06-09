import { type ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';

interface TimelineItem {
  num: string;
  title: string;
  desc: string;
  icon?: ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export default function Timeline({ items, className = '' }: TimelineProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Vertical line */}
      <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-200 to-transparent hidden sm:block" />

      <div className="space-y-10">
        {items.map((item, index) => (
          <TimelineEntry key={item.num} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

function TimelineEntry({ item, index }: { item: TimelineItem; index: number }) {
  const { ref, inView } = useInView({ threshold: 0.2, once: true });

  return (
    <div
      ref={ref}
      className="relative flex gap-6 sm:gap-8 items-start"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateX(0)' : 'translateX(-24px)',
        transition: `opacity 600ms ease ${index * 150}ms, transform 600ms cubic-bezier(0.34,1.56,0.64,1) ${index * 150}ms`,
      }}
    >
      {/* Number bubble */}
      <div className="flex-shrink-0 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <span className="text-white font-extrabold text-lg font-heading">{item.num}</span>
        </div>
        {/* Pulse ring */}
        <div
          className="absolute inset-0 rounded-2xl bg-indigo-400/20 animate-ping"
          style={{ animationDelay: `${index * 300}ms`, animationDuration: '2.5s' }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 pt-2 pb-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          {item.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {item.desc}
        </p>
      </div>
    </div>
  );
}
