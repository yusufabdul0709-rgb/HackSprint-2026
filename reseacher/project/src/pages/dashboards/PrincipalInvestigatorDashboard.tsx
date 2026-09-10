import { useState } from 'react';
import { useTrialBridge } from '@/store/TrialBridgeContext';
import { useAuth } from '@/store/AuthContext';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ProgressRing } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  FlaskConical,
  Users,
  Clock,
  CalendarClock,
  AlertTriangle,
  FileSignature,
  CheckSquare,
  Brain,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  User,
  FileText,
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

  const [decisions, setDecisions] = useState([
    {
      id: 'P001',
      name: 'James Wilson',
      participantCode: 'P001',
      study: 'Diabetes Treatment Study',
      studyId: 'DB-101',
      age: 48,
      gender: 'Male',
      aiRecommendation: 'Potentially Eligible',
      aiConfidence: 94.2,
      coordinatorRecommendation: 'Proceed',
      coordinatorNotes: 'Verified patient records with hospital lab. HbA1c 7.8% meets criteria. Normal renal function.',
      status: 'PENDING',
      criteria: [
        { name: 'Age 18-75', rule: '18 <= Age <= 75', patientValue: '48 years', result: 'MATCH', evidence: 'Verified from Government ID' },
        { name: 'HbA1c >= 7.0%', rule: 'HbA1c >= 7.0', patientValue: '7.8%', result: 'MATCH', evidence: 'Lab drawn 3 days ago' },
        { name: 'eGFR >= 60 mL/min', rule: 'eGFR >= 60', patientValue: '82 mL/min', result: 'MATCH', evidence: 'Metabolic panel confirmed' },
        { name: 'No Prior Severe Hypoglycemia', rule: 'Episodes == 0', patientValue: '0 episodes', result: 'MATCH', evidence: 'EHR confirmed' }
      ]
    },
    {
      id: 'P002',
      name: 'Elena Rostova',
      participantCode: 'P002',
      study: 'Cardiac Regeneration Trial',
      studyId: 'CD-202',
      age: 62,
      gender: 'Female',
      aiRecommendation: 'Requires Human Review',
      aiConfidence: 78.5,
      coordinatorRecommendation: 'Proceed',
      coordinatorNotes: 'Ejection fraction is borderline 38%. PI clinical discretion requested.',
      status: 'PENDING',
      criteria: [
        { name: 'Age 40-80', rule: '40 <= Age <= 80', patientValue: '62 years', result: 'MATCH', evidence: 'EHR verified' },
        { name: 'LVEF <= 40%', rule: 'LVEF <= 40', patientValue: '38%', result: 'REVIEW', evidence: 'Echo report shows 38-41% range' },
        { name: 'No Arrhythmia (last 6mo)', rule: 'Arrhythmia == False', patientValue: 'Negative', result: 'MATCH', evidence: 'Holter monitor clean' }
      ]
    }
  ]);

  const [activeReviewModal, setActiveReviewModal] = useState<any>(null);

  const handleApprove = (id: string) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, status: 'APPROVED' } : d));
    setActiveReviewModal(null);
    toast.success(`Participant ${id} eligibility approved! Participant advanced to Consent workflow.`);
  };

  const handleReject = (id: string) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, status: 'REJECTED' } : d));
    setActiveReviewModal(null);
    toast.error(`Participant ${id} eligibility rejected.`);
  };

  const handleRequestInfo = (id: string) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, status: 'INFO_REQUESTED' } : d));
    setActiveReviewModal(null);
    toast.info(`Information request dispatched to Research Coordinator for ${id}.`);
  };

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

      {/* Primary Section: Research Decisions Requiring Your Review */}
      <div className="rounded-2xl border-2 border-blue-200/80 bg-gradient-to-br from-blue-50/30 via-white to-slate-50/40 p-5 shadow-sm space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Research Decisions Requiring Your Review</h2>
              <p className="text-xs text-slate-500">Principal Investigator clinical eligibility evaluations awaiting your sign-off.</p>
            </div>
          </div>
          <span className="self-start sm:self-auto rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-800 border border-blue-200">
            {decisions.filter(d => d.status === 'PENDING').length} Action Items Pending
          </span>
        </div>

        <div className="space-y-3">
          {decisions.map((decision) => (
            <div
              key={decision.id}
              className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm hover:border-blue-300 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">Participant {decision.participantCode}</span>
                    <span className="text-xs text-slate-500">({decision.name} · {decision.gender}, {decision.age}y)</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      Study: {decision.study}
                    </span>
                    {decision.status === 'APPROVED' && (
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        APPROVED
                      </span>
                    )}
                    {decision.status === 'REJECTED' && (
                      <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                        REJECTED
                      </span>
                    )}
                    {decision.status === 'INFO_REQUESTED' && (
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        INFO REQUESTED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1 italic">
                    Coordinator Note: "{decision.coordinatorNotes}"
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-lg border border-purple-100 bg-purple-50/50 px-3 py-1.5 text-center text-xs">
                    <span className="text-[10px] text-purple-600 font-semibold block">AI Recommendation</span>
                    <span className="font-bold text-purple-900">{decision.aiRecommendation}</span>
                    <span className="text-[10px] text-purple-700 block">({decision.aiConfidence}% conf)</span>
                  </div>

                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-1.5 text-center text-xs">
                    <span className="text-[10px] text-emerald-600 font-semibold block">Coordinator Recommendation</span>
                    <span className="font-bold text-emerald-900">{decision.coordinatorRecommendation}</span>
                    <span className="text-[10px] text-emerald-700 block">(Verified)</span>
                  </div>

                  {decision.status === 'PENDING' ? (
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveReviewModal(decision)}
                        className="h-8 text-xs font-semibold"
                      >
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        Review Evidence
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(decision.id)}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(decision.id)}
                        className="h-8 text-xs font-semibold"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRequestInfo(decision.id)}
                        className="h-8 text-xs text-slate-600 hover:bg-slate-100"
                        title="Request More Information from Coordinator"
                      >
                        <HelpCircle className="h-3.5 w-3.5 mr-1" />
                        Request Info
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic">Decision finalized</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Criterion Review Modal */}
      <Dialog open={!!activeReviewModal} onOpenChange={(open) => !open && setActiveReviewModal(null)}>
        <DialogContent className="max-w-2xl">
          {activeReviewModal && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-bold text-slate-900">
                    Eligibility Evidence: Participant {activeReviewModal.participantCode}
                  </DialogTitle>
                  <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    {activeReviewModal.studyId}
                  </span>
                </div>
                <DialogDescription className="text-xs text-slate-500">
                  Study: {activeReviewModal.study} · Patient: {activeReviewModal.name} ({activeReviewModal.gender}, {activeReviewModal.age}y)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                {/* Criterion table */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-[11px] font-bold text-slate-600 grid grid-cols-12">
                    <span className="col-span-4">Protocol Criterion</span>
                    <span className="col-span-3">Required Rule</span>
                    <span className="col-span-3">Participant EHR Value</span>
                    <span className="col-span-2 text-right">Result</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {activeReviewModal.criteria.map((c: any, i: number) => (
                      <div key={i} className="px-4 py-2.5 grid grid-cols-12 items-center hover:bg-slate-50/50">
                        <div className="col-span-4">
                          <p className="font-semibold text-slate-800">{c.name}</p>
                          <p className="text-[10px] text-slate-400">{c.evidence}</p>
                        </div>
                        <span className="col-span-3 font-mono text-slate-600">{c.rule}</span>
                        <span className="col-span-3 font-semibold text-slate-900">{c.patientValue}</span>
                        <div className="col-span-2 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.result === 'MATCH'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {c.result}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                  <p className="font-semibold text-slate-700 mb-1">Research Coordinator Field Verification:</p>
                  <p className="text-slate-600 italic leading-relaxed">"{activeReviewModal.coordinatorNotes}"</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => handleRequestInfo(activeReviewModal.id)}
                    className="text-xs h-9"
                  >
                    Request More Information
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(activeReviewModal.id)}
                    className="text-xs h-9"
                  >
                    Reject Eligibility
                  </Button>
                  <Button
                    onClick={() => handleApprove(activeReviewModal.id)}
                    className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Approve & Sign-off
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
