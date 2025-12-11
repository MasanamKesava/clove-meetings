import { ActionItem } from '@/types/meeting';
import { cn } from '@/lib/utils';
import { StatusBadge, PriorityBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, AlertCircle } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

interface ActionItemRowProps {
  item: ActionItem & { meetingTitle?: string };
  className?: string;
}

export function ActionItemRow({ item, className }: ActionItemRowProps) {
  const dueDate = new Date(item.dueDate);
  const isOverdue = isPast(dueDate) && !isToday(dueDate) && item.status !== 'completed';
  const isDueToday = isToday(dueDate);

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm',
        isOverdue && 'border-destructive/30 bg-destructive/5',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-foreground">{item.description}</p>
            {isOverdue && (
              <span className="inline-flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                Overdue
              </span>
            )}
          </div>
          
          {item.meetingTitle && (
            <p className="mt-1 text-sm text-muted-foreground">
              From: {item.meetingTitle}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge status={item.status} />
            <PriorityBadge priority={item.priority} />
            
            <span
              className={cn(
                'flex items-center gap-1 text-sm',
                isOverdue ? 'text-destructive' : isDueToday ? 'text-warning' : 'text-muted-foreground'
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              {format(dueDate, 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Assigned to</span>
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {item.responsiblePerson.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
          <span className="text-xs text-muted-foreground">
            {item.responsiblePerson.name}
          </span>
        </div>
      </div>
    </div>
  );
}
