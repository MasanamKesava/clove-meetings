import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  Mail, 
  Clock, 
  Save,
  AlertTriangle,
  Calendar,
  FileText
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    meetingCreated: true,
    meetingReminder: true,
    actionItemDue: true,
    actionItemOverdue: true,
    reminderHoursBefore: 24,
  });

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your notification preferences have been updated.',
    });
  };

  return (
    <MainLayout
      title="Settings"
      subtitle="Configure notification preferences and system settings"
      actions={
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      }
    >
      <div className="max-w-2xl space-y-8">
        {/* Email Notifications */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-primary/10 p-2">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Configure when to send email notifications
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Meeting Created */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="meeting-created" className="font-medium">
                    Meeting Created
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notify attendees when a new meeting is created and approved
                  </p>
                </div>
              </div>
              <Switch
                id="meeting-created"
                checked={settings.meetingCreated}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, meetingCreated: checked })
                }
              />
            </div>

            <Separator />

            {/* Meeting Reminder */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="meeting-reminder" className="font-medium">
                    Meeting Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send reminder before scheduled meetings
                  </p>
                </div>
              </div>
              <Switch
                id="meeting-reminder"
                checked={settings.meetingReminder}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, meetingReminder: checked })
                }
              />
            </div>

            <Separator />

            {/* Action Item Due */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="action-due" className="font-medium">
                    Action Item Due
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when action items are approaching due date
                  </p>
                </div>
              </div>
              <Switch
                id="action-due"
                checked={settings.actionItemDue}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, actionItemDue: checked })
                }
              />
            </div>

            <Separator />

            {/* Action Item Overdue */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="action-overdue" className="font-medium">
                    Overdue Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when action items are overdue
                  </p>
                </div>
              </div>
              <Switch
                id="action-overdue"
                checked={settings.actionItemOverdue}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, actionItemOverdue: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Reminder Timing */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-primary/10 p-2">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Reminder Timing</h3>
              <p className="text-sm text-muted-foreground">
                Configure when reminders should be sent
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reminder-hours">Hours before meeting</Label>
              <div className="flex items-center gap-3 mt-2">
                <Input
                  id="reminder-hours"
                  type="number"
                  value={settings.reminderHoursBefore}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      reminderHoursBefore: parseInt(e.target.value) || 24,
                    })
                  }
                  className="w-24"
                  min={1}
                  max={168}
                />
                <span className="text-sm text-muted-foreground">hours</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Reminders will be sent {settings.reminderHoursBefore} hours before the meeting
              </p>
            </div>
          </div>
        </div>

        {/* PDF Export Settings */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold">PDF Export</h3>
              <p className="text-sm text-muted-foreground">
                Download meeting MOMs as PDF documents
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Generate Daily Report
            </Button>
            <p className="text-sm text-muted-foreground">
              Generate a PDF containing all meetings for a selected date and department
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
