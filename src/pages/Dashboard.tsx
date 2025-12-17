import { useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MeetingCard } from "@/components/MeetingCard";
import { ActionItemRow } from "@/components/dashboard/ActionItemRow";
import { Button } from "@/components/ui/button";
import { useMeetings } from "@/hooks/useMeetingDetails";

import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { isAfter, isBefore, isToday } from "date-fns";

/* ===============================
   Utils
================================ */
function safeDate(v?: string) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/* ===============================
   ✅ Hook-style task health (reusable)
   If you already have this in MeetingsPage, move this into a hook file and import it.
================================ */
function useTaskHealthFromMeetings() {
  const meetings = useMeetings();
  const now = new Date();

  const totalItems = useMemo(
    () => meetings.flatMap((m) => m?.actionItems ?? []),
    [meetings]
  );

  const completedItems = useMemo(
    () => totalItems.filter((i) => i?.status === "completed"),
    [totalItems]
  );

  const pendingItems = useMemo(
    () => totalItems.filter((i) => i?.status === "pending"),
    [totalItems]
  );

  const overdueItems = useMemo(() => {
    return totalItems.filter((i) => {
      if (!i || i.status === "completed") return false;
      const due = safeDate(i.dueDate);
      return due ? isBefore(due, now) : false;
    });
  }, [totalItems]);

  return {
    meetings,
    totalItems,
    completedItems,
    pendingItems,
    overdueItems,
  };
}

export default function Dashboard() {
  const now = new Date();

  /** ✅ SINGLE SOURCE OF TRUTH */
  const { meetings, totalItems, completedItems, pendingItems, overdueItems } =
    useTaskHealthFromMeetings();

  /* ===============================
     Meetings buckets
  ================================ */
  const todaysMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const d = safeDate(m?.date);
      return d ? isToday(d) : false;
    });
  }, [meetings]);

  const upcomingMeetings = useMemo(() => {
    return meetings
      .filter((m) => {
        const d = safeDate(m?.date);
        return d ? isAfter(d, now) : false;
      })
      .sort((a, b) => {
        const da = safeDate(a?.date)?.getTime() ?? 0;
        const db = safeDate(b?.date)?.getTime() ?? 0;
        return da - db;
      });
  }, [meetings]);

  return (
    <MainLayout
      title="Dashboard"
      subtitle="Welcome back! Here's your meeting overview."
      actions={
        <Link to="/meetings/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Meeting
          </Button>
        </Link>
      }
    >
      {/* ===============================
          Stats Grid
      ================================ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Meetings"
          value={meetings.length}
          description="All meetings"
          icon={Calendar}
        />

        <StatsCard
          title="Today's Meetings"
          value={todaysMeetings.length}
          description="Scheduled today"
          icon={Clock}
        />

        <StatsCard
          title="Completed Tasks"
          value={`${completedItems.length}/${totalItems.length}`}
          description="Action items"
          icon={CheckCircle2}
        />

        <StatsCard
          title="Overdue Items"
          value={overdueItems.length}
          description="Needs attention"
          icon={AlertTriangle}
          className={overdueItems.length > 0 ? "border-destructive/30" : ""}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ===============================
            MAIN CONTENT
        ================================ */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Meetings */}
          {todaysMeetings.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Today's Meetings
              </h2>

              <div className="space-y-3">
                {todaysMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} compact />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Meetings */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Meetings
              </h2>
              <Link to="/meetings">
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {upcomingMeetings.slice(0, 4).map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
          </section>
        </div>

        {/* ===============================
            SIDEBAR – TASK HEALTH (from hook)
        ================================ */}
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-display font-semibold">Task Health</h2>
            </div>

            <div className="space-y-5">
              {/* Overdue */}
              {overdueItems.length > 0 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-destructive">
                      Overdue
                    </span>
                    <span className="text-xs font-semibold text-destructive">
                      {overdueItems.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {overdueItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-destructive/20 bg-destructive/5 p-2"
                      >
                        <ActionItemRow item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending */}
              {pendingItems.length > 0 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-warning">
                      Pending
                    </span>
                    <span className="text-xs font-semibold text-warning">
                      {pendingItems.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {pendingItems.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-warning/20 bg-warning/5 p-2"
                      >
                        <ActionItemRow item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed */}
              {completedItems.length > 0 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-success">
                      Completed
                    </span>
                    <span className="text-xs font-semibold text-success">
                      {completedItems.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {completedItems.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-success/20 bg-success/5 p-2"
                      >
                        <ActionItemRow item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {overdueItems.length === 0 &&
                pendingItems.length === 0 &&
                completedItems.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No tasks available yet.
                  </p>
                )}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
