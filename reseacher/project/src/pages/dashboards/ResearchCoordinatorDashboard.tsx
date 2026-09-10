import { useTrialBridge } from '@/store/TrialBridgeContext';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  UserCheck,
  FileSignature,
  CalendarClock,
  Phone,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { recruitmentFunnelData } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function ResearchCoordinatorDashboard() {
  const { participants, tasks, visits } = useTrialBridge();

  const toReview = participants.filter((p) => p.screeningStatus === 'potentially_eligible' || p.screeningStatus === 'human_review').length;
  const consentPending = participants.filter((p) => p.consentStatus === 'pending' || p.consentStatus === 'viewed' || p.consentStatus === 'sent').length;
  const todayVisits = visits.filter((v) => v.status === 'scheduled').length;
  const followupsDue = tasks.filter((t) => t.type === 'participant_followup' && t.status !== 'completed').length;

  const todayTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'overdue' || t.status === 'in_progress').slice(0, 5);

  const pipelineStages = [
    { label: 'Candidate', count: participants.filter(p => p.screeningStatus === 'candidate').length, color: 'bg-slate-100 text-slate-600' },
    { label: 'Screening', count: participants.filter(p => p.screeningStatus === 'screening').length, color: 'bg-blue-50 text-blue-700' },
    { label: 'Eligible', count: participants.filter(p => p.screeningStatus === 'potentially_eligible' || p.screeningStatus === 'approved').length, color: 'bg-purple-50 text-purple-700' },
    { label: 'Consent', count: participants.filter(p => p.consentStatus === 'consented' || p.consentStatus === 'pending' || p.consentStatus === 'viewed').length, color: 'bg-amber-50 text-amber-700' },
    { label: 'Enrolled', count: participants.filter(p => p.enrollmentStatus === 'enrolled').length, color: 'bg-green-50 text-green-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Good Morning, Maya</h1>
        <p className="mt-1 text-sm text-slate-500">Stay on top of today's participant and study activities.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={UserCheck} label="Participants to Review" value={toReview} change="3 new" changeType="negative" iconBg="bg-amber-50" iconColor="text-amber-600" delay={0} />
        <MetricCard icon={FileSignature} label="Consent Pending" value={consentPending} change="2 new" changeType="neutral" iconBg="bg-purple-50" iconColor="text-purple-600" delay={60} />
        <MetricCard icon={CalendarClock} label="Today's Visits" value={todayVisits} change="2 upcoming" changeType="neutral" iconBg="bg-blue-50" iconColor="text-blue-600" delay={120} />
        <MetricCard icon={Phone} label="Follow-ups Due" value={followupsDue} change="1 new" changeType="negative" iconBg="bg-green-50" iconColor="text-green-600" delay={180} />
      </div>

      {/* Participant Pipeline */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-5 animate-fade-in">
        <h2 className="text-base font-semibold text-slate-900">Participant Pipeline</h2>
        <p className="text-xs text-slate-500">Current participants by stage</p>
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">
          {pipelineStages.map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-2 shrink-0">
              <div className={cn('flex min-w-[120px] flex-col items-center gap-2 rounded-xl px-4 py-3', stage.color)}>
                <span className="text-2xl font-bold">{stage.count}</span>
                <span className="text-xs font-medium">{stage.label}</span>
              </div>
              {i < pipelineStages.length - 1 && <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Upcoming Tasks */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 animate-fade-in">
          <h2 className="text-base font-semibold text-slate-900">Upcoming Tasks</h2>
          <p className="text-xs text-slate-500">Tasks due today and this week</p>
          <div className="mt-4 space-y-2">
            {todayTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  task.priority === 'high' ? 'bg-red-50' : task.priority === 'medium' ? 'bg-amber-50' : 'bg-slate-100'
                )}>
                  <Clock className={cn(
                    'h-4 w-4',
                    task.priority === 'high' ? 'text-red-600' : task.priority === 'medium' ? 'text-amber-600' : 'text-slate-500'
                  )} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{task.title}</p>
                  <p className="truncate text-xs text-slate-500">{task.participantName ? `${task.participantId} · ` : ''}{task.studyName}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-medium text-slate-700">{task.dueTime}</p>
                  <p className="text-[10px] text-slate-400">{task.dueDate}</p>
                </div>
                <StatusBadge status={task.priority} className="shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Participants */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 animate-fade-in">
          <h2 className="text-base font-semibold text-slate-900">Recent Participants</h2>
          <p className="text-xs text-slate-500">Latest participant activity</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500">
                  <th className="pb-2 pr-3 text-left font-medium">ID</th>
                  <th className="pb-2 pr-3 text-left font-medium">Name</th>
                  <th className="pb-2 pr-3 text-left font-medium">Study</th>
                  <th className="pb-2 pr-3 text-left font-medium">Status</th>
                  <th className="pb-2 text-left font-medium">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {participants.slice(0, 6).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 pr-3 text-xs font-medium text-slate-700">{p.id}</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
                          {p.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm text-slate-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-slate-500 max-w-[120px] truncate">{p.studyName}</td>
                    <td className="py-2.5 pr-3"><StatusBadge status={p.screeningStatus} /></td>
                    <td className="py-2.5 text-xs text-slate-400">{p.lastActivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
