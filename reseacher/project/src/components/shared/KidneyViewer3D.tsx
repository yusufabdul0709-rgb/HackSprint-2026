import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCw,
  Layers,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Helper to detect if a mesh is part of the kidneys / renal organ
const isKidneyOrgan = (name: string) => {
  const n = name.toLowerCase();
  return (
    n.includes('kidney') ||
    n.includes('renal') ||
    n.includes('nephr')
  );
};

// Model loader component
function KidneyModel({ 
  highlightRegion, 
  wireframe, 
  doseImpact,
  autoRotate,
  isolateKidneys,
  tissueOpacity
}: { 
  highlightRegion: string | null; 
  wireframe: boolean; 
  doseImpact: number;
  autoRotate: boolean;
  isolateKidneys: boolean;
  tissueOpacity: number;
}) {
  const { scene } = useGLTF('/kidney.glb');
  const groupRef = useRef<THREE.Group>(null);

  // Clone scene so modifications don't mutate cache permanently
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  // Dynamic visual adjustments:
  // Affected organ (Kidneys) highlighted as RED color; remaining anatomy normal
  React.useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const isKidney = isKidneyOrgan(mesh.name);

        if (isKidney) {
          // AFFECTED PART: Kidneys highlighted in vivid RED color
          const redMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#ef4444'), // Red
            emissive: new THREE.Color('#dc2626'), // Emissive red glow
            emissiveIntensity: 0.85 + (doseImpact * 0.25),
            roughness: 0.3,
            metalness: 0.15,
            wireframe: wireframe,
          });
          mesh.material = redMat;
          mesh.visible = true;
        } else {
          // REMAINING PART: Normal anatomical appearance with tissue context
          if (isolateKidneys) {
            mesh.visible = false;
          } else {
            mesh.visible = true;
            if (mesh.material) {
              const normalMat = (mesh.material as THREE.MeshStandardMaterial).clone();
              normalMat.wireframe = wireframe;
              normalMat.emissive = new THREE.Color(0x000000);
              normalMat.emissiveIntensity = 0;
              normalMat.transparent = true;
              normalMat.opacity = tissueOpacity;
              mesh.material = normalMat;
            }
          }
        }
      }
    });
  }, [clonedScene, highlightRegion, wireframe, doseImpact, isolateKidneys, tissueOpacity]);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      <Center>
        <primitive object={clonedScene} scale={2.8} />
      </Center>
    </group>
  );
}

// Fallback loader for 3D model
function ModelLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-md">
        <RefreshCw className="h-6 w-6 text-red-600 animate-spin" />
        <p className="mt-2 text-xs font-semibold text-slate-700">Loading 3D Kidney Model...</p>
        <p className="text-[10px] text-slate-400">Rendering kidney.glb with red highlights</p>
      </div>
    </Html>
  );
}

export interface KidneyViewer3DProps {
  organ?: string;
  description?: string;
  studyName?: string;
  initialDose?: number;
  formula?: string;
  condition?: string;
}

export function KidneyViewer3D({
  description = 'Affected part (Kidneys) highlighted in red for Type 2 Diabetes molecular trial.',
  studyName = 'Type 2 Diabetes Study',
  initialDose = 0.65,
  formula = 'C₄H₁₁N₅',
  condition = 'Type 2 Diabetes'
}: KidneyViewer3DProps) {
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isolateKidneys, setIsolateKidneys] = useState(false);
  const [tissueOpacity, setTissueOpacity] = useState(0.35);
  const [selectedStructure, setSelectedStructure] = useState<string | null>('Renal Cortex');
  const [dose, setDose] = useState(initialDose);
  const [activeView, setActiveView] = useState<'anterior' | 'posterior' | 'lateral'>('anterior');
  const [activeTab, setActiveTab] = useState<'structures' | 'pharmacokinetics'>('structures');

  const structures = [
    {
      name: 'Renal Cortex',
      role: 'Primary glomerular filtration zone receiving C4H11N5 (Metformin).',
      biomarker: 'eGFR: 88 mL/min/1.73m²',
      relevance: 'Target region for filtration and glucose homeostasis.'
    },
    {
      name: 'Renal Medulla & Pyramids',
      role: 'Proximal tubular secretion via Organic Cation Transporters (OCT2/MATE1).',
      biomarker: 'Tubular Secretion: Active',
      relevance: 'Key site where C4H11N5 is actively excreted unchanged in urine.'
    },
    {
      name: 'Renal Pelvis & Calyces',
      role: 'Urine collection chamber draining cleared drug metabolites.',
      biomarker: 'Urinary Clearance: 90% in 24h',
      relevance: 'Monitored for rapid unchanged drug clearance without crystal formation.'
    },
    {
      name: 'Renal Artery & Perfusion',
      role: 'High-volume vascular supply delivering systemic C4H11N5.',
      biomarker: 'Renal Blood Flow: 1.18 L/min',
      relevance: 'Determines peak plasma exposure (Cmax) and safe tissue distribution.'
    }
  ];

  const currentStruct = structures.find((s) => s.name === selectedStructure) || structures[0];

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-base font-semibold text-slate-900">3D Simulation: Kidneys (Affected Target)</h2>
            <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold text-red-700">
              Red Highlighted Organ
            </span>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-mono font-bold text-blue-700">
              Formula: {formula}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {studyName} · {condition} · Kidneys highlighted in red, remaining anatomy normal
          </p>
        </div>

        {/* View Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
          <Button
            size="sm"
            variant={isolateKidneys ? 'default' : 'outline'}
            onClick={() => setIsolateKidneys(!isolateKidneys)}
            className="h-8 text-xs gap-1.5"
            title="Toggle Kidneys Only vs Full Anatomical Context"
          >
            <Layers className="h-3.5 w-3.5" />
            {isolateKidneys ? 'Kidneys Only' : 'Show Context'}
          </Button>

          <Button
            size="sm"
            variant={autoRotate ? 'default' : 'outline'}
            onClick={() => setAutoRotate(!autoRotate)}
            className="h-8 text-xs gap-1.5"
            title="Toggle Continuous Rotation"
          >
            <RotateCw className={cn('h-3.5 w-3.5', autoRotate && 'animate-spin')} />
            {autoRotate ? 'Spinning' : 'Paused'}
          </Button>

          <Button
            size="sm"
            variant={wireframe ? 'secondary' : 'outline'}
            onClick={() => setWireframe(!wireframe)}
            className="h-8 text-xs gap-1.5"
            title="Toggle Mesh Wireframe"
          >
            {wireframe ? 'Wireframe' : 'Surface'}
          </Button>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div className="relative mt-4 h-[380px] w-full rounded-xl overflow-hidden bg-gradient-to-b from-slate-950 via-zinc-900 to-black border border-slate-800">
        {/* Floating 3D Canvas */}
        <Canvas
          camera={{ position: [0, 0, 5.2], fov: 45 }}
          className="h-full w-full cursor-grab active:cursor-grabbing"
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[10, 10, 5]} intensity={1.8} castShadow />
          <directionalLight position={[-10, -10, -5]} intensity={0.7} color="#ef4444" />
          <pointLight position={[0, 4, 0]} intensity={1.2} color="#ffffff" />
          
          <Suspense fallback={<ModelLoader />}>
            <KidneyModel
              highlightRegion={selectedStructure}
              wireframe={wireframe}
              doseImpact={dose}
              autoRotate={autoRotate}
              isolateKidneys={isolateKidneys}
              tissueOpacity={tissueOpacity}
            />
          </Suspense>

          <OrbitControls 
            enablePan={false}
            minDistance={2.2}
            maxDistance={8.5}
            rotateSpeed={0.8}
          />
        </Canvas>

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          <div className="flex items-center gap-1.5 rounded-lg bg-black/75 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white border border-red-500/40 shadow-lg">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>Effected Part: <strong>Kidneys (Highlighted Red)</strong></span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] text-zinc-300 border border-white/10">
            <span>Remaining Anatomy: Normal tissues</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] text-blue-300 border border-blue-500/20">
            <Sparkles className="h-3 w-3" />
            Active Compound: Metformin ({formula})
          </div>
        </div>

        {/* Floating Camera View Buttons */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-lg border border-white/10">
          {(['anterior', 'posterior', 'lateral'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={cn(
                'px-2.5 py-1 rounded text-[10px] font-medium capitalize transition-all',
                activeView === view
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-300 hover:bg-white/10'
              )}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Structure & Clinical Tabs */}
      <div className="mt-4 space-y-3">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('structures')}
            className={cn(
              'pb-2 text-xs font-semibold px-3 border-b-2 transition-colors',
              activeTab === 'structures'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            )}
          >
            Anatomical Substructures
          </button>
          <button
            onClick={() => setActiveTab('pharmacokinetics')}
            className={cn(
              'pb-2 text-xs font-semibold px-3 border-b-2 transition-colors',
              activeTab === 'pharmacokinetics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            )}
          >
            Dose & Pharmacokinetic Response
          </button>
        </div>

        {activeTab === 'structures' && (
          <div className="space-y-3">
            {/* Quick selector pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {structures.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setSelectedStructure(s.name)}
                  className={cn(
                    'p-2.5 rounded-xl border text-left transition-all',
                    selectedStructure === s.name
                      ? 'border-blue-300 bg-blue-50/50 ring-1 ring-blue-200'
                      : 'border-slate-200/60 bg-slate-50/50 hover:bg-slate-100'
                  )}
                >
                  <p className="text-xs font-semibold text-slate-900">{s.name}</p>
                  <p className="text-[10px] text-blue-600 font-medium mt-0.5">{s.biomarker}</p>
                </button>
              ))}
            </div>

            {/* Selected structure detail panel */}
            <motion.div
              key={currentStruct.name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-blue-100 bg-blue-50/30 p-3.5 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">{currentStruct.name}</span>
                <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                  {currentStruct.biomarker}
                </span>
              </div>
              <p className="text-slate-600">{currentStruct.role}</p>
              <div className="pt-1 flex items-center gap-1.5 text-emerald-700 text-[11px] font-medium">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Protocol Relevance: {currentStruct.relevance}</span>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'pharmacokinetics' && (
          <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-xs">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="font-semibold text-slate-800">Simulated Renal Clearance & Concentration (Metformin · C₄H₁₁N₅)</span>
                <span className="font-bold text-red-600">{(dose * 100).toFixed(0)}% Nominal Dose</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={dose}
                onChange={(e) => setDose(parseFloat(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="rounded-lg bg-white p-2.5 border border-slate-200/70">
                <p className="text-[10px] text-slate-400 font-medium">Clearance Pathway</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">Renal (90% unch.)</p>
                <span className="text-[10px] text-emerald-600 font-medium">Via OCT2 / MATE transporters</span>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-slate-200/70">
                <p className="text-[10px] text-slate-400 font-medium">Glomerular Filtration Safety</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{((1 - dose * 0.1) * 94).toFixed(1)}% eGFR</p>
                <span className="text-[10px] text-blue-600 font-medium">No tubular injury detected</span>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-slate-200/70">
                <p className="text-[10px] text-slate-400 font-medium">C₄H₁₁N₅ Accumulation Risk</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">Low (&lt; 0.02)</p>
                <span className="text-[10px] text-emerald-600 font-medium">Zero lactic acidosis risk</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
