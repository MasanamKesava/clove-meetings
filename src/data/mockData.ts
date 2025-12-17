import { User, Meeting, Department, ActionItem } from '@/types/meeting';

export const departments: Department[] = [
  { id: '1', name: 'PMC', color: 'hsl(168 60% 38%)' },
  { id: '2', name: 'Design', color: 'hsl(280 65% 50%)' },
  { id: '3', name: 'Assistance Engineering', color: 'hsl(38 92% 50%)' },
  { id: '4', name: 'Deputy Engineerin', color: 'hsl(199 89% 48%)' },
  { id: '5', name: 'Contractor', color: 'hsl(340 65% 50%)' },
];

export const users: User[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@clove.com', role: 'admin', department: 'Engineering', isApproved: true },
  { id: '2', name: 'Marcus Johnson', email: 'marcus@clove.com', role: 'user', department: 'Engineering', isApproved: true },
  { id: '3', name: 'Emily Rodriguez', email: 'emily@clove.com', role: 'user', department: 'Design', isApproved: true },
  { id: '4', name: 'David Kim', email: 'david@clove.com', role: 'user', department: 'Marketing', isApproved: true },
  { id: '5', name: 'Lisa Thompson', email: 'lisa@clove.com', role: 'user', department: 'Sales', isApproved: true },
  { id: '6', name: 'James Wilson', email: 'james@clove.com', role: 'user', department: 'HR', isApproved: false },
];

export const currentUser = users[0];

const createActionItem = (
  id: string,
  description: string,
  dueDate: string,
  responsibleId: string,
  followUpId: string,
  status: 'pending' | 'in-progress' | 'completed',
  priority: 'low' | 'medium' | 'high'
): ActionItem => ({
  id,
  description,
  dueDate,
  responsiblePerson: users.find(u => u.id === responsibleId)!,
  followUpPerson: users.find(u => u.id === followUpId)!,
  status,
  priority,
});

export const meetings: Meeting[] = [
  {
    id: '1',
    title: 'Q4 Sprint Planning',
    description: 'Plan the upcoming sprint goals and assign tasks for the engineering team.',
    date: '2024-12-15',
    time: '10:00',
    department: 'Engineering',
    attendees: [users[0], users[1]],
    summaryPoints: [
      'Reviewed Q3 deliverables and identified areas for improvement',
      'Discussed new feature priorities based on customer feedback',
      'Allocated resources for critical bug fixes',
    ],
    keyPoints: [
      'Focus on performance optimization for the main dashboard',
      'New authentication flow to be implemented by end of sprint',
      'Technical debt reduction allocated 20% of sprint capacity',
    ],
    actionItems: [
      createActionItem('1', 'Create technical spec for new auth flow', '2024-12-18', '2', '1', 'in-progress', 'high'),
      createActionItem('2', 'Review and merge pending PRs', '2024-12-16', '1', '2', 'pending', 'medium'),
      createActionItem('3', 'Update documentation for API changes', '2024-12-20', '2', '1', 'pending', 'low'),
    ],
    createdBy: users[0],
    isApproved: true,
    createdAt: '2024-12-10T09:00:00Z',
  },
  {
    id: '2',
    title: 'Design System Review',
    description: 'Review and update the design system components for consistency across products.',
    date: '2024-12-16',
    time: '14:00',
    department: 'Design',
    attendees: [users[2], users[0]],
    summaryPoints: [
      'Audited existing components for accessibility compliance',
      'Identified 12 components needing updates',
      'Agreed on new color palette for dark mode',
    ],
    keyPoints: [
      'All buttons to be updated with new hover states',
      'Typography scale to be simplified',
      'New icon set to be implemented across all products',
    ],
    actionItems: [
      createActionItem('4', 'Update button component variants', '2024-12-19', '3', '1', 'pending', 'high'),
      createActionItem('5', 'Create dark mode color tokens', '2024-12-22', '3', '1', 'pending', 'medium'),
    ],
    createdBy: users[2],
    isApproved: true,
    createdAt: '2024-12-11T14:00:00Z',
  },
  {
    id: '3',
    title: 'Marketing Campaign Kickoff',
    description: 'Launch planning for the new year marketing campaign.',
    date: '2024-12-17',
    time: '09:00',
    department: 'Marketing',
    attendees: [users[3], users[4]],
    summaryPoints: [
      'Defined target audience segments',
      'Set campaign budget and timeline',
      'Outlined content strategy for Q1',
    ],
    keyPoints: [
      'Focus on social media engagement',
      'Partner with 3 influencers',
      'Launch email nurture sequence by Jan 15',
    ],
    actionItems: [
      createActionItem('6', 'Draft campaign brief', '2024-12-20', '4', '5', 'in-progress', 'high'),
      createActionItem('7', 'Research influencer partnerships', '2024-12-25', '4', '5', 'pending', 'medium'),
    ],
    createdBy: users[3],
    isApproved: true,
    createdAt: '2024-12-12T09:00:00Z',
  },
  {
    id: '4',
    title: 'Weekly Team Standup',
    description: 'Regular weekly standup to sync on progress and blockers.',
    date: '2024-12-11',
    time: '09:30',
    department: 'Engineering',
    attendees: [users[0], users[1]],
    summaryPoints: [
      'All team members on track with sprint goals',
      'One blocker identified with third-party API',
      'Code review backlog cleared',
    ],
    keyPoints: [
      'API issue escalated to vendor',
      'New hire onboarding scheduled for next week',
    ],
    actionItems: [
      createActionItem('8', 'Follow up with API vendor', '2024-12-12', '1', '2', 'completed', 'high'),
      createActionItem('9', 'Prepare onboarding materials', '2024-12-13', '2', '1', 'completed', 'medium'),
    ],
    createdBy: users[0],
    isApproved: true,
    createdAt: '2024-12-11T09:30:00Z',
  },
  {
    id: '5',
    title: 'Sales Pipeline Review',
    description: 'Monthly review of sales pipeline and forecast.',
    date: '2024-12-18',
    time: '11:00',
    department: 'Sales',
    attendees: [users[4], users[0]],
    summaryPoints: [
      'Q4 target at 85% completion',
      'Three enterprise deals in final negotiation',
      'New lead generation strategy showing results',
    ],
    keyPoints: [
      'Close Enterprise Deal A by Dec 20',
      'Increase demo bookings by 15%',
      'Launch referral program in January',
    ],
    actionItems: [
      createActionItem('10', 'Prepare enterprise proposal', '2024-12-19', '5', '1', 'in-progress', 'high'),
      createActionItem('11', 'Update sales playbook', '2024-12-28', '5', '1', 'pending', 'low'),
    ],
    createdBy: users[4],
    isApproved: true,
    createdAt: '2024-12-13T11:00:00Z',
  },
];

export const getUpcomingMeetings = () => {
  const today = new Date();
  return meetings.filter(m => new Date(m.date) >= today).slice(0, 5);
};

export const getTodaysMeetings = () => {
  const today = new Date().toISOString().split('T')[0];
  return meetings.filter(m => m.date === today);
};

export const getOverdueActionItems = () => {
  const today = new Date();
  const items: (ActionItem & { meetingTitle: string })[] = [];
  
  meetings.forEach(meeting => {
    meeting.actionItems.forEach(item => {
      if (new Date(item.dueDate) < today && item.status !== 'completed') {
        items.push({ ...item, meetingTitle: meeting.title });
      }
    });
  });
  
  return items;
};

export const getPendingActionItems = () => {
  const items: (ActionItem & { meetingTitle: string })[] = [];
  
  meetings.forEach(meeting => {
    meeting.actionItems.forEach(item => {
      if (item.status !== 'completed') {
        items.push({ ...item, meetingTitle: meeting.title });
      }
    });
  });
  
  return items;
};
