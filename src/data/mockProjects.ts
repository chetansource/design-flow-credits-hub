
import { Project } from '@/types';
import { designItems } from './designItems';

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    clientId: 'demo-user-1',
    clientName: 'Demo Client',
    title: 'Business Card Design',
    designItem: designItems[0], // Business Card
    selectedSize: 'Standard',
    description: 'Need professional business cards for my consulting firm. Clean, modern design with company logo.',
    driveLink: 'https://drive.google.com/folder/sample1',
    status: 'new',
    creditsUsed: 2,
    createdAt: '2024-06-08T10:00:00Z',
    updatedAt: '2024-06-08T10:00:00Z',
    dueDate: '2024-06-12T10:00:00Z',
    designerComments: [],
    isApproved: false,
  },
  {
    id: 'proj-2',
    clientId: 'demo-user-1',
    clientName: 'Demo Client',
    title: 'Product Brochure',
    designItem: designItems[1], // Brochure
    selectedSize: 'Bi-fold A4',
    description: 'Marketing brochure for our new product line. Should highlight key features and benefits.',
    driveLink: 'https://drive.google.com/folder/sample2',
    status: 'wip',
    creditsUsed: 5,
    createdAt: '2024-06-06T14:30:00Z',
    updatedAt: '2024-06-09T09:15:00Z',
    dueDate: '2024-06-11T14:30:00Z',
    designerComments: [
      {
        id: 'comment-1',
        authorId: 'demo-designer-1',
        authorName: 'Demo Designer',
        content: 'Working on the initial layout. Will have first draft ready by tomorrow.',
        timestamp: '2024-06-09T09:15:00Z',
      },
    ],
    isApproved: false,
  },
  {
    id: 'proj-3',
    clientId: 'demo-user-1',
    clientName: 'Demo Client',
    title: 'Event Flyer',
    designItem: designItems[2], // Flyer
    selectedSize: 'A4',
    description: 'Promotional flyer for upcoming conference. Need eye-catching design with event details.',
    status: 'info_required',
    creditsUsed: 3,
    createdAt: '2024-06-05T11:00:00Z',
    updatedAt: '2024-06-08T16:20:00Z',
    dueDate: '2024-06-10T11:00:00Z',
    designerComments: [
      {
        id: 'comment-2',
        authorId: 'demo-designer-1',
        authorName: 'Demo Designer',
        content: 'Need more details about the event theme and target audience. Please provide brand guidelines.',
        timestamp: '2024-06-08T16:20:00Z',
      },
    ],
    isApproved: false,
  },
  {
    id: 'proj-4',
    clientId: 'demo-user-1',
    clientName: 'Demo Client',
    title: 'Social Media Graphics',
    designItem: designItems[3], // Social Media Post
    selectedSize: 'Instagram Post',
    description: 'Set of 5 social media graphics for product launch campaign.',
    status: 'feedback_approval',
    creditsUsed: 4,
    createdAt: '2024-06-03T09:00:00Z',
    updatedAt: '2024-06-09T14:00:00Z',
    dueDate: '2024-06-08T09:00:00Z',
    designerComments: [
      {
        id: 'comment-3',
        authorId: 'demo-designer-1',
        authorName: 'Demo Designer',
        content: 'First version completed. Please review and provide feedback.',
        timestamp: '2024-06-09T14:00:00Z',
      },
    ],
    isApproved: false,
  },
  {
    id: 'proj-5',
    clientId: 'demo-user-1',
    clientName: 'Demo Client',
    title: 'Logo Design',
    designItem: designItems[4], // Logo Design
    selectedSize: 'Standard',
    description: 'Modern logo for tech startup. Should be clean and scalable.',
    status: 'completed',
    creditsUsed: 8,
    createdAt: '2024-05-28T10:00:00Z',
    updatedAt: '2024-06-05T16:00:00Z',
    dueDate: '2024-06-02T10:00:00Z',
    designerComments: [
      {
        id: 'comment-4',
        authorId: 'demo-designer-1',
        authorName: 'Demo Designer',
        content: 'Final logo delivered with all file formats. Project completed successfully.',
        timestamp: '2024-06-05T16:00:00Z',
      },
    ],
    isApproved: true,
  },
];
