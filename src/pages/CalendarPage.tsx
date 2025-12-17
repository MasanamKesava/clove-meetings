import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { meetings as mockMeetings } from "@/data/mockData";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  addYears,
  subYears,
} from "date-fns";
import { Link } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type Meeting = (typeof mockMeetings)[number];

// ✅ same key used everywhere
const LS_KEY = "clove_meetings_v1";

function getSavedMeetings(): any[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeMeetings(mock: any[], saved: any[]) {
  const map = new Map<string, any>();
  [...mock, ...saved].forEach((m) => {
    if (m?.id) map.set(m.id, m);
  });
  return Array.from(map.values());
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "year">("month");

  // ✅ meetings from mock + localStorage
  const [allMeetings, setAllMeetings] = useState<any[]>(mockMeetings);

  useEffect(() => {
    const refresh = () => {
      const saved = getSavedMeetings();
      setAllMeetings(mergeMeetings(mockMeetings, saved));
    };

    refresh();

    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);

    const onCustom = () => refresh();
    window.addEventListener("clove:meetingsUpdated", onCustom as any);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("clove:meetingsUpdated", onCustom as any);
    };
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // ✅ no department filter now
  const filteredMeetings = useMemo(() => {
    return allMeetings
      .filter((m) => m?.date) // ensure date exists
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allMeetings]);

  const getMeetingsForDay = (date: Date) => {
    return filteredMeetings.filter((meeting) =>
      isSameDay(new Date(meeting.date), date)
    );
  };

  const handlePrev = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(subYears(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addYears(currentDate, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const monthsInYear = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  return (
    <MainLayout
      title="Calendar"
      subtitle="View and manage all scheduled meetings"
      actions={
        <Link to="/meetings/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Meeting
          </Button>
        </Link>
      }
    >
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h2 className="font-display text-xl font-semibold min-w-[180px] text-center">
            {viewMode === "month"
              ? format(currentDate, "MMMM yyyy")
              : format(currentDate, "yyyy")}
          </h2>

          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        {/* Month / Year toggle (department removed) */}
        <Tabs
          value={viewMode}
          onValueChange={(val) => setViewMode(val as "month" | "year")}
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === "month" ? (
        /* Month View */
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/50">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="px-2 py-3 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dayMeetings = getMeetingsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const today = isToday(day);

              return (
                <div
                  key={idx}
                  className={cn(
                    "min-h-[100px] border-b border-r border-border p-2 transition-colors",
                    !isCurrentMonth && "bg-muted/30",
                    today && "bg-primary/5"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-sm",
                      today && "bg-primary text-primary-foreground font-medium",
                      !isCurrentMonth && "text-muted-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  <div className="mt-1 space-y-1">
                    {dayMeetings.slice(0, 2).map((meeting: any) => (
                      <Popover key={meeting.id}>
                        <PopoverTrigger asChild>
                          <button
                            className={cn(
                              "w-full text-left rounded px-1.5 py-0.5 text-xs truncate transition-colors",
                              "bg-primary/10 text-primary hover:bg-primary/20"
                            )}
                          >
                            <span className="font-medium">
                              {meeting.time ?? "—"}
                            </span>{" "}
                            {meeting.title ?? "Untitled"}
                          </button>
                        </PopoverTrigger>

                        <PopoverContent className="w-72" align="start">
                          <div className="space-y-2">
                            <h4 className="font-medium">
                              {meeting.title ?? "Untitled Meeting"}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {meeting.description ?? ""}
                            </p>

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {meeting.time ?? "—"} •{" "}
                                {(meeting.attendees?.length ?? 0)} attendees
                              </span>

                              <Link to={`/meetings/${meeting.id}`}>
                                <Button variant="link" size="sm" className="h-auto p-0">
                                  View details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}

                    {dayMeetings.length > 2 && (
                      <span className="text-xs text-muted-foreground px-1.5">
                        +{dayMeetings.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Year View */
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {monthsInYear.map((monthDate) => {
            const mStart = startOfMonth(monthDate);
            const mEnd = endOfMonth(monthDate);
            const mCalStart = startOfWeek(mStart);
            const mCalEnd = endOfWeek(mEnd);
            const mDays = eachDayOfInterval({ start: mCalStart, end: mCalEnd });

            return (
              <div
                key={format(monthDate, "yyyy-MM")}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/40">
                  <span className="text-sm font-medium">
                    {format(monthDate, "MMMM")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(monthDate, "yyyy")}
                  </span>
                </div>

                <div className="p-2">
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                      <div
                        key={d}
                        className="text-[10px] text-center text-muted-foreground"
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {mDays.map((day) => {
                      const isCurrentMonthDay = isSameMonth(day, monthDate);
                      const today = isToday(day);
                      const hasMeetings = getMeetingsForDay(day).length > 0;

                      return (
                        <div
                          key={format(day, "yyyy-MM-dd")}
                          className="flex flex-col items-center justify-center"
                        >
                          <div
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full text-[11px]",
                              !isCurrentMonthDay && "text-muted-foreground/40",
                              today && "bg-primary text-primary-foreground font-medium"
                            )}
                          >
                            {format(day, "d")}
                          </div>
                          {hasMeetings && (
                            <span className="mt-0.5 h-1 w-1 rounded-full bg-primary" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}
