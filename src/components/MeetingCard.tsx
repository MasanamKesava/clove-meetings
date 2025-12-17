import { Meeting } from "@/types/meeting";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Users, ChevronRight, Pencil, Trash2, FileText } from "lucide-react";
import { DepartmentBadge } from "@/components/ui/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface MeetingCardProps {
  meeting: Meeting;
  className?: string;
  compact?: boolean;

  /** Optional actions (wire these later) */
  onEdit?: (meeting: Meeting) => void;
  onDelete?: (meeting: Meeting) => void;
  onExportPdf?: (meeting: Meeting) => void;

  /** Show action buttons on card (default false to keep clean UI) */
  showActions?: boolean;
}

/** ✅ Safe initials: never crashes */
function getInitials(name?: string) {
  if (!name || typeof name !== "string") return "NA";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "N";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "A";
  return (first + second).toUpperCase();
}

/** ✅ Safe date format */
function safeFormatDate(dateValue?: string) {
  try {
    if (!dateValue) return "—";
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "—";
    return format(d, "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export function MeetingCard({
  meeting,
  className,
  compact = false,
  onEdit,
  onDelete,
  onExportPdf,
  showActions = false,
}: MeetingCardProps) {
  const formattedDate = safeFormatDate(meeting?.date);

  const attendeeCount = meeting?.attendees?.length ?? 0;
  const actionCount = meeting?.actionItems?.length ?? 0;

  // ✅ Protect missing fields (prevents blank white screen)
  const title = meeting?.title ?? "Untitled Meeting";
  const desc = meeting?.description ?? "";
  const time = meeting?.time ?? "—";
  const department = meeting?.department ?? "General";

  if (compact) {
    return (
      <Link
        to={`/meetings/${meeting.id}`}
        className={cn(
          "block rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-foreground truncate">{title}</h3>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {time}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {attendeeCount}
              </span>
            </div>
          </div>
          <DepartmentBadge department={department} />
        </div>
      </Link>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Link
        to={`/meetings/${meeting.id}`}
        className={cn(
          "group block rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <DepartmentBadge department={department} />
              {!meeting?.isApproved && (
                <span className="text-xs text-warning font-medium"></span>
              )}
            </div>

            <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>

            {!!desc && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {desc}
              </p>
            )}

            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {time}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex -space-x-2">
                {(meeting?.attendees ?? []).slice(0, 4).map((attendee: any, idx: number) => {
                  // attendee can be {id,name} OR string OR undefined (from localStorage)
                  const attendeeName =
                    typeof attendee === "string" ? attendee : attendee?.name;

                  const key = attendee?.id ?? attendeeName ?? `attendee-${idx}`;

                  return (
                    <Avatar key={key} className="h-8 w-8 border-2 border-card">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(attendeeName)}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}

                {attendeeCount > 4 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium text-muted-foreground">
                    +{attendeeCount - 4}
                  </div>
                )}
              </div>

              <span className="text-sm text-muted-foreground">
                {actionCount} action items
              </span>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>
      </Link>

      {/* ✅ Optional action buttons (Edit / Delete / PDF) */}
      {showActions && (
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onExportPdf?.(meeting);
            }}
            title="Export MOM PDF"
          >
            <FileText className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit?.(meeting);
            }}
            title="Edit meeting"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete?.(meeting);
            }}
            title="Delete meeting"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
