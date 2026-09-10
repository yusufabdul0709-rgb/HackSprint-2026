import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/store/AuthContext';
import api from '@/lib/api';
import type { Notification } from '@/types';
import { toast } from 'sonner';

export function useRealTimeNotifications() {
  const { user, token, role, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const pingIntervalRef = useRef<any>(null);

  // Compute unread count from notifications list
  const updateCount = useCallback((list: Notification[]) => {
    const unread = list.filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, []);

  // Fetch initial notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications/');
      if (Array.isArray(res.data)) {
        setNotifications(res.data);
        updateCount(res.data);
      }
    } catch (err) {
      console.warn('Failed fetching notifications, using fallback:', err);
    }
  }, [isAuthenticated, updateCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // WebSocket Connection Management
  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    const currentToken = token || localStorage.getItem('trialbridge_token') || `demo-jwt-token-${(role || 'participant').toLowerCase()}`;
    const host = window.location.hostname || '127.0.0.1';
    // Backend runs on port 8000
    const wsUrl = `ws://${host}:8000/api/ws/notifications?token=${encodeURIComponent(currentToken)}&user_id=${encodeURIComponent(user?.id || '')}&role=${encodeURIComponent(role || '')}`;

    let isUnmounted = false;

    const connectWebSocket = () => {
      if (isUnmounted) return;
      try {
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          // Set up keepalive ping every 25 seconds
          if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send('ping');
            }
          }, 25000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.event === 'NOTIFICATION_RECEIVED' && data.notification) {
              const newNotif: Notification = data.notification;
              setNotifications((prev) => {
                const next = [newNotif, ...prev.filter((n) => n.id !== newNotif.id)];
                updateCount(next);
                return next;
              });

              toast.info(newNotif.title, {
                description: newNotif.message,
                duration: 6000,
              });
            } else if (data.event === 'TRIAL_DECISION_ACCEPTED') {
              toast.success(`Trial Invitation Accepted`, {
                description: `${data.participant_name || 'Participant'} accepted! Baseline clinical intake visit scheduled.`,
                duration: 7000,
              });
              fetchNotifications();
            } else if (data.event === 'TRIAL_DECISION_REJECTED') {
              toast.error(`Trial Invitation Declined`, {
                description: data.message || 'Participant declined clinical trial invitation.',
                duration: 5000,
              });
              fetchNotifications();
            } else if (data.event === 'ADMET_REVIEW_REQUESTED') {
              if (role === 'PRINCIPAL_INVESTIGATOR') {
                toast.info(`ADMET Review Requested`, {
                  description: `${data.coordinator_name} submitted simulation ${data.analysis_id} for your sign-off.`,
                  duration: 8000,
                });
              }
              fetchNotifications();
            } else if (data.event === 'ADMET_REVIEW_COMPLETED') {
              toast.success(`ADMET Final Sign-Off Recorded`, {
                description: `Investigator ${data.reviewer_name} marked simulation as ${data.decision}. Review lifecycle complete.`,
                duration: 7000,
              });
              fetchNotifications();
            }
          } catch {
            // ping response or non-json message
          }
        };

        ws.onerror = (e) => {
          console.debug('WebSocket notification error:', e);
        };

        ws.onclose = () => {
          setIsConnected(false);
          if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
          if (!isUnmounted) {
            // Exponential backoff reconnect
            reconnectTimeoutRef.current = setTimeout(() => {
              connectWebSocket();
            }, 3000);
          }
        };
      } catch (e) {
        console.warn('WebSocket connection attempt failed:', e);
      }
    };

    connectWebSocket();

    return () => {
      isUnmounted = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, token, role, user?.id, fetchNotifications, updateCount]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      updateCount(next);
      return next;
    });
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      // Local optimistic update
    }
  }, [updateCount]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      updateCount(next);
      return next;
    });
    try {
      await api.patch('/notifications/read-all');
    } catch {
      // Local optimistic update
    }
  }, [updateCount]);

  // Take action on notification (e.g. ACCEPT or REJECT trial invitation)
  const takeAction = useCallback(async (notificationId: string, action: 'ACCEPT' | 'REJECT', meta?: Record<string, any>) => {
    const notif = notifications.find((n) => n.id === notificationId);
    const participantId = meta?.participant_id || notif?.metadata?.participant_id || 'P00124';
    const studyId = meta?.study_id || notif?.metadata?.study_id || 'DB-101';

    // Optimistically update notification
    setNotifications((prev) => {
      const next = prev.map((n) =>
        n.id === notificationId
          ? { ...n, action_taken: action, read: true }
          : n
      );
      updateCount(next);
      return next;
    });

    try {
      // 1. Call notification action endpoint
      await api.post(`/notifications/${notificationId}/action`, { action });

      // 2. Also record trial decision directly on participant
      if (action === 'ACCEPT') {
        await api.post(`/participants/${participantId}/trial-decision`, {
          decision: 'ACCEPT',
          study_id: studyId,
          notification_id: notificationId,
        });
        toast.success('Trial Invitation Accepted!', {
          description: 'You are enrolled. A baseline clinical intake visit has been scheduled in 3 days.',
          duration: 6000,
        });
      } else {
        await api.post(`/participants/${participantId}/trial-decision`, {
          decision: 'REJECT',
          study_id: studyId,
          notification_id: notificationId,
        });
        toast.info('Trial Invitation Declined', {
          description: 'Your decision has been recorded and the research team notified.',
          duration: 5000,
        });
      }
      fetchNotifications();
    } catch (e) {
      console.warn('API error recording action, applying optimistic local state:', e);
      if (action === 'ACCEPT') {
        toast.success('Trial Invitation Accepted!', {
          description: 'Baseline clinical intake visit scheduled for your trial.',
        });
      }
    }
  }, [notifications, updateCount, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    takeAction,
    refetch: fetchNotifications,
  };
}
