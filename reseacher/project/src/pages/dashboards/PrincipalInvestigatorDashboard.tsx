import { useTrialBridge } from '@/store/TrialBridgeContext';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ProgressRing } from '@/components/shared/StatusBadge';
import {
  FlaskConical,
  Users,
  Clock,
  CalendarClock,
  AlertTriangle,
  FileSignature,
  CheckSquare,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import { recruitmentFunnelData, enrollmentTrendData, studyPerformanceData } from '@/data/mockData';

export function PrincipalInvestigatorDashboard() {
  const { studies, participants, visits, tasks } = useTrialBridge();

  const pendingDecisions = participants.filter((p) => p.screeningStatus === 'potentially_eligible' || p.screeningStatus === 'human_review').length;
  const upcomingVisits = visits.filter((v) => v.status === 'scheduled').length;
  const totalParticipants = participants.length;
  const activeStudies = studies.length;

  const overdueTasks = tasks.filter((t) => t.status === 'overdue').length;
  const pendingConsents = participants.filter((p) => p.consentStatus === 'pending' || p.consentStatus === 'viewed').length;
  const todayVisits = visits.filter((v) => v.date === '2026-09-10' && v.status === 'scheduled').length;
  const awaitingReview = participants.filter((p) => !p.screeningReviewed && p.screeningStatus !== 'candidate' && p.screeningStatus !== 'rejected').length;

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Good Morning, Dr. Sarah</h1>
        <p className="mt-1 text-sm text-slate-500">Here's an overview of your active clinical studies.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={FlaskConical} label="Active Studies" value={activeStudies} change="2 new" changeType="neutral" iconBg="bg-blue-50" iconColor="text-blue-600" delay={0} />
        <MetricCard icon={Users} label="Total Participants" value={totalParticipants} change="14%" iconBg="bg-purple-50" iconColor="text-purple-600" delay={60} />
        <MetricCard icon={AlertTriangle} label="Pending Decisions" value={pendingDecisions} change="3 new" changeType="negative" iconBg="bg-amber-50" iconColor="text-amber-600" delay={120} />
        <MetricCard icon={CalendarClock} label="Upcoming Visits" value={upcomingVisits} change="This week" changeType="neutral" iconBg="bg-green-50" iconColor="text-green-600" delay={180} />
      </div>

      {/* Recruitment Funnel + Study Performance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recruitment Funnel */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 animate-fade-in">
          <h2 className="text-base font-semibold text-slate-900">Participant Recruitment Funnel</h2>
          <p className="text-xs text-slate-500">From candidates to enrollment</p>
          <ResponsiveContainer width="100%" height={280} className="mt-4">
            <BarChart data={recruitmentFunnelData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={120} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                cursor={{ fill: '#F8FAFC' }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                {recruitmentFunnelData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Study Performance */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 animate-fade-in">
          <h2 className="text-base font-semibold text-slate-900">Study Performance</h2>
          <p className="text-xs text-slate-500">Enrollment progress across studies</p>
          <div className="mt-5 space-y-5">
            {studyPerformanceData.map((s) => (
              <div key={s.study}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{s.study}</span>
                  <span className="text-sm font-semibold text-slate-900">{s.progress}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${s.progress}%`,
                      background: s.progress >= 75 ? '#22C55E' : s.progress >= 50 ? '#3B82F6' : '#F59E0B',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enrollment Trend */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Enrollment Trend</h2>
            <p className="text-xs text-slate-500">Monthly enrollment vs. target</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" />Enrolled</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" />Target</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240} className="mt-4">
          <LineChart data={enrollmentTrendData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
            <Line type="monotone" dataKey="enrolled" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: '#3B82F6' }} />
            <Line type="monotone" dataKey="target" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Requires Your Attention */}
      <div className="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-white p-5 animate-fade-in">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h2 className="text-base font-semibold text-slate-900">Requires Your Attention</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-amber-200/40 bg-white p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{awaitingReview}</p>
              <p className="text-xs text-slate-500">awaiting review</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-purple-200/40 bg-white p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <FileSignature className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{pendingConsents}</p>
              <p className="text-xs text-slate-500">consent forms pending</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-blue-200/40 bg-white p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <CalendarClock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{todayVisits}</p>
              <p className="text-xs text-slate-500">visits scheduled today</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-red-200/40 bg-white p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <CheckSquare className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{overdueTasks}</p>
              <p className="text-xs text-slate-500">protocol tasks overdue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
