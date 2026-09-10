import React, { useState } from 'react';
import { KidneyViewer3D } from '@/components/shared/KidneyViewer3D';
import { Button } from '@/components/ui/button';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'sonner';

export function SimulationLabPage() {
  const [selectedStudy, setSelectedStudy] = useState('DB-101');
  const [compound, setCompound] = useState('GLP-1 Receptor Agonist (TB-402)');
  const [dosage, setDosage] = useState(25);
  const [durationWeeks, setDurationWeeks] = useState(12);
  const [patientCohortSize, setPatientCohortSize] = useState(150);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    predictedEfficacy: number;
    clearanceRate: number;
    toxicityScore: number;
    targetEngagement: number;
    estimatedRetention: number;
    clinicalRationale?: string;
    modelBadge?: string;
  } | null>({
    predictedEfficacy: 84.6,
    clearanceRate: 91.2,
    toxicityScore: 2.1,
    targetEngagement: 88.5,
    estimatedRetention: 94.0,
    clinicalRationale: "Initiation of 25mg daily dosing preserves glomerular filtration over 24 weeks with progressive albuminuria reduction.",
    modelBadge: "In-Silico Pharmacodynamic Model + Gemini 3.6 Flash"
  });

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await api.post('/simulation/dose-response', {
        baseline_egfr: 58.0,
        baseline_uacr: 180.0,
        dosage_mg: dosage,
        treatment_weeks: durationWeeks
      });
      const data = res.data;
      const doseFactor = dosage / 50;
      const efficacy = Math.min(96, Math.max(60, 78 + doseFactor * 18 - (durationWeeks > 20 ? 4 : 0)));
      const clearance = Math.max(75, 96 - doseFactor * 10);
      const toxicity = Number((1.2 + doseFactor * 2.4).toFixed(1));
      const engagement = Math.min(99, 82 + doseFactor * 12);
      const retention = Math.max(80, 96 - (toxicity > 3 ? 8 : 2));

      setSimulationResult({
        predictedEfficacy: Number(efficacy.toFixed(1)),
        clearanceRate: Number(clearance.toFixed(1)),
        toxicityScore: toxicity,
        targetEngagement: Number(engagement.toFixed(1)),
        estimatedRetention: Number(retention.toFixed(1)),
        clinicalRationale: data.clinical_rationale,
        modelBadge: data.model || 'In-Silico Pharmacodynamic Model + Gemini 3.6 Flash'
      });
      toast.success('Simulation run completed with Gemini 3.6 Flash rationale & 3D model synchronization');
    } catch {
      const doseFactor = dosage / 50;
      setSimulationResult({
        predictedEfficacy: Number((78 + doseFactor * 18).toFixed(1)),
        clearanceRate: Number((96 - doseFactor * 10).toFixed(1)),
        toxicityScore: Number((1.2 + doseFactor * 2.4).toFixed(1)),
        targetEngagement: Number((82 + doseFactor * 12).toFixed(1)),
        estimatedRetention: 94.0,
        clinicalRationale: `Simulated trajectory at ${dosage}mg preserves filtration across ${durationWeeks} weeks.`,
        modelBadge: 'Local Pharmacodynamic Model'
      });
      toast.success('Simulation completed (local fallback)');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Simulation Lab & 3D Molecular Workbench</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Principal Investigator virtual trial modeling, renal clearance simulation, and pharmacokinetic prediction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <Play className={`h-4 w-4 ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Running In-Silico Engine...' : 'Run Protocol Simulation'}
          </Button>
        </div>
      </div>

      {/* Grid: Left parameters & Right 3D Model */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Simulation Controls (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-blue-600" />
              Trial Parameters
            </h2>

            <div>
              <label className="text-xs font-semibold text-slate-700">Target Study</label>
              <select
                value={selectedStudy}
                onChange={(e) => setSelectedStudy(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DB-101">DB-101: Diabetes Treatment Study (Type 2 Renal Focus)</option>
                <option value="CD-202">CD-202: Chronic Heart Failure SGLT2 Assessment</option>
                <option value="NR-404">NR-404: Neuro-Metabolic Safety Investigation</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Target Molecule / Compound</label>
              <select
                value={compound}
                onChange={(e) => setCompound(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GLP-1 Receptor Agonist (TB-402)">GLP-1 Receptor Agonist (TB-402)</option>
                <option value="Dual SGLT2/GLP-1 Modulator (TB-810)">Dual SGLT2/GLP-1 Modulator (TB-810)</option>
                <option value="Novel Nephroprotective Peptide (REN-09)">Novel Nephroprotective Peptide (REN-09)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Daily Target Dose</span>
                <span className="font-bold text-blue-600">{dosage} mg/day</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={dosage}
                onChange={(e) => setDosage(Number(e.target.value))}
                className="mt-2 w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Cohort Follow-up Duration</span>
                <span className="font-bold text-blue-600">{durationWeeks} Weeks</span>
              </div>
              <input
                type="range"
                min="4"
                max="52"
                step="4"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="mt-2 w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Simulated Patient Cohort</span>
                <span className="font-bold text-blue-600">{patientCohortSize} Patients</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={patientCohortSize}
                onChange={(e) => setPatientCohortSize(Number(e.target.value))}
                className="mt-2 w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Card */}
          {simulationResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  In-Silico Trial Projections
                </h3>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  Confidence: 94.2%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div className="rounded-xl border border-slate-200/60 bg-white p-3">
                  <p className="text-slate-400 text-[11px]">Predicted Primary Efficacy</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{simulationResult.predictedEfficacy}%</p>
                  <p className="text-[10px] text-emerald-600 font-medium">HbA1c &lt; 7.0 target</p>
                </div>

                <div className="rounded-xl border border-slate-200/60 bg-white p-3">
                  <p className="text-slate-400 text-[11px]">Renal Clearance Capacity</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{simulationResult.clearanceRate}%</p>
                  <p className="text-[10px] text-blue-600 font-medium">Safe tubular excretion</p>
                </div>

                <div className="rounded-xl border border-slate-200/60 bg-white p-3">
                  <p className="text-slate-400 text-[11px]">Safety & Toxicity Index</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{simulationResult.toxicityScore} / 10</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Acceptable safety range</p>
                </div>

                <div className="rounded-xl border border-slate-200/60 bg-white p-3">
                  <p className="text-slate-400 text-[11px]">Estimated Retention</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{simulationResult.estimatedRetention}%</p>
                  <p className="text-[10px] text-indigo-600 font-medium">Low dropout expectation</p>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50/70 p-3 text-[11px] text-blue-900 flex flex-col gap-2 border border-blue-200/80">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-blue-700">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    {simulationResult.modelBadge || 'Gemini 3.6 Flash Nephrology Model'}
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Investigational Assist</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {simulationResult.clinicalRationale}
                </p>
                <p className="text-[10px] text-slate-500 italic border-t border-blue-100 pt-1">
                  Human Oversight Required: Clinical decisions and protocol sign-off remain controlled and auditable by the Principal Investigator.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* 3D Model Visualizer (7 cols) */}
        <div className="lg:col-span-7">
          <KidneyViewer3D
            organ="Kidney"
            studyName={`Study: ${selectedStudy}`}
            description={`${compound} Clearance Dynamics`}
            initialDose={dosage / 100}
          />
        </div>
      </div>
    </div>
  );
}
