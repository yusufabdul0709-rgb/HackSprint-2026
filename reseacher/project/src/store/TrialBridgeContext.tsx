import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
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
import { useAuth } from './AuthContext';
import api from '@/lib/api';
import {
  studies as mockStudies,
  participants as mockParticipants,
  visits as mockVisits,
  tasks as mockTasks,
  consentRecords as mockConsentRecords,
  documents as mockDocuments,
  messages as mockMessages,
} from '@/data/mockData';

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
  const { role, isAuthenticated } = useAuth();
  
  const [studies, setStudies] = useState<Study[]>(mockStudies);
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [visits, setVisits] = useState<Visit[]>(mockVisits);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>(mockConsentRecords);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const fetchInitialData = async () => {
    if (!isAuthenticated) return;
    try {
      const [
        studiesRes,
        participantsRes,
        visitsRes,
        tasksRes,
        consentRes,
        documentsRes,
        messagesRes
      ] = await Promise.all([
        api.get('/studies/').catch(() => ({ data: [] })),
        api.get('/participants/').catch(() => ({ data: [] })),
        api.get('/visits/').catch(() => ({ data: [] })),
        api.get('/tasks/').catch(() => ({ data: [] })),
        api.get('/consent-records/').catch(() => ({ data: [] })),
        api.get('/documents/').catch(() => ({ data: [] })),
        api.get('/messages/').catch(() => ({ data: [] }))
      ]);

      if (studiesRes.data && studiesRes.data.length > 0) setStudies(studiesRes.data);
      if (participantsRes.data && participantsRes.data.length > 0) setParticipants(participantsRes.data);
      if (visitsRes.data && visitsRes.data.length > 0) setVisits(visitsRes.data);
      if (tasksRes.data && tasksRes.data.length > 0) setTasks(tasksRes.data);
      if (consentRes.data && consentRes.data.length > 0) setConsentRecords(consentRes.data);
      if (documentsRes.data && documentsRes.data.length > 0) setDocuments(documentsRes.data);
      if (messagesRes.data && messagesRes.data.length > 0) setMessages(messagesRes.data);
    } catch (error) {
      console.error('Error fetching initial data', error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [isAuthenticated]);

  const addStudy = useCallback(async (study: Study) => {
    try {
      const res = await api.post('/studies', study);
      setStudies((prev) => [...prev, res.data]);
    } catch (e) {
      console.error(e);
      setStudies((prev) => [...prev, study]);
    }
  }, []);

  const approveScreening = useCallback(async (participantId: string, reviewerName: string, notes: string) => {
    try {
      await api.post(`/participants/${participantId}/approve-screening`, { reviewerName, notes });
      fetchInitialData();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const rejectScreening = useCallback(async (participantId: string, reviewerName: string, notes: string) => {
    try {
      await api.post(`/participants/${participantId}/reject-screening`, { reviewerName, notes });
      fetchInitialData();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const updateConsentStatus = useCallback(async (participantId: string, status: ConsentStatus) => {
    try {
      await api.patch(`/participants/${participantId}/consent`, { status });
      fetchInitialData();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const enrollParticipant = useCallback(async (participantId: string) => {
    try {
      await api.post(`/participants/${participantId}/enroll`);
      fetchInitialData();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const scheduleVisit = useCallback(async (visit: Visit) => {
    try {
      const res = await api.post('/visits', visit);
      setVisits((prev) => [...prev, res.data]);
    } catch (e) {
      console.error(e);
      setVisits((prev) => [...prev, visit]);
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, status: Task['status']) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    } catch (e) {
      console.error(e);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    }
  }, []);

  const markMessageRead = useCallback(async (messageId: string) => {
    try {
      await api.patch(`/messages/${messageId}/read`);
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, read: true } : m)));
    } catch (e) {
      console.error(e);
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, read: true } : m)));
    }
  }, []);

  return (
    <TrialBridgeContext.Provider
      value={{
        role,
        setRole: () => {}, // No-op, role comes from AuthContext
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
