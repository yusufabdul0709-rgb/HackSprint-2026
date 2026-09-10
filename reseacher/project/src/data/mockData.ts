import type {
  Study,
  Participant,
  Visit,
  Task,
  ConsentRecord,
  Document,
  Message,
  AuditLog,
  Activity,
  Organization,
  User,
  ScreeningResult,
} from '@/types';

export const currentUser: User = {
  id: 'u1',
  name: 'Sarah Chen',
  email: 'sarah.chen@trialbridge.io',
  role: 'PLATFORM_ADMIN',
  organization: 'TrialBridge',
};

export const users: User[] = [
  currentUser,
  { id: 'u2', name: 'Dr. James Patel', email: 'j.patel@cityhospital.org', role: 'PRINCIPAL_INVESTIGATOR', organization: 'City Hospital', specialty: 'Endocrinology' },
  { id: 'u3', name: 'Maya Rodriguez', email: 'maya.r@trialbridge.io', role: 'RESEARCH_COORDINATOR', organization: 'TrialBridge' },
  { id: 'u4', name: 'Michael Torres', email: 'm.torres@pharmaco.com', role: 'ORGANIZATION', organization: 'PharmaCo Research' },
  { id: 'u5', name: 'Rahul Mehta', email: 'rahul.mehta@email.com', role: 'PARTICIPANT', organization: 'City Hospital' },
];

export const organizations: Organization[] = [
  { id: 'o1', name: 'City Hospital', type: 'Hospital', users: 48, studies: 6, participants: 124, status: 'active' },
  { id: 'o2', name: 'Sunshine Medical Center', type: 'Medical Center', users: 32, studies: 4, participants: 87, status: 'active' },
  { id: 'o3', name: 'Metro Care Research', type: 'Research Institute', users: 27, studies: 3, participants: 65, status: 'active' },
  { id: 'o4', name: 'Global Health University', type: 'University', users: 56, studies: 8, participants: 198, status: 'active' },
  { id: 'o5', name: 'LifeCare Hospital', type: 'Hospital', users: 19, studies: 2, participants: 43, status: 'inactive' },
];

export const studies: Study[] = [
  {
    id: 'ST-001',
    name: 'Diabetes Treatment Study',
    description: 'A Phase III randomized controlled trial evaluating a novel GLP-1 receptor agonist for long-term glycemic control in adults with Type 2 Diabetes.',
    condition: 'Type 2 Diabetes',
    sponsor: 'PharmaCo Research',
    researchSite: 'City Hospital, Chennai',
    startDate: '2026-06-01',
    endDate: '2027-06-01',
    targetParticipants: 120,
    enrolledParticipants: 92,
    status: 'active',
    phase: 'Phase III',
    principalInvestigator: 'Dr. James Patel',
    anatomy: 'Pancreas',
    anatomyDescription: 'This study investigates treatment related to pancreatic function, specifically insulin production and glucose regulation.',
    eligibilityCriteria: [
      { id: 'c1', field: 'Age', operator: 'between', value: '30-65', category: 'inclusion' },
      { id: 'c2', field: 'Condition', operator: 'equals', value: 'Type 2 Diabetes', category: 'inclusion' },
      { id: 'c3', field: 'HbA1c', operator: '>=', value: '7.0', category: 'inclusion' },
      { id: 'c4', field: 'BMI', operator: '<=', value: '40', category: 'inclusion' },
      { id: 'c5', field: 'Insulin therapy', operator: 'equals', value: 'Not on insulin', category: 'exclusion' },
      { id: 'c6', field: 'Pregnancy', operator: 'equals', value: 'Not pregnant', category: 'exclusion' },
    ],
  },
  {
    id: 'ST-002',
    name: 'Cardiac Health Study',
    description: 'A Phase II trial assessing the efficacy of a combined statin and antiplatelet therapy regimen for reducing cardiovascular events in high-risk patients.',
    condition: 'Cardiovascular Disease',
    sponsor: 'MedHeart Inc.',
    researchSite: 'Sunshine Medical Center, Mumbai',
    startDate: '2026-04-15',
    endDate: '2027-04-15',
    targetParticipants: 80,
    enrolledParticipants: 59,
    status: 'recruiting',
    phase: 'Phase II',
    principalInvestigator: 'Dr. Anita Sharma',
    anatomy: 'Heart',
    anatomyDescription: 'This study focuses on cardiovascular health, examining how combined therapy affects heart function and blood vessel health.',
    eligibilityCriteria: [
      { id: 'c1', field: 'Age', operator: '>=', value: '45', category: 'inclusion' },
      { id: 'c2', field: 'Condition', operator: 'equals', value: 'Cardiovascular Disease', category: 'inclusion' },
      { id: 'c3', field: 'Blood Pressure', operator: '>=', value: '140/90', category: 'inclusion' },
      { id: 'c4', field: 'Previous cardiac event', operator: 'equals', value: 'At least one', category: 'inclusion' },
    ],
  },
  {
    id: 'ST-003',
    name: 'Oncology Research Study',
    description: 'A Phase I/II dose-escalation study of a novel immunotherapy combination for patients with advanced solid tumors.',
    condition: 'Solid Tumors',
    sponsor: 'OncoTherapeutics',
    researchSite: 'Metro Care Research, Bangalore',
    startDate: '2026-07-01',
    endDate: '2028-01-01',
    targetParticipants: 60,
    enrolledParticipants: 38,
    status: 'screening',
    phase: 'Phase I/II',
    principalInvestigator: 'Dr. Vikram Reddy',
    anatomy: 'Immune System',
    anatomyDescription: 'This study investigates immunotherapy approaches that harness the bodys own immune system to target cancer cells.',
    eligibilityCriteria: [
      { id: 'c1', field: 'Age', operator: '>=', value: '18', category: 'inclusion' },
      { id: 'c2', field: 'Condition', operator: 'equals', value: 'Advanced solid tumor', category: 'inclusion' },
      { id: 'c3', field: 'ECOG status', operator: '<=', value: '2', category: 'inclusion' },
      { id: 'c4', field: 'Prior chemotherapy', operator: '>=', value: '1 line', category: 'inclusion' },
    ],
  },
  {
    id: 'ST-004',
    name: 'Neurology Research Trial',
    description: 'A Phase II trial evaluating a novel neuroprotective agent for patients with early-stage Parkinsons disease.',
    condition: 'Parkinsons Disease',
    sponsor: 'NeuroGen Labs',
    researchSite: 'Global Health University, Delhi',
    startDate: '2026-05-20',
    endDate: '2027-11-20',
    targetParticipants: 100,
    enrolledParticipants: 48,
    status: 'recruiting',
    phase: 'Phase II',
    principalInvestigator: 'Dr. Priya Nair',
    anatomy: 'Brain',
    anatomyDescription: 'This study examines neuroprotective therapies targeting dopamine-producing neurons in the brain affected by Parkinsons disease.',
    eligibilityCriteria: [
      { id: 'c1', field: 'Age', operator: 'between', value: '50-80', category: 'inclusion' },
      { id: 'c2', field: 'Condition', operator: 'equals', value: 'Early Parkinsons', category: 'inclusion' },
      { id: 'c3', field: 'Disease duration', operator: '<=', value: '5 years', category: 'inclusion' },
    ],
  },
];

const defaultScreeningResults: ScreeningResult[] = [
  { criterionId: 'c1', criterionLabel: 'Age', status: 'match', detail: 'Age 42 — within range 30-65' },
  { criterionId: 'c2', criterionLabel: 'Condition', status: 'match', detail: 'Type 2 Diabetes — confirmed diagnosis' },
  { criterionId: 'c3', criterionLabel: 'HbA1c', status: 'match', detail: 'HbA1c 8.2% — meets minimum of 7.0%' },
  { criterionId: 'c4', criterionLabel: 'BMI', status: 'match', detail: 'BMI 28.4 — within limit of 40' },
  { criterionId: 'c5', criterionLabel: 'Medication history', status: 'review', detail: 'On metformin — insulin therapy exclusion requires verification' },
];

export const participants: Participant[] = [
  { id: 'P00124', name: 'Rahul Mehta', age: 42, gender: 'Male', email: 'rahul.mehta@email.com', phone: '+91 98765 43210', location: 'Chennai', studyId: 'ST-001', studyName: 'Diabetes Treatment Study', screeningStatus: 'approved', consentStatus: 'consented', enrollmentStatus: 'enrolled', lastActivity: '2026-09-09', enrolledDate: '2026-08-15', aiConfidence: 87, screeningResults: defaultScreeningResults, screeningReviewed: true, screeningReviewedBy: 'Dr. James Patel', screeningReviewedDate: '2026-08-10', screeningNotes: 'Patient meets all primary criteria. Medication history verified - not on insulin.' },
  { id: 'P99811', name: 'Aisha Khan', age: 52, gender: 'Female', email: 'aisha.khan@email.com', phone: '+91 98123 45678', location: 'Mumbai', studyId: 'ST-002', studyName: 'Cardiac Health Study', screeningStatus: 'human_review', consentStatus: 'viewed', enrollmentStatus: 'not_enrolled', lastActivity: '2026-09-08', aiConfidence: 78, screeningResults: [
    { criterionId: 'c1', criterionLabel: 'Age', status: 'match', detail: 'Age 52 — meets minimum of 45' },
    { criterionId: 'c2', criterionLabel: 'Condition', status: 'match', detail: 'Cardiovascular Disease — confirmed' },
    { criterionId: 'c3', criterionLabel: 'Blood Pressure', status: 'match', detail: 'BP 148/92 — meets threshold' },
    { criterionId: 'c4', criterionLabel: 'Previous cardiac event', status: 'review', detail: 'History of mild angina — requires cardiologist verification' },
  ], screeningReviewed: false },
  { id: 'P77821', name: 'Karthik S', age: 61, gender: 'Male', email: 'karthik.s@email.com', phone: '+91 97000 12345', location: 'Bangalore', studyId: 'ST-003', studyName: 'Oncology Research Study', screeningStatus: 'potentially_eligible', consentStatus: 'sent', enrollmentStatus: 'not_enrolled', lastActivity: '2026-09-09', aiConfidence: 82, screeningResults: [
    { criterionId: 'c1', criterionLabel: 'Age', status: 'match', detail: 'Age 61 — meets minimum of 18' },
    { criterionId: 'c2', criterionLabel: 'Condition', status: 'match', detail: 'Advanced solid tumor — confirmed (lung)' },
    { criterionId: 'c3', criterionLabel: 'ECOG status', status: 'match', detail: 'ECOG 1 — within limit of 2' },
    { criterionId: 'c4', criterionLabel: 'Prior chemotherapy', status: 'match', detail: '1 prior line — meets requirement' },
  ], screeningReviewed: false },
  { id: 'P44567', name: 'Priya Nair', age: 58, gender: 'Female', email: 'priya.nair@email.com', phone: '+91 96543 21098', location: 'Delhi', studyId: 'ST-004', studyName: 'Neurology Research Trial', screeningStatus: 'screening', consentStatus: 'not_started', enrollmentStatus: 'not_enrolled', lastActivity: '2026-09-07', aiConfidence: 71, screeningResults: [
    { criterionId: 'c1', criterionLabel: 'Age', status: 'match', detail: 'Age 58 — within range 50-80' },
    { criterionId: 'c2', criterionLabel: 'Condition', status: 'match', detail: 'Early Parkinsons — confirmed diagnosis' },
    { criterionId: 'c3', criterionLabel: 'Disease duration', status: 'review', detail: 'Diagnosed 4 years ago — within 5 year limit but approaching threshold' },
  ], screeningReviewed: false },
  { id: 'P33210', name: 'Arjun Verma', age: 35, gender: 'Male', email: 'arjun.verma@email.com', phone: '+91 95432 10987', location: 'Chennai', studyId: 'ST-001', studyName: 'Diabetes Treatment Study', screeningStatus: 'candidate', consentStatus: 'not_started', enrollmentStatus: 'not_enrolled', lastActivity: '2026-09-06' },
  { id: 'P55201', name: 'Deepa Raj', age: 47, gender: 'Female', email: 'deepa.raj@email.com', phone: '+91 94321 87654', location: 'Mumbai', studyId: 'ST-002', studyName: 'Cardiac Health Study', screeningStatus: 'approved', consentStatus: 'consented', enrollmentStatus: 'enrolled', lastActivity: '2026-09-05', enrolledDate: '2026-07-20', aiConfidence: 91, screeningReviewed: true, screeningReviewedBy: 'Dr. Anita Sharma', screeningReviewedDate: '2026-07-15' },
  { id: 'P66302', name: 'Sanjay Gupta', age: 55, gender: 'Male', email: 'sanjay.gupta@email.com', phone: '+91 93210 76543', location: 'Bangalore', studyId: 'ST-003', studyName: 'Oncology Research Study', screeningStatus: 'approved', consentStatus: 'pending', enrollmentStatus: 'not_enrolled', lastActivity: '2026-09-08', aiConfidence: 85, screeningReviewed: true, screeningReviewedBy: 'Dr. Vikram Reddy', screeningReviewedDate: '2026-09-05' },
  { id: 'P77403', name: 'Lakshmi Iyer', age: 63, gender: 'Female', email: 'lakshmi.iyer@email.com', phone: '+91 92109 65432', location: 'Delhi', studyId: 'ST-004', studyName: 'Neurology Research Trial', screeningStatus: 'rejected', consentStatus: 'not_started', enrollmentStatus: 'not_enrolled', lastActivity: '2026-09-04', aiConfidence: 42, screeningReviewed: true, screeningReviewedBy: 'Dr. Priya Nair', screeningReviewedDate: '2026-09-01', screeningNotes: 'Disease duration exceeds 5-year limit. Does not meet inclusion criteria.' },
  { id: 'P88504', name: 'Vikram Singh', age: 39, gender: 'Male', email: 'vikram.singh@email.com', phone: '+91 91098 54321', location: 'Chennai', studyId: 'ST-001', studyName: 'Diabetes Treatment Study', screeningStatus: 'potentially_eligible', consentStatus: 'not_started', enrollmentStatus: 'not_enrolled', lastActivity: '2026-09-09', aiConfidence: 79, screeningReviewed: false, screeningResults: [
    { criterionId: 'c1', criterionLabel: 'Age', status: 'match', detail: 'Age 39 — within range 30-65' },
    { criterionId: 'c2', criterionLabel: 'Condition', status: 'match', detail: 'Type 2 Diabetes — confirmed' },
    { criterionId: 'c3', criterionLabel: 'HbA1c', status: 'match', detail: 'HbA1c 7.8% — meets minimum' },
    { criterionId: 'c4', criterionLabel: 'BMI', status: 'review', detail: 'BMI 41.2 — slightly exceeds limit of 40' },
  ]},
  { id: 'P99605', name: 'Meera Krishnan', age: 44, gender: 'Female', email: 'meera.k@email.com', phone: '+91 90087 43210', location: 'Mumbai', studyId: 'ST-002', studyName: 'Cardiac Health Study', screeningStatus: 'screening', consentStatus: 'not_started', enrollmentStatus: 'not_enrolled', lastActivity: '2026-09-03' },
];

export const visits: Visit[] = [
  { id: 'v1', participantId: 'P00124', participantName: 'Rahul Mehta', studyId: 'ST-001', studyName: 'Diabetes Treatment Study', date: '2026-09-15', time: '10:00 AM', location: 'City Hospital, Chennai', coordinator: 'Maya Rodriguez', type: 'Visit 1', status: 'scheduled' },
  { id: 'v2', participantId: 'P55201', participantName: 'Deepa Raj', studyId: 'ST-002', studyName: 'Cardiac Health Study', date: '2026-09-12', time: '2:30 PM', location: 'Sunshine Medical Center, Mumbai', coordinator: 'Maya Rodriguez', type: 'Follow-up', status: 'scheduled' },
  { id: 'v3', participantId: 'P00124', participantName: 'Rahul Mehta', studyId: 'ST-001', studyName: 'Diabetes Treatment Study', date: '2026-09-10', time: '8:00 AM', location: 'City Hospital, Chennai', coordinator: 'Maya Rodriguez', type: 'Screening', status: 'scheduled' },
  { id: 'v4', participantId: 'P55201', participantName: 'Deepa Raj', studyId: 'ST-002', studyName: 'Cardiac Health Study', date: '2026-09-10', time: '11:00 AM', location: 'Sunshine Medical Center, Mumbai', coordinator: 'Maya Rodriguez', type: 'Visit 2', status: 'completed' },
  { id: 'v5', participantId: 'P00124', participantName: 'Rahul Mehta', studyId: 'ST-001', studyName: 'Diabetes Treatment Study', date: '2026-08-15', time: '9:00 AM', location: 'City Hospital, Chennai', coordinator: 'Maya Rodriguez', type: 'Screening', status: 'completed' },
  { id: 'v6', participantId: 'P66302', participantName: 'Sanjay Gupta', studyId: 'ST-003', studyName: 'Oncology Research Study', date: '2026-09-20', time: '3:00 PM', location: 'Metro Care Research, Bangalore', coordinator: 'Maya Rodriguez', type: 'Visit 1', status: 'scheduled' },
  { id: 'v7', participantId: 'P55201', participantName: 'Deepa Raj', studyId: 'ST-002', studyName: 'Cardiac Health Study', date: '2026-09-25', time: '10:30 AM', location: 'Sunshine Medical Center, Mumbai', coordinator: 'Maya Rodriguez', type: 'Final Visit', status: 'scheduled' },
];

export const tasks: Task[] = [
  { id: 't1', title: 'Review eligibility', type: 'eligibility_review', participantId: 'P88504', participantName: 'Vikram Singh', studyId: 'ST-001', studyName: 'Diabetes Treatment Study', dueDate: '2026-09-10', dueTime: '10:00 AM', priority: 'high', status: 'pending', assignee: 'Dr. James Patel' },
  { id: 't2', title: 'Follow-up call', type: 'participant_followup', participantId: 'P99811', participantName: 'Aisha Khan', studyId: 'ST-002', studyName: 'Cardiac Health Study', dueDate: '2026-09-10', dueTime: '11:30 AM', priority: 'medium', status: 'pending', assignee: 'Maya Rodriguez' },
  { id: 't3', title: 'Consent document pending', type: 'consent_review', participantId: 'P77821', participantName: 'Karthik S', studyId: 'ST-003', studyName: 'Oncology Research Study', dueDate: '2026-09-10', dueTime: '2:00 PM', priority: 'medium', status: 'pending', assignee: 'Maya Rodriguez' },
  { id: 't4', title: 'Visit preparation', type: 'visit_preparation', participantId: 'P00124', participantName: 'Rahul Mehta', studyId: 'ST-001', studyName: 'Diabetes Treatment Study', dueDate: '2026-09-12', dueTime: '9:00 AM', priority: 'high', status: 'in_progress', assignee: 'Maya Rodriguez' },
  { id: 't5', title: 'Document review', type: 'document_review', studyId: 'ST-002', studyName: 'Cardiac Health Study', dueDate: '2026-09-08', dueTime: '4:00 PM', priority: 'low', status: 'overdue', assignee: 'Dr. Anita Sharma' },
  { id: 't6', title: 'Data verification', type: 'data_verification', participantId: 'P55201', participantName: 'Deepa Raj', studyId: 'ST-002', studyName: 'Cardiac Health Study', dueDate: '2026-09-09', dueTime: '3:00 PM', priority: 'medium', status: 'completed', assignee: 'Maya Rodriguez' },
  { id: 't7', title: 'Review eligibility', type: 'eligibility_review', participantId: 'P44567', participantName: 'Priya Nair', studyId: 'ST-004', studyName: 'Neurology Research Trial', dueDate: '2026-09-11', dueTime: '10:00 AM', priority: 'medium', status: 'pending', assignee: 'Dr. Priya Nair' },
  { id: 't8', title: 'Participant follow-up', type: 'participant_followup', participantId: 'P99605', participantName: 'Meera Krishnan', studyId: 'ST-002', studyName: 'Cardiac Health Study', dueDate: '2026-09-14', dueTime: '1:00 PM', priority: 'low', status: 'pending', assignee: 'Maya Rodriguez' },
];

export const consentRecords: ConsentRecord[] = [
  { id: 'cr1', participantId: 'P00124', participantName: 'Rahul Mehta', studyId: 'ST-001', studyName: 'Diabetes Treatment Study', consentVersion: 'v2.1', dateSent: '2026-08-08', dateViewed: '2026-08-09', dateSigned: '2026-08-12', researcher: 'Dr. James Patel', status: 'consented' },
  { id: 'cr2', participantId: 'P99811', participantName: 'Aisha Khan', studyId: 'ST-002', studyName: 'Cardiac Health Study', consentVersion: 'v1.3', dateSent: '2026-09-01', dateViewed: '2026-09-03', researcher: 'Dr. Anita Sharma', status: 'viewed' },
  { id: 'cr3', participantId: 'P77821', participantName: 'Karthik S', studyId: 'ST-003', studyName: 'Oncology Research Study', consentVersion: 'v1.0', dateSent: '2026-09-05', researcher: 'Dr. Vikram Reddy', status: 'sent' },
  { id: 'cr4', participantId: 'P55201', participantName: 'Deepa Raj', studyId: 'ST-002', studyName: 'Cardiac Health Study', consentVersion: 'v1.3', dateSent: '2026-07-10', dateViewed: '2026-07-11', dateSigned: '2026-07-15', researcher: 'Dr. Anita Sharma', status: 'consented' },
  { id: 'cr5', participantId: 'P66302', participantName: 'Sanjay Gupta', studyId: 'ST-003', studyName: 'Oncology Research Study', consentVersion: 'v1.0', dateSent: '2026-09-02', dateViewed: '2026-09-03', researcher: 'Dr. Vikram Reddy', status: 'pending' },
  { id: 'cr6', participantId: 'P33210', participantName: 'Arjun Verma', studyId: 'ST-001', studyName: 'Diabetes Treatment Study', consentVersion: 'v2.1', researcher: 'Dr. James Patel', status: 'not_started' },
];

export const documents: Document[] = [
  { id: 'd1', name: 'Diabetes_Study_Protocol_v3.pdf', type: 'PDF', category: 'Study Protocol', studyId: 'ST-001', studyName: 'Diabetes Treatment Study', uploadedBy: 'Dr. James Patel', date: '2026-06-01', status: 'active', size: '2.4 MB' },
  { id: 'd2', name: 'Consent_Form_v2.1.pdf', type: 'PDF', category: 'Consent Forms', studyId: 'ST-001', studyName: 'Diabetes Treatment Study', uploadedBy: 'Maya Rodriguez', date: '2026-06-05', status: 'active', size: '1.1 MB' },
  { id: 'd3', name: 'P00124_Lab_Results.pdf', type: 'PDF', category: 'Lab Reports', studyId: 'ST-001', studyName: 'Diabetes Treatment Study', participantId: 'P00124', participantName: 'Rahul Mehta', uploadedBy: 'Maya Rodriguez', date: '2026-08-14', status: 'active', size: '0.8 MB' },
  { id: 'd4', name: 'Cardiac_Study_Summary.docx', type: 'DOCX', category: 'Research Documents', studyId: 'ST-002', studyName: 'Cardiac Health Study', uploadedBy: 'Dr. Anita Sharma', date: '2026-04-20', status: 'active', size: '1.5 MB' },
  { id: 'd5', name: 'P77821_Medical_History.pdf', type: 'PDF', category: 'Participant Documents', studyId: 'ST-003', studyName: 'Oncology Research Study', participantId: 'P77821', participantName: 'Karthik S', uploadedBy: 'Maya Rodriguez', date: '2026-09-05', status: 'pending', size: '1.2 MB' },
  { id: 'd6', name: 'Oncology_Trial_Protocol.pdf', type: 'PDF', category: 'Study Protocol', studyId: 'ST-003', studyName: 'Oncology Research Study', uploadedBy: 'Dr. Vikram Reddy', date: '2026-07-01', status: 'active', size: '3.2 MB' },
  { id: 'd7', name: 'Neurology_Consent_v1.2.pdf', type: 'PDF', category: 'Consent Forms', studyId: 'ST-004', studyName: 'Neurology Research Trial', uploadedBy: 'Dr. Priya Nair', date: '2026-05-25', status: 'active', size: '0.9 MB' },
  { id: 'd8', name: 'P55201_ECG_Report.pdf', type: 'PDF', category: 'Lab Reports', studyId: 'ST-002', studyName: 'Cardiac Health Study', participantId: 'P55201', participantName: 'Deepa Raj', uploadedBy: 'Maya Rodriguez', date: '2026-08-20', status: 'active', size: '0.5 MB' },
];

export const messages: Message[] = [
  { id: 'm1', from: 'Dr. James Patel', fromRole: 'PRINCIPAL_INVESTIGATOR', to: 'Maya Rodriguez', toRole: 'RESEARCH_COORDINATOR', subject: 'P00124 Screening Approved', preview: 'I have approved the screening for Rahul Mehta. Please proceed with consent...', body: 'I have approved the screening for Rahul Mehta (P00124). Please proceed with consent scheduling at your earliest convenience. The AI screening results look solid, and I have verified the medication history.', date: '2026-09-09', time: '9:30 AM', read: false, type: 'eligibility_review' },
  { id: 'm2', from: 'System', fromRole: 'PLATFORM_ADMIN', to: 'Maya Rodriguez', toRole: 'RESEARCH_COORDINATOR', subject: 'Visit Reminder: P00124', preview: 'Reminder: Screening visit for Rahul Mehta scheduled for Sep 10 at 8:00 AM...', body: 'This is an automated reminder. A screening visit for Rahul Mehta (P00124) is scheduled for September 10, 2026 at 8:00 AM at City Hospital, Chennai. Please ensure all pre-visit preparations are completed.', date: '2026-09-09', time: '8:00 AM', read: false, type: 'visit_reminder' },
  { id: 'm3', from: 'Maya Rodriguez', fromRole: 'RESEARCH_COORDINATOR', to: 'Rahul Mehta', toRole: 'PARTICIPANT', subject: 'Consent Document Ready for Review', preview: 'Your consent document for the Diabetes Treatment Study is ready for review...', body: 'Dear Rahul, your consent document for the Diabetes Treatment Study is now ready for your review. Please log in to your participant portal to review and sign the document at your convenience. If you have any questions, please do not hesitate to reach out.', date: '2026-09-08', time: '3:00 PM', read: true, type: 'consent_reminder' },
  { id: 'm4', from: 'Dr. Vikram Reddy', fromRole: 'PRINCIPAL_INVESTIGATOR', to: 'Maya Rodriguez', toRole: 'RESEARCH_COORDINATOR', subject: 'New Task: Document Review', preview: 'Please review the updated protocol document for the Oncology Research Study...', body: 'Please review the updated protocol document for the Oncology Research Study. There are some changes to the inclusion criteria that need to be verified before our next screening cycle.', date: '2026-09-07', time: '2:15 PM', read: true, type: 'task_assignment' },
  { id: 'm5', from: 'Michael Torres', fromRole: 'ORGANIZATION', to: 'Dr. James Patel', toRole: 'PRINCIPAL_INVESTIGATOR', subject: 'Quarterly Study Update', preview: 'Sponsor review scheduled for next week. Please prepare enrollment statistics...', body: 'Dear Dr. Patel, our quarterly sponsor review is scheduled for next week. Please prepare the current enrollment statistics and any adverse event reports for the Diabetes Treatment Study. Thank you for your continued work on this important trial.', date: '2026-09-06', time: '11:00 AM', read: true, type: 'study_update' },
];

export const auditLogs: AuditLog[] = [
  { id: 'al1', action: 'New study created', user: 'Dr. James Patel', userRole: 'PRINCIPAL_INVESTIGATOR', target: 'Diabetes Treatment Study', timestamp: '2026-09-09 14:32', category: 'study' },
  { id: 'al2', action: 'Research coordinator added', user: 'Sarah Chen', userRole: 'PLATFORM_ADMIN', target: 'Maya Rodriguez', timestamp: '2026-09-09 11:15', category: 'system' },
  { id: 'al3', action: 'Participant enrolled', user: 'Dr. James Patel', userRole: 'PRINCIPAL_INVESTIGATOR', target: 'P00124 Rahul Mehta', timestamp: '2026-09-08 16:45', category: 'participant' },
  { id: 'al4', action: 'Consent document uploaded', user: 'Maya Rodriguez', userRole: 'RESEARCH_COORDINATOR', target: 'Consent_Form_v2.1.pdf', timestamp: '2026-09-08 10:20', category: 'document' },
  { id: 'al5', action: 'Study updated', user: 'Dr. Anita Sharma', userRole: 'PRINCIPAL_INVESTIGATOR', target: 'Cardiac Health Study', timestamp: '2026-09-07 15:30', category: 'study' },
  { id: 'al6', action: 'Screening approved', user: 'Dr. Vikram Reddy', userRole: 'PRINCIPAL_INVESTIGATOR', target: 'P66302 Sanjay Gupta', timestamp: '2026-09-05 13:00', category: 'screening' },
  { id: 'al7', action: 'Participant screening rejected', user: 'Dr. Priya Nair', userRole: 'PRINCIPAL_INVESTIGATOR', target: 'P77403 Lakshmi Iyer', timestamp: '2026-09-01 10:45', category: 'screening' },
  { id: 'al8', action: 'Consent signed', user: 'Maya Rodriguez', userRole: 'RESEARCH_COORDINATOR', target: 'P55201 Deepa Raj', timestamp: '2026-08-20 09:15', category: 'consent' },
];

export const recentActivity: Activity[] = [
  { id: 'a1', action: 'New study created', user: 'Dr. James Patel', target: 'Neurology Research Trial', timestamp: '2 hours ago', type: 'study' },
  { id: 'a2', action: 'Research coordinator added', user: 'Sarah Chen', target: 'Maya Rodriguez', timestamp: '5 hours ago', type: 'participant' },
  { id: 'a3', action: 'Participant enrolled', user: 'Dr. James Patel', target: 'P00124 Rahul Mehta', timestamp: '8 hours ago', type: 'participant' },
  { id: 'a4', action: 'Consent document uploaded', user: 'Maya Rodriguez', target: 'Consent_Form_v2.1.pdf', timestamp: '1 day ago', type: 'consent' },
  { id: 'a5', action: 'Study updated', user: 'Dr. Anita Sharma', target: 'Cardiac Health Study', timestamp: '2 days ago', type: 'study' },
  { id: 'a6', action: 'AI screening completed', user: 'System', target: 'P88504 Vikram Singh', timestamp: '2 days ago', type: 'screening' },
];

export const userGrowthData = [
  { month: 'Mar', users: 120, participants: 340 },
  { month: 'Apr', users: 145, participants: 410 },
  { month: 'May', users: 178, participants: 498 },
  { month: 'Jun', users: 210, participants: 587 },
  { month: 'Jul', users: 245, participants: 672 },
  { month: 'Aug', users: 289, participants: 754 },
  { month: 'Sep', users: 312, participants: 821 },
];

export const enrollmentTrendData = [
  { month: 'Mar', enrolled: 45, target: 60 },
  { month: 'Apr', enrolled: 62, target: 80 },
  { month: 'May', enrolled: 78, target: 100 },
  { month: 'Jun', enrolled: 95, target: 120 },
  { month: 'Jul', enrolled: 110, target: 140 },
  { month: 'Aug', enrolled: 125, target: 160 },
  { month: 'Sep', enrolled: 137, target: 180 },
];

export const recruitmentFunnelData = [
  { stage: 'Candidates', count: 420, fill: '#DBEAFE' },
  { stage: 'Screening', count: 285, fill: '#BFDBFE' },
  { stage: 'Potentially Eligible', count: 168, fill: '#93C5FD' },
  { stage: 'Human Review', count: 92, fill: '#60A5FA' },
  { stage: 'Consented', count: 64, fill: '#3B82F6' },
  { stage: 'Enrolled', count: 48, fill: '#2563EB' },
];

export const sitePerformanceData = [
  { site: 'City Hospital', rate: 92, participants: 124 },
  { site: 'Sunshine Medical', rate: 78, participants: 87 },
  { site: 'Metro Care', rate: 74, participants: 65 },
  { site: 'Global Health', rate: 61, participants: 198 },
  { site: 'LifeCare Hospital', rate: 48, participants: 43 },
];

export const trialPerformanceData = [
  { trial: 'Trial A (Diabetes)', enrolled: 92, target: 120 },
  { trial: 'Trial B (Cardiac)', enrolled: 59, target: 80 },
  { trial: 'Trial C (Oncology)', enrolled: 38, target: 60 },
  { trial: 'Trial D (Neurology)', enrolled: 48, target: 100 },
];

export const studyPerformanceData = [
  { study: 'Diabetes Treatment', progress: 92 },
  { study: 'Cardiac Health', progress: 74 },
  { study: 'Oncology Research', progress: 63 },
  { study: 'Neurology Trial', progress: 48 },
];



export const consentConversionData = [
  { month: 'Apr', sent: 18, signed: 12 },
  { month: 'May', sent: 22, signed: 16 },
  { month: 'Jun', sent: 28, signed: 20 },
  { month: 'Jul', sent: 31, signed: 24 },
  { month: 'Aug', sent: 35, signed: 28 },
  { month: 'Sep', sent: 29, signed: 23 },
];

export const retentionData = [
  { month: 'Month 1', retained: 100 },
  { month: 'Month 2', retained: 96 },
  { month: 'Month 3', retained: 92 },
  { month: 'Month 4', retained: 88 },
  { month: 'Month 5', retained: 85 },
  { month: 'Month 6', retained: 81 },
];

export const recruitmentTrendData = [
  { week: 'W1', candidates: 32, enrolled: 4 },
  { week: 'W2', candidates: 45, enrolled: 6 },
  { week: 'W3', candidates: 38, enrolled: 5 },
  { week: 'W4', candidates: 52, enrolled: 8 },
  { week: 'W5', candidates: 48, enrolled: 7 },
  { week: 'W6', candidates: 61, enrolled: 9 },
  { week: 'W7', candidates: 55, enrolled: 8 },
  { week: 'W8', candidates: 67, enrolled: 11 },
];

export const anatomyData: Record<string, { organ: string; description: string; structures: { name: string; description: string; relevant: boolean }[] }> = {
  Pancreas: {
    organ: 'Pancreas',
    description: 'The pancreas is an organ behind the stomach that produces insulin and digestive enzymes. In Type 2 Diabetes, the pancreas may not produce enough insulin or the body becomes resistant to it.',
    structures: [
      { name: 'Pancreatic Head', description: 'The rightmost portion of the pancreas, nestled in the curve of the duodenum.', relevant: true },
      { name: 'Pancreatic Body', description: 'The central part of the pancreas where most insulin-producing islets are located.', relevant: true },
      { name: 'Pancreatic Tail', description: 'The leftmost tapering end of the pancreas, extending toward the spleen.', relevant: false },
      { name: 'Islets of Langerhans', description: 'Clusters of cells that produce insulin and glucagon, critical for blood sugar regulation.', relevant: true },
      { name: 'Pancreatic Duct', description: 'Tube carrying digestive enzymes to the small intestine.', relevant: false },
    ],
  },
  Heart: {
    organ: 'Heart',
    description: 'The heart is a muscular organ that pumps blood throughout the body. In cardiovascular disease, the blood vessels supplying the heart can become narrowed or blocked.',
    structures: [
      { name: 'Left Ventricle', description: 'The main pumping chamber that sends oxygenated blood to the body.', relevant: true },
      { name: 'Right Ventricle', description: 'Pumps deoxygenated blood to the lungs.', relevant: false },
      { name: 'Coronary Arteries', description: 'Blood vessels supplying the heart muscle itself. Blockages here cause heart attacks.', relevant: true },
      { name: 'Aorta', description: 'The largest artery, carrying blood from the heart to the rest of the body.', relevant: true },
      { name: 'Atria', description: 'The upper chambers that receive blood returning to the heart.', relevant: false },
    ],
  },
  'Immune System': {
    organ: 'Immune System',
    description: 'The immune system is the bodys defense against disease. Immunotherapy works by helping the immune system recognize and attack cancer cells.',
    structures: [
      { name: 'T-Cells', description: 'White blood cells that identify and destroy infected or cancerous cells.', relevant: true },
      { name: 'B-Cells', description: 'Cells that produce antibodies to fight infections.', relevant: true },
      { name: 'Lymph Nodes', description: 'Small glands that filter harmful substances and house immune cells.', relevant: false },
      { name: 'Bone Marrow', description: 'Tissue inside bones where blood cells, including immune cells, are made.', relevant: false },
      { name: 'PD-1/PD-L1 Pathway', description: 'A checkpoint that cancer cells exploit to hide from T-cells. Targeted by immunotherapy.', relevant: true },
    ],
  },
  Brain: {
    organ: 'Brain',
    description: 'The brain is the control center of the body. In Parkinsons disease, dopamine-producing neurons in a specific region gradually degenerate.',
    structures: [
      { name: 'Substantia Nigra', description: 'A region in the midbrain where dopamine-producing neurons are lost in Parkinsons.', relevant: true },
      { name: 'Cerebral Cortex', description: 'The outer layer responsible for thinking, movement, and perception.', relevant: false },
      { name: 'Basal Ganglia', description: 'Structures involved in movement control, affected in Parkinsons disease.', relevant: true },
      { name: 'Hippocampus', description: 'Area involved in memory formation.', relevant: false },
      { name: 'Corpus Callosum', description: 'Bundle of nerve fibers connecting the two brain hemispheres.', relevant: false },
    ],
  },
};
