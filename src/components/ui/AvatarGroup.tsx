interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const GRADIENT_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-sky-600',
];

function getInitials(name: string): string {
  const safeName = name || 'Utilisateur';
  return safeName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

function getColorIndex(name: string): number {
  const safeName = name || 'Utilisateur';
  const sum = safeName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return sum % GRADIENT_COLORS.length;
}

function Avatar({ name = 'Utilisateur', src, size = 'md', className = '' }: AvatarProps) {
  const safeName = name || 'Utilisateur';
  const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  const gradient = GRADIENT_COLORS[getColorIndex(safeName)];

  if (src) {
    return (
      <img
        src={src}
        alt={safeName}
        className={`${sizeMap[size]} rounded-full object-cover ring-2 ring-white ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold ring-2 ring-white flex-shrink-0 ${className}`}
      title={safeName}
    >
      {getInitials(safeName)}
    </div>
  );
}

interface AvatarGroupProps {
  names: string[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export { Avatar };

export default function AvatarGroup({ names, max = 4, size = 'sm', className = '' }: AvatarGroupProps) {
  const visible = names.slice(0, max);
  const remaining = names.length - max;

  return (
    <div className={`flex items-center ${className}`}>
      {visible.map((name, i) => (
        <Avatar
          key={i}
          name={name}
          size={size}
          className={i > 0 ? '-ml-2' : ''}
        />
      ))}
      {remaining > 0 && (
        <div
          className={`${size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'} -ml-2 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-600 font-semibold`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
