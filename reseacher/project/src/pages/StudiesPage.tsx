import { useState } from 'react';
import { useTrialBridge } from '@/store/TrialBridgeContext';
import { StatusBadge, ProgressRing } from '@/components/shared/StatusBadge';
import { TrialAnatomy } from '@/components/shared/TrialAnatomy';
import {
  Plus,
  Search,
  FlaskConical,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  X,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import type { Study, EligibilityCriterion, StudyStatus } from '@/types';
import { cn } from '@/lib/utils';

export function StudiesPage() {
  const { studies, addStudy } = useTrialBridge();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = studies.filter(
    (s) =>
      (s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === 'all' || s.status === statusFilter)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Studies</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your clinical trial studies</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Study
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search studies by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="recruiting">Recruiting</SelectItem>
            <SelectItem value="screening">Screening</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Study cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((study, i) => {
          const pct = Math.round((study.enrolledParticipants / study.targetParticipants) * 100);
          return (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 50 }}
              onClick={() => setSelectedStudy(study)}
              className="card-hover cursor-pointer rounded-2xl border border-slate-200/60 bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <FlaskConical className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">{study.id}</p>
                    <h3 className="text-sm font-semibold text-slate-900">{study.name}</h3>
                  </div>
                </div>
                <StatusBadge status={study.status} />
              </div>
              <p className="mt-3 text-xs text-slate-500 line-clamp-2">{study.description}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {study.researchSite.split(',')[0]}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {study.startDate}</span>
              </div>
              <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3">
                <ProgressRing value={pct} size={40} stroke={3} color={pct >= 75 ? '#22C55E' : pct >= 50 ? '#3B82F6' : '#F59E0B'} />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Enrollment</p>
                  <p className="text-sm font-medium text-slate-800">{study.enrolledParticipants} / {study.targetParticipants}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Study Detail Dialog */}
      <StudyDetailDialog study={selectedStudy} onClose={() => setSelectedStudy(null)} />

      {/* Create Study Dialog */}
      <CreateStudyDialog open={showCreate} onClose={() => setShowCreate(false)} onCreate={addStudy} />
    </div>
  );
}

function StudyDetailDialog({ study, onClose }: { study: Study | null; onClose: () => void }) {
  if (!study) return null;
  const pct = Math.round((study.enrolledParticipants / study.targetParticipants) * 100);
  return (
    <Dialog open={!!study} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">{study.id} · {study.phase}</p>
              <DialogTitle className="text-xl">{study.name}</DialogTitle>
            </div>
            <StatusBadge status={study.status} />
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-slate-600">{study.description}</p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Condition', value: study.condition },
              { label: 'Sponsor', value: study.sponsor },
              { label: 'Research Site', value: study.researchSite },
              { label: 'Principal Investigator', value: study.principalInvestigator },
              { label: 'Start Date', value: study.startDate },
              { label: 'End Date', value: study.endDate },
              { label: 'Target', value: `${study.targetParticipants} participants` },
              { label: 'Enrolled', value: `${study.enrolledParticipants} participants` },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{item.label}</p>
                <p className="mt-0.5 text-sm font-medium text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Enrollment progress */}
          <div className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Enrollment Progress</span>
              <span className="text-sm font-semibold text-slate-900">{pct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="rounded-xl border border-slate-100 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Eligibility Criteria</h3>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-xs font-medium text-green-700 mb-2">Inclusion Criteria</p>
                <div className="space-y-1.5">
                  {study.eligibilityCriteria.filter(c => c.category === 'inclusion').map((c) => (
                    <div key={c.id} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      {c.field} {c.operator} {c.value}
                    </div>
                  ))}
                </div>
              </div>
              {study.eligibilityCriteria.some(c => c.category === 'exclusion') && (
                <div>
                  <p className="text-xs font-medium text-red-700 mb-2">Exclusion Criteria</p>
                  <div className="space-y-1.5">
                    {study.eligibilityCriteria.filter(c => c.category === 'exclusion').map((c) => (
                      <div key={c.id} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        {c.field} {c.operator} {c.value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trial Anatomy */}
          {study.anatomy && (
            <TrialAnatomy organ={study.anatomy} description={study.anatomyDescription || ''} studyName={study.name} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateStudyDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (study: Study) => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    description: '',
    condition: '',
    sponsor: '',
    researchSite: '',
    startDate: '',
    endDate: '',
    targetParticipants: 50,
    phase: 'Phase II',
    anatomy: '',
    anatomyDescription: '',
  });
  const [criteria, setCriteria] = useState<EligibilityCriterion[]>([]);

  const addCriterion = () => {
    setCriteria([...criteria, {
      id: `c${Date.now()}`,
      field: '',
      operator: 'equals',
      value: '',
      category: 'inclusion',
    }]);
  };

  const updateCriterion = (id: string, field: keyof EligibilityCriterion, value: string) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const handleSubmit = () => {
    const newStudy: Study = {
      id: `ST-${String(Date.now()).slice(-3)}`,
      ...form,
      enrolledParticipants: 0,
      status: 'recruiting',
      eligibilityCriteria: criteria,
      principalInvestigator: 'Dr. James Patel',
    };
    onCreate(newStudy);
    onClose();
    setStep(1);
    setForm({ name: '', description: '', condition: '', sponsor: '', researchSite: '', startDate: '', endDate: '', targetParticipants: 50, phase: 'Phase II', anatomy: '', anatomyDescription: '' });
    setCriteria([]);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Study</DialogTitle>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex items-center gap-2">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                step >= s ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'
              )}>
                {s}
              </div>
              <span className={cn('text-sm', step >= s ? 'text-slate-800 font-medium' : 'text-slate-400')}>
                {s === 1 ? 'Study Details' : 'Eligibility Criteria'}
              </span>
              {s < 2 && <div className="mx-2 h-px w-8 bg-slate-200" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-sm">Study Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Diabetes Treatment Study" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Condition</Label>
                <Input value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} placeholder="e.g. Type 2 Diabetes" className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-sm">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Study description..." className="mt-1" rows={3} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-sm">Sponsor</Label>
                <Input value={form.sponsor} onChange={(e) => setForm({ ...form, sponsor: e.target.value })} placeholder="e.g. PharmaCo Research" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Research Site</Label>
                <Input value={form.researchSite} onChange={(e) => setForm({ ...form, researchSite: e.target.value })} placeholder="e.g. City Hospital, Chennai" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-sm">Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Target Participants</Label>
                <Input type="number" value={form.targetParticipants} onChange={(e) => setForm({ ...form, targetParticipants: parseInt(e.target.value) || 0 })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-sm">Trial Phase</Label>
                <Select value={form.phase} onValueChange={(v) => setForm({ ...form, phase: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Phase I">Phase I</SelectItem>
                    <SelectItem value="Phase II">Phase II</SelectItem>
                    <SelectItem value="Phase III">Phase III</SelectItem>
                    <SelectItem value="Phase IV">Phase IV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Relevant Anatomy (optional)</Label>
                <Input value={form.anatomy} onChange={(e) => setForm({ ...form, anatomy: e.target.value })} placeholder="e.g. Pancreas" className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(2)} disabled={!form.name}>Next: Eligibility Criteria</Button>
            </DialogFooter>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Eligibility Criteria Builder</h3>
                <p className="text-xs text-slate-500">Define inclusion and exclusion criteria for AI-assisted screening</p>
              </div>
              <Button size="sm" variant="outline" onClick={addCriterion} className="flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Criteria
              </Button>
            </div>

            {criteria.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-400">No criteria added yet. Click "Add Criteria" to start.</p>
              </div>
            )}

            <AnimatePresence>
              {criteria.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">Criterion {i + 1}</span>
                    <button onClick={() => removeCriterion(c.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Input placeholder="Field (e.g. Age)" value={c.field} onChange={(e) => updateCriterion(c.id, 'field', e.target.value)} className="text-sm" />
                    <Input placeholder="Operator (e.g. >=)" value={c.operator} onChange={(e) => updateCriterion(c.id, 'operator', e.target.value)} className="text-sm" />
                    <Input placeholder="Value (e.g. 30)" value={c.value} onChange={(e) => updateCriterion(c.id, 'value', e.target.value)} className="text-sm" />
                    <Select value={c.category} onValueChange={(v) => updateCriterion(c.id, 'category', v)}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inclusion">Inclusion</SelectItem>
                        <SelectItem value="exclusion">Exclusion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleSubmit} disabled={!form.name}>Create Study</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
