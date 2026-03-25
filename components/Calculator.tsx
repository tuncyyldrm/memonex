'use client';

import { Canvas, useThree, ThreeElements } from '@react-three/fiber';
import { OrbitControls, Grid, Html, ContactShadows, Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// --- TYPESCRIPT GLOBAL JSX TANIMLAMASI ---
// 'color', 'mesh' gibi etiketlerin TypeScript tarafından tanınmasını sağlar.
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

// Kamerayı modele otomatik odaklayan yardımcı bileşen
function CameraRig({ size }: { size: THREE.Vector3 }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (size.length() > 0) {
      // Modelin en büyük boyutuna göre mesafe (v4.2 optimize)
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim * 2.5; 

      camera.position.set(distance, distance, distance);
      camera.lookAt(0, size.y / 2, 0);
      
      if (controls) {
        // @ts-ignore - OrbitControls target erişimi
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
      
      // ÖNEMLİ: Geometry döndüğünde merkezi ve taban hizasını yeniler
      const boundingBox = geometry.boundingBox!;
      const newSize = new THREE.Vector3();
      boundingBox.getSize(newSize);
      setSize(newSize);
      
      if (meshRef.current) {
        // Modeli tam olarak tablanın (grid) üzerine oturtur
        meshRef.current.position.y = newSize.y / 2;
      }
    }
  }, [geometry]);

  const Label = ({ pos, text, axis }: { pos: [number, number, number], text: string, axis: string }) => (
    <Html 
      position={pos} 
      center 
      distanceFactor={80} 
      style={{ transition: 'all 0.2s' }}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md border-2 border-slate-200 rounded-xl shadow-2xl pointer-events-none select-none scale-125">
        <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-md text-white shadow-sm ${
          axis === 'X' ? 'bg-red-500' : axis === 'Y' ? 'bg-green-500' : 'bg-blue-500'
        }`}>
          {axis}
        </span>
        <span className="text-slate-900 font-black text-[13px] whitespace-nowrap leading-none tracking-tight">
          {text}mm
        </span>
      </div>
    </Html>
  );

  return (
    <group>
      <CameraRig size={size} />
      <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial 
          color={color} 
          roughness={0.4} 
          metalness={0.5} 
          emissive={color}
          emissiveIntensity={0.05}
        />
      </mesh>

      {size.length() > 0 && (
        <>
          <Label pos={[size.x / 2 + 10, size.y / 2, 0]} text={size.x.toFixed(1)} axis="X" />
          <Label pos={[0, size.y + 15, 0]} text={size.y.toFixed(1)} axis="Y" />
          <Label pos={[0, size.y / 2, size.z / 2 + 10]} text={size.z.toFixed(1)} axis="Z" />
          
          <ContactShadows 
            position={[0, 0, 0]} 
            opacity={0.6} 
            scale={Math.max(size.x, size.z) * 3} 
            blur={2.5} 
            far={size.y * 2} 
          />
        </>
      )}
    </group>
  );
}

export default function ModelViewer({ geometry, color }: ViewerProps) {
  if (!geometry) return (
    <div className="w-full h-full min-h-[550px] flex flex-col items-center justify-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200 overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="text-9xl mb-6 opacity-20 animate-pulse">🧊</div>
      <span className="italic font-black text-slate-300 text-2xl uppercase tracking-[0.2em]">Analiz İçin Model Yükleyin</span>
    </div>
  );

  return (
    <div className="w-full h-[550px] md:h-[700px] bg-white rounded-[4rem] overflow-hidden border border-slate-200 shadow-2xl relative">
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <div className="bg-slate-900/95 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-3 shadow-xl">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          Baskı Tablası Simülasyonu
        </div>
      </div>
      
      <Suspense fallback={null}>
        <Canvas 
          shadows 
          gl={{ 
            antialias: true, 
            toneMapping: THREE.ACESFilmicToneMapping,
            powerPreference: "high-performance" 
          }}
        >
          <color attach="background" args={['#f8fafc']} />
          <PerspectiveCamera makeDefault fov={35} near={0.1} far={10000} />
          
          <Environment preset="city" />
          <ambientLight intensity={0.6} />
          <spotLight position={[500, 500, 500]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
          <pointLight position={[-500, 200, -500]} intensity={0.5} />

          <ModelManager geometry={geometry} color={color} />
          
          <Grid 
            position={[0, 0, 0]} 
            args={[500, 500]} 
            cellSize={10} 
            cellColor="#cbd5e1" 
            sectionSize={100} 
            sectionColor="#3b82f6" 
            fadeDistance={1000} 
            infiniteGrid
          />

          <OrbitControls 
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2}
            enableDamping={true}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}