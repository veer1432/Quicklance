export type UserRole = 'client' | 'expert' | 'admin';
export type UserStatus = 'pending' | 'active' | 'blocked' | 'suspended' | 'rejected';

export interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface Certificate {
  name: string;
  issuer?: string;
  year?: string;
  url?: string;
  fileName?: string;
  fileUrl?: string;
  type?: 'certificate' | 'experience' | 'offer-letter' | 'appraisal' | 'salary-slip' | 'bank-statement' | 'other';
}

export interface AvailabilitySlot {
  day: string; // e.g., 'Monday'
  startTime: string; // e.g., '09:00'
  endTime: string; // e.g., '17:00'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  rating?: number;
  reviewCount?: number;
  experience?: Experience[];
  certificates?: Certificate[];
  availability?: AvailabilitySlot[];
  walletBalance?: number;
  totalEarnings?: number;
  country?: string;
  currency?: string;
  isOnline?: boolean;
  isAvailable?: boolean;
  status?: UserStatus;
  phoneNumber?: string;
  totalCalls?: number;
  totalCallTime?: number; // in minutes
  successfulCalls?: number;
  rejectionRemarks?: string;
  isFresher?: boolean;
  declarationAccepted?: boolean;
  createdAt: string;
}


export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  isMasked?: boolean;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  participants: string[]; // [clientId, expertId]
  lastMessage?: string;
  lastMessageAt?: string;
  clientId: string;
  expertId: string;
  clientName: string;
  expertName: string;
  clientPhoto?: string;
  expertPhoto?: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in-progress' | 'resolved' | 'cancelled';
  expertId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  issueId: string;
  fromId: string;
  toId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SessionFeedback {
  rating: number;
  satisfaction: 'satisfied' | 'neutral' | 'unsatisfied';
  comment?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  clientId: string;
  expertId: string;
  issueId?: string;
  status: 'pending' | 'active' | 'completed' | 'resolved' | 'not-resolved-mutual' | 'dispute' | 'cancelled';
  clientResolution?: 'resolved' | 'not-resolved';
  expertResolution?: 'resolved' | 'not-resolved';
  startTime: string; // ISO string
  endTime?: string; // ISO string
  durationMinutes: number; // current total duration (30, 60, 90...)
  basePrice: number; // ₹250
  totalPaid: number; // total amount paid so far
  isExtended: boolean;
  extensionCount: number;
  lastAlertTime?: string; // when the 25-min alert was shown
  meetingLink?: string;
  feedback?: SessionFeedback;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackResponse {
  id?: string;
  // Section 1: Background
  userPersona: string; // Student, Freelancer, etc.
  techStack: string[]; // WordPress, Shopify, etc.
  issueFrequency: string;

  // Section 2: Problem
  currentMove: string[]; // Google, YouTube, etc.
  timeWastedPerIssue: string;
  failureRate: string;

  // Section 3: Payment
  willingnessToPay: string;
  pricePoint: string;
  barrierToPay: string[];
  trustTriggers: string[];

  // Section 4: Product Feedback
  chatBeforeBooking: string;
  bookingPreference: string;
  likelihoodToTry: number; // 1-5

  // Section 5: Early Access
  wantEarlyAccess: string;
  name: string;
  email: string;
  whatsapp: string;
  recentIssueStory: string;
  
  createdAt: string;
}

export interface Dispute {
  id: string;
  sessionId: string;
  clientId: string;
  expertId: string;
  status: 'open' | 'resolved-released' | 'resolved-refunded';
  adminNotes?: string;
  adminResolution?: string;
  resolvedAt?: any;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORIES = [
  "Wix/Websites",
  "Shopify/Store",
  "WordPress",
  "Video Editing",
  "Finance/GST",
  "Ads/Marketing",
  "UI/UX Design",
  "Coding/Tech",
  "SEO",
  "General Assistance"
] as const;
