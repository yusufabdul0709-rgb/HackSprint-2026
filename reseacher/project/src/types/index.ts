export type Role = 'admin' | 'principal_investigator' | 'research_coordinator' | 'sponsor' | 'participant';

export type StudyStatus = 'recruiting' | 'screening' | 'active' | 'completed' | 'paused';
export type ScreeningStatus = 'candidate' | 'screening' | 'potentially_eligible' | 'human_review' | 'approved' | 'rejected';
export type ConsentStatus = 'not_started' | 'sent' | 'viewed' | 'pending' | 'consented' | 'withdrawn';
export type EnrollmentStatus = 'not_enrolled' | 'enrolled' | 'completed' | 'withdrawn';
export type VisitStatus = 'scheduled' | 'completed' | 'missed' | 'cancelled';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type TaskType = 'eligibility_review' | 'consent_review' | 'participant_followup' | 'visit_preparation' | 'document_review' | 'data_verification';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  organization?: string;
  specialty?: string;
}

export interface EligibilityCriterion {
  id: string;
  field: string;
  operator: string;
  value: string;
  category: 'inclusion' | 'exclusion';
}

export interface Study {
  id: string;
  name: string;
  description: string;
  condition: string;
  sponsor: string;
  researchSite: string;
  startDate: string;
  endDate: string;
  targetParticipants: number;
  enrolledParticipants: number;
  status: StudyStatus;
  eligibilityCriteria: EligibilityCriterion[];
  anatomy?: string;
  anatomyDescription?: string;
  phase: string;
  principalInvestigator: string;
}

export interface ScreeningResult {
  criterionId: string;
  criterionLabel: string;
  status: 'match' | 'review' | 'mismatch';
  detail: string;
}

export interface Participant {
  id: string;
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  location: string;
  studyId: string;
  studyName: string;
  screeningStatus: ScreeningStatus;
  consentStatus: ConsentStatus;
  enrollmentStatus: EnrollmentStatus;
  lastActivity: string;
  enrolledDate?: string;
  aiConfidence?: number;
  screeningResults?: ScreeningResult[];
  screeningReviewed?: boolean;
  screeningReviewedBy?: string;
  screeningReviewedDate?: string;
  screeningNotes?: string;
}

export interface Visit {
  id: string;
  participantId: string;
  participantName: string;
  studyId: string;
  studyName: string;
  date: string;
  time: string;
  location: string;
  coordinator: string;
  type: string;
  status: VisitStatus;
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  participantId?: string;
  participantName?: string;
  studyId: string;
  studyName: string;
  dueDate: string;
  dueTime: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string;
}

export interface ConsentRecord {
  id: string;
  participantId: string;
  participantName: string;
  studyId: string;
  studyName: string;
  consentVersion: string;
  dateSent?: string;
  dateViewed?: string;
  dateSigned?: string;
  researcher: string;
  status: ConsentStatus;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  studyId?: string;
  studyName?: string;
  participantId?: string;
  participantName?: string;
  uploadedBy: string;
  date: string;
  status: 'active' | 'pending' | 'archived';
  size: string;
}

export interface Message {
  id: string;
  from: string;
  fromRole: Role;
  to: string;
  toRole: Role;
  subject: string;
  preview: string;
  body: string;
  date: string;
  time: string;
  read: boolean;
  type: 'consent_reminder' | 'visit_reminder' | 'eligibility_review' | 'task_assignment' | 'study_update' | 'general';
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  userRole: Role;
  target: string;
  timestamp: string;
  category: 'study' | 'participant' | 'consent' | 'document' | 'system' | 'screening';
}

export interface Activity {
  id: string;
  action: string;
  user: string;
  target: string;
  timestamp: string;
  type: 'study' | 'participant' | 'consent' | 'document' | 'screening';
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  users: number;
  studies: number;
  participants: number;
  status: 'active' | 'inactive';
}
