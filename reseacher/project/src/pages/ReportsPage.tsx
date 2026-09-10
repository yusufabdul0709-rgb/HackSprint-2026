import { useTrialBridge } from '@/store/TrialBridgeContext';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  FileSignature,
  Building2,
  Activity,
} from 'lucide-react';
import { recruitmentTrendData, consentConversionData, retentionData, sitePerformanceData, studyPerformanceData } from '@/data/mockData';

const PIE_COLORS = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444'];

export function ReportsPage() {
  const { studies, participants } = useTrialBridge();

  const screeningConversion = [
    { stage: 'Candidates', value: 420 },
    { stage: 'Screened', value: 285 },
    { stage: 'Eligible', value: 168 },
    { stage: 'Consented', value: 64 },
    { stage: 'Enrolled', value: 48 },
  ];

  const studyDistData = studies.map((s) => ({ name: s.name.split(' ')[0], value: s.enrolledParticipants }));

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Comprehensive insights across recruitment, enrollment, and retention</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Users, label: 'Total Participants', value: participants.length, change: '+18%', bg: 'bg-blue-50', color: 'text-blue-600' },
          { icon: CheckCircle2, label: 'Enrolled', value: participants.filter(p => p.enrollmentStatus === 'enrolled').length, change: '+12%', bg: 'bg-green-50', color: 'text-green-600' },
          { icon: FileSignature, label: 'Consent Rate', value: '68%', change: '+5%', bg: 'bg-purple-50', color: 'text-purple-600' },
          { icon: TrendingUp, label: 'Screening Conversion', value: '40%', change: '+8%', bg: 'bg-amber-50', color: 'text-amber-600' },
        ].map((s, i) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/60 bg-white p-5 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="mt-1 text-xs font-semibold text-green-600">{s.change} vs last month</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recruitment Trend */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recruitment Trend</h2>
              <p className="text-xs text-slate-500">Weekly candidates vs enrolled</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" />Candidates</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-500" />Enrolled</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240} className="mt-4">
            <AreaChart data={recruitmentTrendData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="cand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="enr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Area type="monotone" dataKey="candidates" stroke="#3B82F6" strokeWidth={2} fill="url(#cand)" />
              <Area type="monotone" dataKey="enrolled" stroke="#22C55E" strokeWidth={2} fill="url(#enr)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Screening Conversion */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 animate-fade-in">
          <h2 className="text-base font-semibold text-slate-900">Screening Conversion</h2>
          <p className="text-xs text-slate-500">Funnel from candidates to enrolled</p>
          <ResponsiveContainer width="100%" height={240} className="mt-4">
            <BarChart data={screeningConversion} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey="value" fill="#93C5FD" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Consent Conversion */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Consent Conversion</h2>
              <p className="text-xs text-slate-500">Sent vs signed over time</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-500" />Sent</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-500" />Signed</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240} className="mt-4">
            <LineChart data={consentConversionData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Line type="monotone" dataKey="sent" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4, fill: '#8B5CF6' }} />
              <Line type="monotone" dataKey="signed" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 4, fill: '#22C55E' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Participant Retention */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 animate-fade-in">
          <h2 className="text-base font-semibold text-slate-900">Participant Retention</h2>
          <p className="text-xs text-slate-500">Retention rate over 6 months</p>
          <ResponsiveContainer width="100%" height={240} className="mt-4">
            <AreaChart data={retentionData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="ret" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Area type="monotone" dataKey="retained" stroke="#22C55E" strokeWidth={2.5} fill="url(#ret)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Site Performance */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 animate-fade-in lg:col-span-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            <h2 className="text-base font-semibold text-slate-900">Site Performance</h2>
          </div>
          <p className="text-xs text-slate-500">Recruitment performance by research site</p>
          <ResponsiveContainer width="100%" height={240} className="mt-4">
            <BarChart data={sitePerformanceData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="site" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey="rate" fill="#60A5FA" radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Study Distribution */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 animate-fade-in">
          <h2 className="text-base font-semibold text-slate-900">Enrollment by Study</h2>
          <p className="text-xs text-slate-500">Distribution of enrolled participants</p>
          <ResponsiveContainer width="100%" height={240} className="mt-4">
            <PieChart>
              <Pie data={studyDistData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {studyDistData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Study Progress */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-5 animate-fade-in">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-900">Study Progress</h2>
        </div>
        <p className="text-xs text-slate-500">Enrollment progress across all studies</p>
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
  );
}
