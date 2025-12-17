import { Calendar, Clock, ChevronRight, Download, Mail } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function MeetingCardCompact({
  meeting,
  onDownload,
  onShare,
}: {
  meeting: any;
  onDownload?: () => void;
  onShare?: () => void;
}) {
  const date = meeting?.date ? new Date(meeting.date) : null;

  const attendees = (meeting?.attendees ?? []).slice(0, 4);
  const extraCount = (meeting?.attendees?.length ?? 0) - attendees.length;

  return (
    <div className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <span className="text-xs rounded-full border border-emerald-300 text-emerald-600 px-3 py-0.5">
          {meeting?.category ?? "General"}
        </span>

        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Title */}
      <h3 className="mt-2 text-lg font-semibold text-foreground truncate">
        {meeting?.title ?? "Untitled"}
      </h3>

      {/* Subtitle */}
      <p className="text-sm text-muted-foreground truncate">
        {meeting?.description ?? ""}
      </p>

      {/* Date & Time */}
      <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {date ? format(date, "MMM dd, yyyy") : "—"}
        </div>

        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {meeting?.time ?? "—"}
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-4 flex items-start justify-between">
        {/* Attendees */}
        <div className="flex -space-x-2">
          {attendees.map((a: any, i: number) => (
            <div
              key={i}
              className="h-8 w-8 rounded-full bg-emerald-50 border border-white flex items-center justify-center text-xs font-medium text-emerald-700"
            >
              {initials(a?.name ?? a)}
            </div>
          ))}

          {extraCount > 0 && (
            <div className="h-8 w-8 rounded-full bg-muted border border-white flex items-center justify-center text-xs">
              +{extraCount}
            </div>
          )}
        </div>

        {/* Right side: Action items ABOVE buttons */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-muted-foreground">
            {(meeting?.actionItems?.length ?? 0)} action items
          </span>

          <div className="flex items-center gap-2">
            {onShare && (
              <Button size="icon" variant="ghost" onClick={onShare}>
                <Mail className="h-4 w-4" />
              </Button>
            )}

            {onDownload && (
              <Button size="icon" variant="ghost" onClick={onDownload}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
