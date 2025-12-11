import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Plus, 
  Trash2,
  Calendar,
  Clock,
  Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { departments, users } from '@/data/mockData';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ActionItemForm {
  id: string;
  description: string;
  dueDate: string;
  responsiblePersonId: string;
  followUpPersonId: string;
  priority: 'low' | 'medium' | 'high';
}

export default function NewMeeting() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    department: '',
    attendees: [] as string[],
    summaryPoints: [''],
    keyPoints: [''],
  });

  const [actionItems, setActionItems] = useState<ActionItemForm[]>([]);

  const toggleAttendee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(userId)
        ? prev.attendees.filter(id => id !== userId)
        : [...prev.attendees, userId]
    }));
  };

  const addSummaryPoint = () => {
    setFormData(prev => ({
      ...prev,
      summaryPoints: [...prev.summaryPoints, '']
    }));
  };

  const updateSummaryPoint = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      summaryPoints: prev.summaryPoints.map((p, i) => i === index ? value : p)
    }));
  };

  const removeSummaryPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      summaryPoints: prev.summaryPoints.filter((_, i) => i !== index)
    }));
  };

  const addKeyPoint = () => {
    setFormData(prev => ({
      ...prev,
      keyPoints: [...prev.keyPoints, '']
    }));
  };

  const updateKeyPoint = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.map((p, i) => i === index ? value : p)
    }));
  };

  const removeKeyPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.filter((_, i) => i !== index)
    }));
  };

  const addActionItem = () => {
    setActionItems(prev => [...prev, {
      id: Date.now().toString(),
      description: '',
      dueDate: '',
      responsiblePersonId: '',
      followUpPersonId: '',
      priority: 'medium'
    }]);
  };

  const updateActionItem = (id: string, field: keyof ActionItemForm, value: string) => {
    setActionItems(prev =>
      prev.map(item => item.id === id ? { ...item, [field]: value } : item)
    );
  };

  const removeActionItem = (id: string) => {
    setActionItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: 'Meeting created',
      description: 'Your meeting has been created and is pending approval.',
    });
    
    navigate('/meetings');
  };

  return (
    <MainLayout
      title="New Meeting"
      subtitle="Create a new meeting and MOM"
    >
      <Link
        to="/meetings"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to meetings
      </Link>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        {/* Basic Info */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <h3 className="font-display font-semibold text-lg">Meeting Details</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Q4 Sprint Planning"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the meeting purpose..."
                className="mt-1.5"
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="date">Date *</Label>
                <div className="relative mt-1.5">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="time">Time *</Label>
                <div className="relative mt-1.5">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Attendees */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold text-lg">Attendees</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {users.filter(u => u.isApproved).map((user) => {
              const isSelected = formData.attendees.includes(user.id);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleAttendee(user.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors
                    ${isSelected
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-card border-border hover:border-primary/50'
                    }
                  `}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.name}</span>
                  {isSelected && (
                    <Badge variant="secondary" className="ml-1 h-5">
                      ✓
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary Points */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-display font-semibold text-lg">Summary Points</h3>

          <div className="space-y-3">
            {formData.summaryPoints.map((point, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={point}
                  onChange={(e) => updateSummaryPoint(index, e.target.value)}
                  placeholder={`Summary point ${index + 1}`}
                />
                {formData.summaryPoints.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSummaryPoint(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addSummaryPoint} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Summary Point
          </Button>
        </div>

        {/* Key Points */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-display font-semibold text-lg">Key Points</h3>

          <div className="space-y-3">
            {formData.keyPoints.map((point, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={point}
                  onChange={(e) => updateKeyPoint(index, e.target.value)}
                  placeholder={`Key point ${index + 1}`}
                />
                {formData.keyPoints.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeKeyPoint(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addKeyPoint} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Key Point
          </Button>
        </div>

        {/* Action Items */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-display font-semibold text-lg">Action Items</h3>

          {actionItems.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border border-border p-4 space-y-4"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-muted-foreground">
                  Action Item #{index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeActionItem(item.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateActionItem(item.id, 'description', e.target.value)}
                  placeholder="What needs to be done?"
                  className="mt-1.5"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={item.dueDate}
                    onChange={(e) => updateActionItem(item.id, 'dueDate', e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Priority</Label>
                  <Select
                    value={item.priority}
                    onValueChange={(value) => updateActionItem(item.id, 'priority', value)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Responsible Person</Label>
                  <Select
                    value={item.responsiblePersonId}
                    onValueChange={(value) => updateActionItem(item.id, 'responsiblePersonId', value)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(u => u.isApproved).map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Follow-up Person</Label>
                  <Select
                    value={item.followUpPersonId}
                    onValueChange={(value) => updateActionItem(item.id, 'followUpPersonId', value)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(u => u.isApproved).map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addActionItem} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Action Item
          </Button>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link to="/meetings">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit">
            Create Meeting
          </Button>
        </div>
      </form>
    </MainLayout>
  );
}
