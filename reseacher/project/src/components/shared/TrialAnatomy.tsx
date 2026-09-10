import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Info,
  Heart,
  Brain,
  Activity,
  Eye,
  Maximize2,
  Layers,
} from 'lucide-react';
import { anatomyData } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface TrialAnatomyProps {
  organ: string;
  description: string;
  studyName: string;
}

export function TrialAnatomy({ organ, description, studyName }: TrialAnatomyProps) {
  const data = anatomyData[organ];
  const [selectedStructure, setSelectedStructure] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const dragStart = useRef<{ x: number; rotation: number } | null>(null);

  useEffect(() => {
    if (data) setSelectedStructure(data.structures.find(s => s.relevant)?.name || null);
  }, [organ, data]);

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200/60 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">Trial Anatomy</h2>
        <p className="text-xs text-slate-500">Anatomical context for this study</p>
        <div className="mt-4 rounded-xl bg-slate-50 p-8 text-center">
          <Info className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-400">Anatomy data not available for this study.</p>
        </div>
      </div>
    );
  }

  const organIcon = organ === 'Heart' ? Heart : organ === 'Brain' ? Brain : organ === 'Immune System' ? Activity : Eye;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, rotation };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    const delta = e.clientX - dragStart.current.x;
    setRotation(dragStart.current.rotation + delta * 0.5);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Trial Anatomy</h2>
          <p className="text-xs text-slate-500">{studyName}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1">
          <Layers className="h-3.5 w-3.5 text-purple-600" />
          <span className="text-xs font-medium text-purple-700">{data.organ}</span>
        </div>
      </div>

      {/* 3D Viewer Placeholder */}
      <div
        className="relative mt-4 flex h-56 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle, #CBD5E1 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Rotating organ visualization */}
        <motion.div
          animate={{ rotate: rotation, scale }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative"
        >
          {/* SVG-based organ placeholder */}
          <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-md">
            <defs>
              <radialGradient id="organGrad" cx="40%" cy="40%">
                <stop offset="0%" stopColor="#F3E8FF" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.7} />
              </radialGradient>
              <radialGradient id="organGradRelevant" cx="40%" cy="40%">
                <stop offset="0%" stopColor="#DBEAFE" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.8} />
              </radialGradient>
            </defs>

            {/* Outer organ shape */}
            <ellipse cx="70" cy="70" rx="52" ry="50" fill="url(#organGrad)" stroke="#A78BFA" strokeWidth="1.5" opacity={0.6} />

            {/* Inner structures */}
            {data.structures.map((s, i) => {
              const angle = (i / data.structures.length) * Math.PI * 2;
              const x = 70 + Math.cos(angle) * 28;
              const y = 70 + Math.sin(angle) * 28;
              const isSelected = selectedStructure === s.name;
              return (
                <circle
                  key={s.name}
                  cx={x}
                  cy={y}
                  r={isSelected ? 10 : 7}
                  fill={s.relevant ? 'url(#organGradRelevant)' : '#CBD5E1'}
                  stroke={isSelected ? '#3B82F6' : 'transparent'}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200"
                  opacity={s.relevant || isSelected ? 1 : 0.5}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStructure(s.name);
                  }}
                />
              );
            })}

            {/* Center label */}
            <text x="70" y="74" textAnchor="middle" className="fill-slate-700 text-[10px] font-semibold pointer-events-none">
              {data.organ}
            </text>
          </svg>
        </motion.div>

        {/* Controls overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setScale((s) => Math.min(s + 0.2, 2)); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 shadow-sm hover:bg-white transition-colors"
          >
            <ZoomIn className="h-4 w-4 text-slate-600" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setScale((s) => Math.max(s - 0.2, 0.5)); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 shadow-sm hover:bg-white transition-colors"
          >
            <ZoomOut className="h-4 w-4 text-slate-600" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setRotation((r) => r + 90); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 shadow-sm hover:bg-white transition-colors"
          >
            <RotateCw className="h-4 w-4 text-slate-600" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 shadow-sm hover:bg-white transition-colors"
          >
            <Maximize2 className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        {/* Drag hint */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1 text-xs text-slate-500 shadow-sm">
          <RotateCw className="h-3 w-3" />
          <span>Drag to rotate</span>
        </div>

        {/* Integration note */}
        <div className="absolute bottom-3 left-3 max-w-[200px] rounded-lg bg-blue-50/90 px-2.5 py-1.5 text-[10px] text-blue-600 shadow-sm">
          3D model integration point: Z-Anatomy / Open Anatomy
        </div>
      </div>

      {/* Structure selector */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {data.structures.map((s) => (
          <button
            key={s.name}
            onClick={() => setSelectedStructure(s.name)}
            className={cn(
              'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
              selectedStructure === s.name
                ? 'bg-blue-100 text-blue-700'
                : s.relevant
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
            )}
          >
            {s.relevant && <span className="mr-1 text-blue-500">●</span>}
            {s.name}
          </button>
        ))}
      </div>

      {/* Info panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="rounded-xl bg-blue-50/50 p-4">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <div>
                  {selectedStructure ? (
                    <>
                      <p className="text-sm font-medium text-slate-800">{selectedStructure}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {data.structures.find((s) => s.name === selectedStructure)?.description}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-slate-600">{data.description}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 border-t border-blue-100 pt-3">
                <p className="text-xs font-medium text-slate-700">Why is this relevant?</p>
                <p className="mt-1 text-xs text-slate-600">{description}</p>
              </div>
              <div className="mt-3 rounded-lg bg-amber-50/60 px-3 py-2">
                <p className="text-[11px] text-amber-700">
                  This information is educational only and is not medical advice. Always consult your healthcare provider.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
