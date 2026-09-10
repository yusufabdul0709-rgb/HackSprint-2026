import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  Study,
  Participant,
  Visit,
  Task,
  ConsentRecord,
  Document,
  Message,
  Role,
  ScreeningStatus,
  ConsentStatus,
  EnrollmentStatus,
} from '@/types';
import * as mockData from '@/data/mockData';

interface TrialBridgeContextType {
  role: Role;
  setRole: (role: Role) => void;
  studies: Study[];
  participants: Participant[];
  visits: Visit[];
  tasks: Task[];
  consentRecords: ConsentRecord[];
  documents: Document[];
  messages: Message[];
  addStudy: (study: Study) => void;
  approveScreening: (participantId: string, reviewerName: string, notes: string) => void;
  rejectScreening: (participantId: string, reviewerName: string, notes: string) => void;
  updateConsentStatus: (participantId: string, status: ConsentStatus) => void;
  enrollParticipant: (participantId: string) => void;
  scheduleVisit: (visit: Visit) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  markMessageRead: (messageId: string) => void;
}

const TrialBridgeContext = createContext<TrialBridgeContextType | null>(null);

export function TrialBridgeProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('admin');
  const [studies, setStudies] = useState<Study[]>(mockData.studies);
  const [participants, setParticipants] = useState<Participant[]>(mockData.participants);
  const [visits, setVisits] = useState<Visit[]>(mockData.visits);
  const [tasks, setTasks] = useState<Task[]>(mockData.tasks);
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>(mockData.consentRecords);
  const [documents, setDocuments] = useState<Document[]>(mockData.documents);
  const [messages, setMessages] = useState<Message[]>(mockData.messages);

  const addStudy = useCallback((study: Study) => {
    setStudies((prev) => [...prev, study]);
  }, []);

  const approveScreening = useCallback((participantId: string, reviewerName: string, notes: string) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              screeningStatus: 'approved' as ScreeningStatus,
              screeningReviewed: true,
              screeningReviewedBy: reviewerName,
              screeningReviewedDate: new Date().toISOString().split('T')[0],
              screeningNotes: notes,
              consentStatus: 'sent' as ConsentStatus,
              lastActivity: new Date().toISOString().split('T')[0],
            }
          : p
      )
    );
    setConsentRecords((prev) => {
      const participant = participants.find((p) => p.id === participantId);
      if (!participant) return prev;
      const exists = prev.find((c) => c.participantId === participantId && c.studyId === participant.studyId);
      if (exists) return prev;
      return [
        ...prev,
        {
          id: `cr-${Date.now()}`,
          participantId,
          participantName: participant.name,
          studyId: participant.studyId,
          studyName: participant.studyName,
          consentVersion: 'v1.0',
          dateSent: new Date().toISOString().split('T')[0],
          researcher: reviewerName,
          status: 'sent' as ConsentStatus,
        },
      ];
    });
  }, [participants]);

  const rejectScreening = useCallback((participantId: string, reviewerName: string, notes: string) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              screeningStatus: 'rejected' as ScreeningStatus,
              screeningReviewed: true,
              screeningReviewedBy: reviewerName,
              screeningReviewedDate: new Date().toISOString().split('T')[0],
              screeningNotes: notes,
              lastActivity: new Date().toISOString().split('T')[0],
            }
          : p
      )
    );
  }, []);

  const updateConsentStatus = useCallback((participantId: string, status: ConsentStatus) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, consentStatus: status, lastActivity: new Date().toISOString().split('T')[0] } : p))
    );
    setConsentRecords((prev) =>
      prev.map((c) => {
        if (c.participantId !== participantId) return c;
        const update: Partial<ConsentRecord> = { status };
        if (status === 'viewed' && !c.dateViewed) update.dateViewed = new Date().toISOString().split('T')[0];
        if (status === 'consented') update.dateSigned = new Date().toISOString().split('T')[0];
        return { ...c, ...update };
      })
    );
  }, []);

  const enrollParticipant = useCallback((participantId: string) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              enrollmentStatus: 'enrolled' as EnrollmentStatus,
              enrolledDate: new Date().toISOString().split('T')[0],
              lastActivity: new Date().toISOString().split('T')[0],
            }
          : p
      )
    );
    setStudies((prev) =>
      prev.map((s) => {
        const participant = participants.find((p) => p.id === participantId);
        if (!participant || participant.studyId !== s.id) return s;
        return { ...s, enrolledParticipants: s.enrolledParticipants + 1 };
      })
    );
  }, [participants]);

  const scheduleVisit = useCallback((visit: Visit) => {
    setVisits((prev) => [...prev, visit]);
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: Task['status']) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
  }, []);

  const markMessageRead = useCallback((messageId: string) => {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, read: true } : m)));
  }, []);

  return (
    <TrialBridgeContext.Provider
      value={{
        role,
        setRole,
        studies,
        participants,
        visits,
        tasks,
        consentRecords,
        documents,
        messages,
        addStudy,
        approveScreening,
        rejectScreening,
        updateConsentStatus,
        enrollParticipant,
        scheduleVisit,
        updateTaskStatus,
        markMessageRead,
      }}
    >
      {children}
    </TrialBridgeContext.Provider>
  );
}

export function useTrialBridge() {
  const ctx = useContext(TrialBridgeContext);
  if (!ctx) throw new Error('useTrialBridge must be used within TrialBridgeProvider');
  return ctx;
}
