export type UserRole = 'admin' | 'user';

export type ActionItemStatus = 'pending' | 'in-progress' | 'completed';
export type Priority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  isApproved: boolean;
}

export interface ActionItem {
  id: string;
  description: string;
  dueDate: string;
  responsiblePerson: User;
  followUpPerson: User;
  status: ActionItemStatus;
  priority: Priority;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  department: string;
  attendees: User[];
  summaryPoints: string[];
  keyPoints: string[];
  actionItems: ActionItem[];
  createdBy: User;
  isApproved: boolean;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  color: string;
}

export interface NotificationSettings {
  meetingCreated: boolean;
  meetingReminder: boolean;
  actionItemDue: boolean;
  actionItemOverdue: boolean;
  reminderHoursBefore: number;
}
