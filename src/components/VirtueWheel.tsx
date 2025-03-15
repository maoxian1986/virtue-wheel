import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh } from 'three';

const virtues = ['勤劳', '专注', '善良', '开心', '自信', '平和'];

interface WheelProps {
  position: [number, number, number];
  rotation: number;
  onRotationComplete: (virtue: string) => void;
}

function Wheel({ position, rotation, onRotationComplete }: WheelProps) {
  const meshRef = useRef<Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [lastPosition, setLastPosition] = useState(0);
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    if (!isDragging) {
      // Apply friction when wheel is spinning freely
      if (Math.abs(velocity) > 0.001) {
        setVelocity(velocity * 0.98); // Friction coefficient
        meshRef.current.rotation.z += velocity * delta;
      } else if (velocity !== 0) {
        setVelocity(0);
        // Calculate final virtue
        const currentRotation = meshRef.current.rotation.z;
        const segment = (2 * Math.PI) / virtues.length;
        const index = Math.floor(((currentRotation % (2 * Math.PI)) / segment + 0.5) % virtues.length);
        onRotationComplete(virtues[index]);
      }
    }
  });

  const handlePointerDown = (e: any) => {
    setIsDragging(true);
    setLastPosition(e.clientX);
  };

  const handlePointerMove = (e: any) => {
    if (isDragging && meshRef.current) {
      const delta = e.clientX - lastPosition;
      const rotationDelta = (delta * 0.01);
      meshRef.current.rotation.z += rotationDelta;
      setVelocity(rotationDelta / 0.016); // Approximate delta time
      setLastPosition(e.clientX);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <cylinderGeometry args={[2, 2, 0.1, virtues.length * 4]} />
      <meshStandardMaterial color="#f0f0f0" />
      {virtues.map((virtue, index) => {
        const angle = (index / virtues.length) * Math.PI * 2;
        const x = Math.cos(angle) * 1.5;
        const y = Math.sin(angle) * 1.5;
        return (
          <Html key={virtue} position={[x, y, 0.1]} center>
            <div style={{ color: '#333', fontSize: '20px' }}>{virtue}</div>
          </Html>
        );
      })}
    </mesh>
  );
}

export function VirtueWheel() {
  const [selectedVirtue, setSelectedVirtue] = useState<string | null>(null);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Wheel
          position={[0, 0, 0]}
          rotation={0}
          onRotationComplete={(virtue) => setSelectedVirtue(virtue)}
        />
      </Canvas>
      {selectedVirtue && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          选中的美德：{selectedVirtue}
        </div>
      )}
    </div>
  );
}