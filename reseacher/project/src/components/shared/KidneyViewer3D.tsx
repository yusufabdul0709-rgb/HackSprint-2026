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

// Model loader component
function KidneyModel({ 
  highlightRegion, 
  wireframe, 
  doseImpact,
  autoRotate 
}: { 
  highlightRegion: string | null; 
  wireframe: boolean; 
  doseImpact: number;
  autoRotate: boolean;
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

  // Dynamic visual adjustments based on dose impact and highlight
  React.useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.wireframe = wireframe;
          
          if (highlightRegion) {
            mat.emissive = new THREE.Color(0x3b82f6);
            mat.emissiveIntensity = 0.45;
          } else if (doseImpact > 0) {
            // Visualize drug uptake effect: subtle bioluminescent emission
            mat.emissive = new THREE.Color(0x10b981);
            mat.emissiveIntensity = doseImpact * 0.5;
          } else {
            mat.emissive = new THREE.Color(0x000000);
            mat.emissiveIntensity = 0;
          }
          mesh.material = mat;
        }
      }
    });
  }, [clonedScene, highlightRegion, wireframe, doseImpact]);

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
        <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
        <p className="mt-2 text-xs font-semibold text-slate-700">Loading 3D Renal Model...</p>
        <p className="text-[10px] text-slate-400">Rendering high-res mesh</p>
      </div>
    </Html>
  );
}

export interface KidneyViewer3DProps {
  organ?: string;
  description?: string;
  studyName?: string;
  initialDose?: number;
}

export function KidneyViewer3D({
  description = 'Interactive 3D renal anatomy and clearance dynamics.',
  studyName = 'Clinical Trial Assessment',
  initialDose = 0.65
}: KidneyViewer3DProps) {
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedStructure, setSelectedStructure] = useState<string | null>('Renal Cortex');
  const [dose, setDose] = useState(initialDose);
  const [activeView, setActiveView] = useState<'anterior' | 'posterior' | 'lateral'>('anterior');
  const [activeTab, setActiveTab] = useState<'structures' | 'pharmacokinetics'>('structures');

  const structures = [
    {
      name: 'Renal Cortex',
      role: 'Primary filtration zone containing ~1M nephrons & glomeruli.',
      biomarker: 'eGFR: 88 mL/min/1.73m²',
      relevance: 'Key region for GLP-1 and SGLT2 targeted therapeutics.'
    },
    {
      name: 'Renal Medulla & Pyramids',
      role: 'Urine concentration, loop of Henle, electrolyte exchange.',
      biomarker: 'Osmolality: 650 mOsm/kg',
      relevance: 'Monitored for potential nephrotoxic accumulation during trial.'
    },
    {
      name: 'Renal Pelvis & Calyces',
      role: 'Collecting funnel channeling filtered fluid into ureter.',
      biomarker: 'Clearance rate: Normal',
      relevance: 'Evaluated for fluid retention and crystal precipitation risks.'
    },
    {
      name: 'Renal Artery & Perfusion',
      role: 'High-pressure vascular input supplying ~20% of cardiac output.',
      biomarker: 'Renal Blood Flow: 1.15 L/min',
      relevance: 'Crucial for rapid systemic delivery and pharmacokinetic peak (Cmax).'
    }
  ];

  const currentStruct = structures.find((s) => s.name === selectedStructure) || structures[0];

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-base font-semibold text-slate-900">3D Renal Simulation & Anatomy Lab</h2>
            <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
              WebGL 3D (kidney.glb)
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{studyName} · {description}</p>
        </div>

        {/* View Controls Toolbar */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
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
            <Layers className="h-3.5 w-3.5" />
            {wireframe ? 'Mesh Wireframe' : 'Surface'}
          </Button>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div className="relative mt-4 h-[360px] w-full rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 via-zinc-900 to-black border border-slate-800">
        {/* Floating 3D Canvas */}
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          className="h-full w-full cursor-grab active:cursor-grabbing"
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
          <directionalLight position={[-10, -10, -5]} intensity={0.6} color="#38bdf8" />
          <pointLight position={[0, 5, 0]} intensity={1} color="#ffffff" />
          
          <Suspense fallback={<ModelLoader />}>
            <KidneyModel
              highlightRegion={selectedStructure}
              wireframe={wireframe}
              doseImpact={dose}
              autoRotate={autoRotate}
            />
          </Suspense>

          <OrbitControls 
            enablePan={false}
            minDistance={2.5}
            maxDistance={8}
            rotateSpeed={0.8}
          />
        </Canvas>

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          <div className="flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white border border-white/10">
            <Eye className="h-3 w-3 text-blue-400" />
            Interactive 3D Model: Drag to orbit, scroll to zoom
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] text-emerald-300 border border-emerald-500/20">
            <Sparkles className="h-3 w-3" />
            Biomarker Uptake: {(dose * 100).toFixed(0)}% Perfusion
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
                  ? 'bg-blue-600 text-white shadow-sm'
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
                <span className="font-semibold text-slate-800">Simulated Therapeutic Concentration (GLP-1 / Compound X)</span>
                <span className="font-bold text-blue-600">{(dose * 100).toFixed(0)}% Nominal Dose</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={dose}
                onChange={(e) => setDose(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="rounded-lg bg-white p-2.5 border border-slate-200/70">
                <p className="text-[10px] text-slate-400 font-medium">Predicted Half-life (t½)</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">14.2 Hours</p>
                <span className="text-[10px] text-emerald-600">Stable steady state</span>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-slate-200/70">
                <p className="text-[10px] text-slate-400 font-medium">Renal Elimination</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{((1 - dose * 0.15) * 92).toFixed(1)}%</p>
                <span className="text-[10px] text-blue-600">Within protocol safety</span>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-slate-200/70">
                <p className="text-[10px] text-slate-400 font-medium">Toxicity Index</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">Low (&lt; 0.04)</p>
                <span className="text-[10px] text-emerald-600">Zero tubular injury</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
