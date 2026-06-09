import type { UserStatus } from '../../types/userAccount';
import { accountStatusLabels } from '../../constants/accountStatus';

const STATUS_STYLES: Record<UserStatus, string> = {
  pending: 'badge-warning',
  active: 'badge-success',
  rejected: 'badge-error',
  suspended: 'badge-neutral',
};

interface UserStatusBadgeProps {
  status: UserStatus;
  className?: string;
}

export default function UserStatusBadge({ status, className = '' }: UserStatusBadgeProps) {
  return (
    <span className={`badge badge-sm font-semibold ${STATUS_STYLES[status]} ${className}`}>
      {accountStatusLabels[status]}
    </span>
  );
}
