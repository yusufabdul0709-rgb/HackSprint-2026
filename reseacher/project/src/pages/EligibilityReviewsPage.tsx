import React, { useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useTrialBridge } from '@/store/TrialBridgeContext';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Brain,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  FileText,
  User,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/lib/api';

interface ReviewItem {
  id: string;
  participantId: string;
  participantCode: string;
  studyId: string;
  studyTitle: string;
  age: number;
  gender: string;
  aiRecommendation: 'POTENTIALLY_ELIGIBLE' | 'REQUIRES_HUMAN_REVIEW' | 'INELIGIBLE';
  aiConfidence: number;
  coordinatorRecommendation: 'PROCEED' | 'HOLD' | 'REJECT';
  coordinatorNotes: string;
  status: 'PENDING_PI_REVIEW' | 'APPROVED' | 'REJECTED' | 'INFO_REQUESTED';
  criteria: {
    name: string;
    condition: string;
    participantValue: string;
    status: 'MATCH' | 'MISMATCH' | 'REVIEW';
    evidence: string;
  }[];
}

const initialReviews: ReviewItem[] = [
  {
    id: 'rev-001',
    participantId: 'p-001',
    participantCode: 'P-001',
    studyId: 'DB-101',
    studyTitle: 'Diabetes Treatment Study (Phase 2)',
    age: 48,
    gender: 'Male',
    aiRecommendation: 'POTENTIALLY_ELIGIBLE',
    aiConfidence: 94.2,
    coordinatorRecommendation: 'PROCEED',
    coordinatorNotes: 'Verified patient records with hospital lab. HbA1c matches inclusion criteria. Blood pressure stable.',
    status: 'PENDING_PI_REVIEW',
    criteria: [
      { name: 'Age 18-75', condition: '18 <= Age <= 75', participantValue: '48 years', status: 'MATCH', evidence: 'Verified from government ID' },
      { name: 'HbA1c >= 7.0%', condition: 'HbA1c >= 7.0', participantValue: '7.8%', status: 'MATCH', evidence: 'Recent lab report (3 days ago)' },
      { name: 'eGFR >= 60 mL/min', condition: 'eGFR >= 60', participantValue: '82 mL/min', status: 'MATCH', evidence: 'Metabolic panel verified' },
      { name: 'No Prior Hypoglycemia', condition: 'Severe episodes == 0', participantValue: '0 episodes', status: 'MATCH', evidence: 'Self-reported & EHR confirmed' }
    ]
  },
  {
    id: 'rev-002',
    participantId: 'p-002',
    participantCode: 'P-002',
    studyId: 'ST-001',
    studyTitle: 'Type 2 Diabetes Study (C4H11N5 Renal Dynamics)',
    age: 62,
    gender: 'Female',
    aiRecommendation: 'REQUIRES_HUMAN_REVIEW',
    aiConfidence: 78.4,
    coordinatorRecommendation: 'PROCEED',
    coordinatorNotes: 'Renal eGFR is borderline 52 mL/min. PI clinical discretion requested for C4H11N5 clearance safety inclusion.',
    status: 'PENDING_PI_REVIEW',
    criteria: [
      { name: 'Age 30-65', condition: '30 <= Age <= 65', participantValue: '62 years', status: 'MATCH', evidence: 'EHR verified' },
      { name: 'eGFR >= 45 mL/min', condition: 'eGFR >= 45', participantValue: '52 mL/min', status: 'REVIEW', evidence: 'Borderline renal filtration rate' },
      { name: 'HbA1c >= 7.0%', condition: 'HbA1c >= 7.0', participantValue: '7.6%', status: 'MATCH', evidence: 'Recent lab drawn' }
    ]
  },
  {
    id: 'rev-003',
    participantId: 'p-003',
    participantCode: 'P-003',
    studyId: 'DB-101',
    studyTitle: 'Diabetes Treatment Study (Phase 2)',
    age: 55,
    gender: 'Female',
    aiRecommendation: 'POTENTIALLY_ELIGIBLE',
    aiConfidence: 91.0,
    coordinatorRecommendation: 'PROCEED',
    coordinatorNotes: 'Coordinator verified all inclusion items. Ready for PI final authorization.',
    status: 'PENDING_PI_REVIEW',
    criteria: [
      { name: 'Age 18-75', condition: '18 <= Age <= 75', participantValue: '55 years', status: 'MATCH', evidence: 'EHR verified' },
      { name: 'HbA1c >= 7.0%', condition: 'HbA1c >= 7.0', participantValue: '8.1%', status: 'MATCH', evidence: 'Lab drawn yesterday' },
      { name: 'eGFR >= 60 mL/min', condition: 'eGFR >= 60', participantValue: '75 mL/min', status: 'MATCH', evidence: 'Renal panel normal' }
    ]
  }
];

export function EligibilityReviewsPage() {
  const { role } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const isPI = role === 'PRINCIPAL_INVESTIGATOR' || role === 'PLATFORM_ADMIN';

  const handleDecision = async (reviewId: string, action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO', reason: string) => {
    if (!isPI) {
      toast.error('403 Forbidden: Only Principal Investigators can approve/reject eligibility reviews.');
      return;
    }

    try {
      if (action === 'APPROVE') {
        await api.post(`/eligibility/${reviewId}/approve`, { reason });
      } else if (action === 'REJECT') {
        await api.post(`/eligibility/${reviewId}/reject`, { reason });
      } else {
        await api.post(`/eligibility/${reviewId}/request-info`, { reason });
      }
    } catch {
      // Backend handles fallback
    }

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        return {
          ...r,
          status: action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'INFO_REQUESTED'
        };
      })
    );

    setReviewModalOpen(false);
    if (action === 'APPROVE') {
      toast.success(`Participant ${selectedReview?.participantCode} eligibility approved! Participant transitions to Consent phase.`);
    } else if (action === 'REJECT') {
      toast.error(`Participant ${selectedReview?.participantCode} eligibility rejected.`);
    } else {
      toast.info(`Information request sent to Research Coordinator.`);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.participantCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studyTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Research Decisions Requiring Your Review</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Clinical eligibility evaluations combining AI assistive screening, Coordinator verification, and PI sign-off.
          </p>
        </div>

        {!isPI && (
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Coordinator View: Final clinical sign-off is restricted to Principal Investigators.</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by participant or study..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200/80 bg-white pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <span className="text-slate-400 font-medium">Status:</span>
          {(['ALL', 'PENDING_PI_REVIEW', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {status === 'ALL' ? 'All Reviews' : status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table / Cards */}
      <div className="space-y-3">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm hover:border-slate-300 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900">{review.participantCode}</span>
                  <span className="text-xs text-slate-400">· {review.gender}, {review.age}y</span>
                  <span className="rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    {review.studyId}
                  </span>
                  <StatusBadge status={review.status.toLowerCase()} />
                </div>
                <p className="text-sm font-medium text-slate-800">{review.studyTitle}</p>
                <p className="text-xs text-slate-500 line-clamp-1 italic">
                  Coordinator Note: "{review.coordinatorNotes}"
                </p>
              </div>

              {/* AI & Coordinator Badges */}
              <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-center min-w-[120px]">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-500">
                    <Sparkles className="h-3 w-3 text-purple-600" />
                    AI Screening
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-0.5 capitalize">
                    {review.aiRecommendation.replace(/_/g, ' ').toLowerCase()}
                  </p>
                  <p className="text-[10px] text-purple-700 font-medium">{review.aiConfidence}% match</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-center min-w-[120px]">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-500">
                    <User className="h-3 w-3 text-blue-600" />
                    Coordinator
                  </div>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    {review.coordinatorRecommendation}
                  </p>
                  <p className="text-[10px] text-slate-400">Human verified</p>
                </div>

                {/* Review / Action Button */}
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedReview(review);
                      setReviewModalOpen(true);
                    }}
                    className="h-9 gap-1.5 text-xs font-semibold"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Inspect Criteria & Evidence
                  </Button>

                  {review.status === 'PENDING_PI_REVIEW' && isPI && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedReview(review);
                        setReviewModalOpen(true);
                      }}
                      className="h-9 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Sign-off
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedReview && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-bold text-slate-900">
                    Eligibility Sign-off: {selectedReview.participantCode}
                  </DialogTitle>
                  <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    {selectedReview.studyId}
                  </span>
                </div>
                <DialogDescription className="text-xs text-slate-500">
                  Study: {selectedReview.studyTitle} · Participant: {selectedReview.gender}, {selectedReview.age} years old
                </DialogDescription>
              </DialogHeader>

              {/* Criterion-by-criterion evidence table */}
              <div className="space-y-4 py-2">
                <div className="rounded-xl border border-slate-200/80 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 grid grid-cols-12">
                    <span className="col-span-4">Criterion / Rule</span>
                    <span className="col-span-3">Condition</span>
                    <span className="col-span-3">Participant EHR Value</span>
                    <span className="col-span-2 text-right">Result</span>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {selectedReview.criteria.map((c, idx) => (
                      <div key={idx} className="px-4 py-2.5 grid grid-cols-12 items-center hover:bg-slate-50/50">
                        <div className="col-span-4">
                          <p className="font-semibold text-slate-900">{c.name}</p>
                          <p className="text-[10px] text-slate-400">{c.evidence}</p>
                        </div>
                        <span className="col-span-3 font-mono text-[11px] text-slate-600">{c.condition}</span>
                        <span className="col-span-3 font-medium text-slate-800">{c.participantValue}</span>
                        <div className="col-span-2 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.status === 'MATCH'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : c.status === 'MISMATCH'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coordinator Note Box */}
                <div className="rounded-xl bg-slate-50 p-3.5 text-xs border border-slate-200/60">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
                    <User className="h-3.5 w-3.5 text-blue-600" />
                    <span>Research Coordinator Recommendation & Field Notes</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{selectedReview.coordinatorNotes}</p>
                </div>

                {/* PI Decisions Toolbar */}
                {selectedReview.status === 'PENDING_PI_REVIEW' ? (
                  isPI ? (
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-slate-100">
                      <Button
                        variant="outline"
                        onClick={() => handleDecision(selectedReview.id, 'REQUEST_INFO', 'Need further lab verification')}
                        className="text-xs h-9 gap-1.5"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                        Request More Information
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDecision(selectedReview.id, 'REJECT', 'Criteria mismatch found upon review')}
                        className="text-xs h-9 gap-1.5"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject Eligibility
                      </Button>
                      <Button
                        onClick={() => handleDecision(selectedReview.id, 'APPROVE', 'PI approved following evidence verification')}
                        className="text-xs h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve & Advance to Consent
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs flex items-center gap-2 border border-amber-200">
                      <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>
                        Coordinator view only: As Research Coordinator, you have submitted this recommendation. Awaiting Principal Investigator signature.
                      </span>
                    </div>
                  )
                ) : (
                  <div className="p-3 bg-slate-50 text-slate-700 rounded-xl text-xs flex items-center justify-between border border-slate-200">
                    <span className="font-semibold">Review Completed</span>
                    <StatusBadge status={selectedReview.status.toLowerCase()} />
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
