import { cn } from '@/lib/utils';
import { ActionItemStatus, Priority } from '@/types/meeting';

interface StatusBadgeProps {
  status: ActionItemStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'bg-warning/10 text-warning border-warning/20',
    },
    'in-progress': {
      label: 'In Progress',
      className: 'bg-info/10 text-info border-info/20',
    },
    completed: {
      label: 'Completed',
      className: 'bg-success/10 text-success border-success/20',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const priorityConfig = {
    low: {
      label: 'Low',
      className: 'bg-success/10 text-success border-success/20',
    },
    medium: {
      label: 'Medium',
      className: 'bg-warning/10 text-warning border-warning/20',
    },
    high: {
      label: 'High',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
  };

  const config = priorityConfig[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface DepartmentBadgeProps {
  department: string;
  className?: string;
}

export function DepartmentBadge({ department, className }: DepartmentBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        'bg-primary/10 text-primary border border-primary/20',
        className
      )}
    >
      {department}
    </span>
  );
}
