import { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { meetings } from '@/data/mockData';
import { 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft,
  Download,
  Edit,
  CheckCircle,
  Circle,
  AlertCircle
} from 'lucide-react';
import { DepartmentBadge, StatusBadge, PriorityBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const meeting = meetings.find((m) => m.id === id);

  const printRef = useRef<HTMLDivElement | null>(null);

  if (!meeting) {
    return (
      <MainLayout title="Meeting Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            The meeting you're looking for doesn't exist.
          </p>
          <Link to="/meetings">
            <Button>Back to Meetings</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Meeting date from data (actual meeting schedule)
  const formattedDate = format(new Date(meeting.date), 'EEEE, MMMM d, yyyy');

  // ✅ System date & time (when user opens this page / prepares MOM)
  const now = new Date();
  const currentDateStr = format(now, 'MMMM d, yyyy');
  const currentTimeStr = format(now, 'h:mm a');

  // Optional extra fields from data (can be added in mockData / DB)
  const meetingWith: string[] = (meeting as any).meetingWith || [];
  const agenda: string = (meeting as any).agenda || 'Agenda not provided';

  const handleExportPDF = async () => {
    if (!printRef.current) return;

    const element = printRef.current;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    let position = 0;
    let heightLeft = pdfHeight;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft > 0) {
      pdf.addPage();
      position = heightLeft - pdfHeight;
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    pdf.save(`Meeting-${meeting.id}.pdf`);
  };

  return (
    <MainLayout
      title={meeting.title}
      subtitle={meeting.department}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      }
    >
      {/* Back link */}
      <Link
        to="/meetings"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to meetings
      </Link>

      {/* Everything inside this wrapper is exported to PDF */}
      <div ref={printRef}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Meeting Info Card (from meeting data) */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <DepartmentBadge department={meeting.department} />
                {meeting.isApproved ? (
                  <span className="inline-flex items-center gap-1 text-sm text-success">
                    <CheckCircle className="h-4 w-4" />
                    Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm text-warning">
                    <AlertCircle className="h-4 w-4" />
                    Pending Approval
                  </span>
                )}
              </div>

              <p className="text-muted-foreground mb-6">
                {meeting.description}
              </p>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{meeting.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{meeting.attendees.length} attendees</span>
                </div>
              </div>
            </div>

            {/* ✅ Meeting Information (MOM-style, using system time) */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold text-lg mb-4">
                Meeting Information
              </h3>

              <div className="space-y-3 text-sm">
                <p>
                  <strong>Meeting With:</strong>{' '}
                  {meetingWith.length > 0
                    ? meetingWith.join(', ')
                    : 'Not specified'}
                </p>

                <p>
                  <strong>Current Date:</strong> {currentDateStr}
                </p>

                <p>
                  <strong>Time:</strong> {currentTimeStr}
                </p>

                <p>
                  <strong>Venue:</strong>{' '}
                  AICCC Room, APCRDA Project Office, Lingayapalem
                </p>

                <p>
                  <strong>Attendees:</strong>{' '}
                  {meeting.attendees.length > 0
                    ? meeting.attendees.map((a) => a.name).join(', ')
                    : 'Not specified'}
                </p>

                <p>
                  <strong>Agenda:</strong> {agenda}
                </p>
              </div>
            </div>

            {/* Summary Points */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold text-lg mb-4">
                Summary Points
              </h3>
              <ul className="space-y-3">
                {meeting.summaryPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Circle className="h-2 w-2 mt-2 text-primary fill-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Points */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold text-lg mb-4">
                Key Points
              </h3>
              <ul className="space-y-3">
                {meeting.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Items */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold text-lg mb-4">
                Action Items ({meeting.actionItems.length})
              </h3>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">
                        Description
                      </TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Follow Up</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meeting.actionItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(item.dueDate), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {item.responsiblePerson.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {item.responsiblePerson.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                {item.followUpPerson.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {item.followUpPerson.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={item.status} />
                        </TableCell>
                        <TableCell>
                          <PriorityBadge priority={item.priority} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attendees card (detailed) */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold mb-4">Attendees</h3>
              <div className="space-y-3">
                {meeting.attendees.map((attendee) => (
                  <div key={attendee.id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {attendee.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {attendee.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attendee.department}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Created By / Prepared By */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold mb-4">Created By</h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {meeting.createdBy.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{meeting.createdBy.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {meeting.createdBy.email}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Created on{' '}
                {format(
                  new Date(meeting.createdAt),
                  'MMM d, yyyy'
                )}{' '}
                at{' '}
                {format(new Date(meeting.createdAt), 'h:mm a')}
              </p>

              <div className="mt-4">
                <h4 className="font-semibold">Prepared By:</h4>
                <p className="text-sm">
                  Respected {meeting.createdBy.name}
                  <br />
                  <span className="text-muted-foreground">
                    Organization: AICCC
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Action Items
                  </span>
                  <span className="font-medium">
                    {meeting.actionItems.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Completed
                  </span>
                  <span className="font-medium text-success">
                    {
                      meeting.actionItems.filter(
                        (i) => i.status === 'completed'
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    In Progress
                  </span>
                  <span className="font-medium text-info">
                    {
                      meeting.actionItems.filter(
                        (i) => i.status === 'in-progress'
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Pending
                  </span>
                  <span className="font-medium text-warning">
                    {
                      meeting.actionItems.filter(
                        (i) => i.status === 'pending'
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
