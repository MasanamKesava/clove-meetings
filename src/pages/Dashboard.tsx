import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { MeetingCard } from '@/components/dashboard/MeetingCard';
import { ActionItemRow } from '@/components/dashboard/ActionItemRow';
import { Button } from '@/components/ui/button';
import { 
  meetings, 
  getUpcomingMeetings, 
  getTodaysMeetings, 
  getOverdueActionItems,
  getPendingActionItems 
} from '@/data/mockData';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const upcomingMeetings = getUpcomingMeetings();
  const todaysMeetings = getTodaysMeetings();
  const overdueItems = getOverdueActionItems();
  const pendingItems = getPendingActionItems();

  const completedItems = meetings.flatMap(m => m.actionItems).filter(i => i.status === 'completed');
  const totalItems = meetings.flatMap(m => m.actionItems);

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
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Meetings"
          value={meetings.length}
          description="This month"
          icon={Calendar}
        />
        <StatsCard
          title="Today's Meetings"
          value={todaysMeetings.length}
          description="Scheduled for today"
          icon={Clock}
        />
        <StatsCard
          title="Completed Tasks"
          value={`${completedItems.length}/${totalItems.length}`}
          description="Action items"
          icon={CheckCircle2}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Overdue Items"
          value={overdueItems.length}
          description="Needs attention"
          icon={AlertTriangle}
          className={overdueItems.length > 0 ? 'border-destructive/30' : ''}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Meetings */}
          {todaysMeetings.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Today's Meetings
                </h2>
              </div>
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
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
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

        {/* Sidebar - Action Items */}
        <div className="space-y-6">
          {/* Overdue Items */}
          {overdueItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h2 className="font-display font-semibold text-foreground">
                  Overdue Items
                </h2>
                <span className="ml-auto rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  {overdueItems.length}
                </span>
              </div>
              <div className="space-y-3">
                {overdueItems.slice(0, 3).map((item) => (
                  <ActionItemRow key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Pending Action Items */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">
                Pending Tasks
              </h2>
              <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {pendingItems.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingItems.slice(0, 5).map((item) => (
                <ActionItemRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
