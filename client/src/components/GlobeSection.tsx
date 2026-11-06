import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';



const Globe = () => {
  const globeRef = useRef<THREE.Mesh>(null);
  // High-res daylight earth texture for a realistic look
  const colorMap = useLoader(THREE.TextureLoader, 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
  
  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.1; // Very slow and natural rotation
    }
  });

  return (
    <group>
      {/* The Globe */}
      <Sphere ref={globeRef} args={[1.5, 64, 64]}>
        <meshStandardMaterial
          map={colorMap}
          color="#D4A853"
          emissive="#2a1f0a"
          metalness={0.4}
          roughness={0.6}
        />
      </Sphere>
      
      {/* Atmospheric Glow */}
      <Sphere args={[1.55, 32, 32]}>
        <meshBasicMaterial 
          color="#D4A853" 
          transparent 
          opacity={0.15} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </group>
  );
};

export default function GlobeSection() {
  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-center justify-center bg-[var(--theme-background)] overflow-hidden py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-10 pointer-events-none" />
      
      <div className="container relative z-20 mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Text Content (No longer covering the globe) */}
        <div className="flex flex-col justify-center text-center md:text-right" dir="ltr">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--theme-primary)] mb-6 tracking-wide uppercase drop-shadow-lg font-serif">
            World-Class Destinations
          </h2>
          <p className="text-base md:text-xl text-white/80 font-light leading-relaxed mb-8 max-w-xl mx-auto md:mx-0 md:ml-auto">
            Embark on an unforgettable journey with Vanir Group. Explore the majestic wonders of Egypt and beyond. We bring the world closer to you.
          </p>
          <div className="flex justify-center md:justify-end">
            <Button className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] text-black font-semibold rounded-full px-8 py-6 text-lg transition-all duration-300 transform hover:scale-105 shadow-xl shadow-[var(--theme-primary)]/20">
              Start Exploring <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Right Side: The Interactive 3D Globe */}
        <div className="relative w-full h-[400px] md:h-[600px] lg:h-[700px] flex items-center justify-center">
          {/* Soft glow behind the globe */}
          <div className="absolute inset-0 m-auto w-[60%] h-[60%] bg-[var(--theme-primary)]/20 blur-[100px] rounded-full pointer-events-none" />
          
          <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} gl={{ alpha: true }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
            <pointLight position={[-10, -10, -5]} color="#D4A853" intensity={1} />
            
            <Globe />
            
            <Stars radius={100} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />
            
            <OrbitControls 
              enableZoom={false}
              enablePan={false}
              enableRotate={true}
              autoRotate={false} 
              enableDamping={true}
              dampingFactor={0.05}
              rotateSpeed={0.5}
            />
          </Canvas>
        </div>
        
      </div>
    </section>
  );
}
