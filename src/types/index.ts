
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'client' | 'designer';
  photoURL?: string;
}

export interface Client extends User {
  role: 'client';
  credits: number;
  monthlyCredits: number;
  carryoverCredits: number;
  lastCreditReset: string;
}

export interface Designer extends User {
  role: 'designer';
}

export interface DesignItem {
  id: string;
  name: string;
  category: string;
  sizes: string[];
  creditsPerCreative: number;
  description?: string;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  name: string;
  credits: number;
  title: string;
  designItem: DesignItem;
  selectedSize: string;
  description: string;
  driveLink?: string;
  size?: string;
  status:
    | "new"
    | "info_required"
    | "wip"
    | "feedback_approval"
    | "completed"
    | "on_hold";
  creditsUsed: number;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  designerComments: Comment[];
  clientFeedback?: string;
  isApproved: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
}

export interface CreditTransaction {
  id: string;
  clientId: string;
  projectId: string;
  amount: number;
  type: 'deduction' | 'carryover' | 'reset';
  timestamp: string;
  description: string;
}
