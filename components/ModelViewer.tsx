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
import { Suspense, useRef, useState, useEffect } from 'react';
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

// Kamerayı modele odaklayan Slicer mekanizması
function CameraRig({ size }: { size: THREE.Vector3 }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (size.length() > 0) {
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim * 2.2; 

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

// Modelin fiziksel özelliklerini ve yerleşimini yöneten bileşen
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
        // Modeli tablanın (0,0,0) noktasına tam oturtur
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
          /* --- MAT FILAMENT DOKUSU (GERÇEKÇİ SLICER HİSSİ) --- */
          roughness={0.85}       
          metalness={0.0}        
          emissive={"#000000"}   
          envMapIntensity={0.2}  
        />
      </mesh>

      {size.length() > 0 && (
        <ContactShadows 
          position={[0, 0, 0]} 
          opacity={0.4} 
          scale={Math.max(size.x, size.z) * 4} 
          blur={2.5} 
          far={size.y * 1.5} 
        />
      )}
    </group>
  );
}

// ANA BİLEŞEN
export default function ModelViewer({ geometry, color }: ViewerProps) {
  // Model yoksa gösterilecek boş platform (Empty Bed)
  if (!geometry) return (
    <div className="w-full h-[550px] flex flex-col items-center justify-center bg-[#0f172a] rounded-[3rem] border-2 border-slate-800 relative overflow-hidden group">
      <div className="absolute inset-0 opacity-[0.1] bg-[linear-gradient(to_right,#475569_1px,transparent_1px),linear-gradient(to_bottom,#475569_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="text-6xl mb-4 grayscale opacity-30 group-hover:rotate-12 transition-transform duration-700">⚙️</div>
      <p className="font-black text-slate-600 uppercase tracking-[0.4em] text-[10px]">ANYCUBIC PLATFORM READY</p>
    </div>
  );

  return (
    <div className="w-full h-[550px] bg-[#1a1c1e] rounded-[3rem] overflow-hidden border border-slate-300 shadow-2xl relative group">
      {/* Teknik Bilgi Overlay */}
      <div className="absolute top-6 left-6 z-10 space-y-2">
        <div className="bg-blue-600/90 backdrop-blur-md px-4 py-1.5 rounded-xl border border-blue-400/30 shadow-lg">
          <p className="text-[9px] font-black uppercase text-white tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            MEMONEX ANALYZER ENGINE V5
          </p>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="w-full h-full bg-[#1a1c1e] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500" />
        </div>
      }>
        <Canvas 
          shadows 
          gl={{ 
            antialias: true,
            toneMapping: THREE.NoToneMapping, // Renkleri olduğu gibi (saf) verir
            powerPreference: "high-performance" 
          }}
        >
          {/* Teknik Koyu Arka Plan */}
          <color attach="background" args={['#c7cfd6']} />
          
          <PerspectiveCamera makeDefault fov={40} position={[250, 250, 250]} />
          
          <Environment preset="city" /> 
          <ambientLight intensity={0.7} /> 
          
          {/* Üretim Aydınlatması */}
          <spotLight position={[500, 500, 500]} intensity={1.2} angle={0.3} penumbra={1} castShadow />
          <pointLight position={[-500, 300, -500]} intensity={0.4} color="#3b82f6" />
          <hemisphereLight intensity={0.2} color="#ffffff" groundColor="#000000" />

          <ModelManager geometry={geometry} color={color} />
          
          {/* TEKNİK IZGARA (ANYCUBIC TABLASI GİBİ) */}
          <Grid 
            args={[500, 500]} 
            cellSize={10} 
            cellColor="#ebeff0" 
            cellThickness={1}
            sectionSize={50} 
            sectionColor="#ebeff0" 
            sectionThickness={1.5}
            fadeDistance={1000}
            infiniteGrid={false}
            position={[0, -0.01, 0]}
          />

          {/* EKSEN GÖSTERGESİ (GIZMO) */}
          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport axisColors={['#ff3e3e', '#32cd32', '#3b82f6']} labelColor="white" />
          </GizmoHelper>

          <OrbitControls 
            makeDefault 
            maxPolarAngle={Math.PI / 2.1} 
            enableDamping 
            dampingFactor={0.1}
            minDistance={50}
            maxDistance={1500}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}