import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { users, meetings, departments } from '@/data/mockData';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock,
  Search,
  MoreVertical,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalActionItems = meetings.flatMap(m => m.actionItems);
  const completedItems = totalActionItems.filter(i => i.status === 'completed');
  const pendingUsers = users.filter(u => !u.isApproved);

  return (
    <MainLayout
      title="Admin Panel"
      subtitle="Manage users, meetings, and system settings"
    >
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Users"
          value={users.length}
          description={`${pendingUsers.length} pending approval`}
          icon={Users}
        />
        <StatsCard
          title="Total Meetings"
          value={meetings.length}
          description="All time"
          icon={FileText}
        />
        <StatsCard
          title="Completed Tasks"
          value={completedItems.length}
          description={`of ${totalActionItems.length} total`}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Departments"
          value={departments.length}
          description="Active departments"
          icon={Shield}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="meetings" className="gap-2">
            <FileText className="h-4 w-4" />
            Meetings
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2">
            <Shield className="h-4 w-4" />
            Departments
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isApproved ? (
                        <span className="inline-flex items-center gap-1 text-sm text-success">
                          <UserCheck className="h-4 w-4" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-warning">
                          <Clock className="h-4 w-4" />
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {!user.isApproved && (
                            <DropdownMenuItem className="gap-2">
                              <UserCheck className="h-4 w-4" />
                              Approve User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="gap-2">
                            <Shield className="h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <UserX className="h-4 w-4" />
                            Remove User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meeting</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Action Items</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium">{meeting.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {meeting.date} at {meeting.time}
                    </TableCell>
                    <TableCell>{meeting.department}</TableCell>
                    <TableCell>{meeting.attendees.length}</TableCell>
                    <TableCell>{meeting.actionItems.length}</TableCell>
                    <TableCell>
                      {meeting.isApproved ? (
                        <Badge variant="default" className="bg-success/10 text-success border-0">
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-warning/10 text-warning border-0">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => {
              const deptUsers = users.filter(u => u.department === dept.name);
              const deptMeetings = meetings.filter(m => m.department === dept.name);

              return (
                <div
                  key={dept.id}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${dept.color}20`, color: dept.color }}
                    >
                      <Shield className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-semibold">{dept.name}</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Team Members</span>
                      <span className="font-medium">{deptUsers.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Meetings</span>
                      <span className="font-medium">{deptMeetings.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
