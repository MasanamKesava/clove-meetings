import { Meeting } from '@/types/meeting';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Users, ChevronRight } from 'lucide-react';
import { DepartmentBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface MeetingCardProps {
  meeting: Meeting;
  className?: string;
  compact?: boolean;
}

export function MeetingCard({ meeting, className, compact = false }: MeetingCardProps) {
  const formattedDate = format(new Date(meeting.date), 'MMM d, yyyy');
  
  if (compact) {
    return (
      <Link
        to={`/meetings/${meeting.id}`}
        className={cn(
          'block rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-foreground truncate">{meeting.title}</h3>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {meeting.time}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {meeting.attendees.length}
              </span>
            </div>
          </div>
          <DepartmentBadge department={meeting.department} />
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/meetings/${meeting.id}`}
      className={cn(
        'group block rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <DepartmentBadge department={meeting.department} />
            {!meeting.isApproved && (
              <span className="text-xs text-warning font-medium">Pending Approval</span>
            )}
          </div>
          <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {meeting.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {meeting.description}
          </p>
          
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {meeting.time}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex -space-x-2">
              {meeting.attendees.slice(0, 4).map((attendee) => (
                <Avatar key={attendee.id} className="h-8 w-8 border-2 border-card">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {attendee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {meeting.attendees.length > 4 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium text-muted-foreground">
                  +{meeting.attendees.length - 4}
                </div>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {meeting.actionItems.length} action items
            </span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </div>
    </Link>
  );
}
