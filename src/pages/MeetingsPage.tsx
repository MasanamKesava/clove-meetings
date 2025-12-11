import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MeetingCard } from '@/components/dashboard/MeetingCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { meetings, departments } from '@/data/mockData';
import { Plus, Search, Filter, List, Grid, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function MeetingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 🔢 derive years from meeting dates
  const years = useMemo(() => {
    const uniqueYears = new Set<number>();
    meetings.forEach((m) => {
      const d = new Date(m.date);
      if (!isNaN(d.getTime())) {
        uniqueYears.add(d.getFullYear());
      }
    });
    return Array.from(uniqueYears).sort((a, b) => a - b);
  }, []);

  const { filteredMeetings, limitedMeetings } = useMemo(() => {
    const filtered = meetings
      .filter((meeting) => {
        // year filter
        if (selectedYear !== 'all') {
          const d = new Date(meeting.date);
          if (isNaN(d.getTime()) || d.getFullYear().toString() !== selectedYear) {
            return false;
          }
        }
        return true;
      })
      .filter((meeting) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          meeting.title.toLowerCase().includes(q) ||
          meeting.description.toLowerCase().includes(q);

        const matchesDepartment =
          selectedDepartment === 'all' || meeting.department === selectedDepartment;

        return matchesSearch && matchesDepartment;
      })
      // sort by date (earliest to latest)
      .sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return da - db;
      });

    // 💡 limit to 30 cards for the current filters/year
    const limited = filtered.slice(0, 30);

    return {
      filteredMeetings: filtered,
      limitedMeetings: limited,
    };
  }, [searchQuery, selectedDepartment, selectedYear]);

  return (
    <MainLayout
      title="Meetings"
      subtitle="Browse and manage all meetings and MOMs"
      actions={
        <Link to="/meetings/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Meeting
          </Button>
        </Link>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-3 flex-wrap justify-end">
          {/* Year filter */}
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[130px]">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Department filter */}
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Grid / List toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'rounded-none',
                viewMode === 'grid' && 'bg-muted'
              )}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'rounded-none',
                viewMode === 'list' && 'bg-muted'
              )}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing {limitedMeetings.length} of {filteredMeetings.length} meetings
        {filteredMeetings.length > 30 && ' (limited to 30 cards for this view)'}
      </p>

      {/* Meetings Grid/List */}
      {limitedMeetings.length > 0 ? (
        <div
          className={cn(
            viewMode === 'grid' 
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' 
              : 'space-y-3'
          )}
        >
          {limitedMeetings.map((meeting) => (
            <MeetingCard 
              key={meeting.id} 
              meeting={meeting} 
              compact={viewMode === 'list'}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No meetings found matching your criteria.
          </p>
          <Link to="/meetings/new">
            <Button className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Create New Meeting
            </Button>
          </Link>
        </div>
      )}
    </MainLayout>
  );
}
