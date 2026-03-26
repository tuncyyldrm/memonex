'use client';

import { Canvas, useThree, ThreeElements } from '@react-three/fiber';
import { 
  OrbitControls, 
  Grid, 
  ContactShadows, 
  Environment, 
  PerspectiveCamera, 
  GizmoHelper, 
  GizmoViewport 
} from '@react-three/drei';
import { Suspense, useRef, useState, useEffect, useTransition } from 'react';
import * as THREE from 'three';

// --- TYPESCRIPT TANIMLAMALARI ---
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      color: ThreeElements['color'] & { attach?: string; args?: any[] };
      ambientLight: ThreeElements['ambientLight'];
      spotLight: ThreeElements['spotLight'];
      pointLight: ThreeElements['pointLight'];
      group: ThreeElements['group'];
      mesh: ThreeElements['mesh'];
      meshStandardMaterial: ThreeElements['meshStandardMaterial'];
    }
  }
}

interface ViewerProps {
  geometry: THREE.BufferGeometry | null;
  color: string;
}

function CameraRig({ size }: { size: THREE.Vector3 }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (size.length() > 0) {
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim * 2.5; 

      camera.position.set(distance, distance, distance);
      camera.lookAt(0, size.y / 2, 0);
      
      if (controls) {
        (controls as any).target.set(0, size.y / 2, 0);
        (controls as any).update();
      }
    }
  }, [size, camera, controls]);

  return null;
}

function ModelManager({ geometry, color }: { geometry: THREE.BufferGeometry, color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [size, setSize] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (geometry) {
      geometry.computeBoundingBox();
      geometry.computeVertexNormals();
      const boundingBox = geometry.boundingBox!;
      const newSize = new THREE.Vector3();
      boundingBox.getSize(newSize);
      setSize(newSize);
      
      if (meshRef.current) {
        meshRef.current.position.y = newSize.y / 2;
      }
    }
  }, [geometry]);

  return (
    <group>
      <CameraRig size={size} />

      <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial 
          color={color} 
          roughness={0.7}       // Işığı dengeli dağıtan mat doku
          metalness={0.1}       // Hafif plastik pırıltısı
          emissive={"#000000"}   
          envMapIntensity={0.5} // Açık temada çevreyi daha iyi yansıtır
        />
      </mesh>

      {size.length() > 0 && (
        <ContactShadows 
          position={[0, 0, 0]} 
          opacity={0.25}       // Açık zeminde daha yumuşak gölge
          scale={Math.max(size.x, size.z) * 4} 
          blur={3} 
          far={size.y * 2} 
        />
      )}
    </group>
  );
}

export default function ModelViewer({ geometry, color }: ViewerProps) {
  const [isPending, startTransition] = useTransition();
  if (!geometry) return (
    <div className="w-full h-[550px] flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 relative overflow-hidden group">
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[size:20px_20px]" />
      <div className="text-6xl mb-4 grayscale opacity-20 group-hover:scale-110 transition-transform duration-500">📦</div>
      <p className="font-black text-slate-400 uppercase tracking-[0.4em] text-[10px]">Model Analizi Bekleniyor</p>
    </div>
  );

  return (
    <div className="w-full h-[550px] bg-[#f8fafc] rounded-[3rem] overflow-hidden border border-slate-200 shadow-xl relative group touch-none">
      {/* Teknik Bilgi Overlay */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-sm transition-all group-hover:translate-x-1">
          <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            MEMONEX STUDIO V5
          </p>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="w-full h-full bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600" />
        </div>
      }>
          <Canvas 
            shadows 
            frameloop="demand" 
            gl={{ 
              antialias: false,
              powerPreference: "high-performance",
              stencil: false,
              depth: true
            }}
            dpr={[1, 2]}
            // --- ÇÖZÜM 1: CANVAS SEVİYESİNDE EVENT ENGELLEME ---
            onCreated={(state) => {
              const gl = state.gl.domElement;
              // Fare tekerleği Canvas üzerindeyken sayfanın kaymasını engeller
              gl.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
            }}
          >
          {/* Aydınlık Arka Plan (Soft Gri-Mavi) */}
          <color attach="background" args={['#b5c4d3']} />
          
          <PerspectiveCamera makeDefault fov={38} position={[250, 250, 250]} />
          
          <Environment preset="city" /> 
          <ambientLight intensity={0.8} /> 
          
          {/* Stüdyo Tipi Aydınlatma */}
          <spotLight position={[400, 400, 400]} intensity={1} angle={0.3} penumbra={1} castShadow />
          <pointLight position={[-400, 200, -400]} intensity={0.5} color="#ffffff" />

          <ModelManager geometry={geometry} color={color} />
          
          {/* AÇIK RENK TEKNİK IZGARA */}
          <Grid 
            args={[600, 600]} 
            cellSize={10} 
            cellColor="#7995b6" 
            cellThickness={0.5}
            sectionSize={50} 
            sectionColor="#556782" 
            sectionThickness={1}
            fadeDistance={800}
            infiniteGrid={false}
            position={[0, -0.01, 0]}
          />

          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="#64748b" />
          </GizmoHelper>

          <OrbitControls 
            makeDefault 
            maxPolarAngle={Math.PI / 2.1} 
            enableDamping 
            dampingFactor={0.08}
            enableZoom={true} 
            // --- ÇÖZÜM 2: OVERFLOW HIDDEN'I KALDIRDIK ---
            // Buradaki onStart ve onEnd fonksiyonlarını tamamen temizledik 
            // Böylece sağ bar kaybolmayacak ve titreme olmayacak.
          />
        </Canvas>
      </Suspense>
    </div>
  );
}