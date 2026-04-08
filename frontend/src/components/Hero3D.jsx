import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Instance, Instances, Environment } from '@react-three/drei';
import * as THREE from 'three';

// ----------------------------------------------------
// 1. Math Engine: generates pure 3D coordinates 
// bounding the actual volume of a Mathematical Heart!
// ----------------------------------------------------
const generateHeartPoints = (count = 500) => {
  const points = [];
  // Taubin heart algorithm bounding generation
  while (points.length < count) {
    const x = (Math.random() - 0.5) * 3;
    const y = (Math.random() - 0.5) * 3;
    const z = (Math.random() - 0.5) * 3;

    const x2 = x * x;
    const y2 = y * y;
    const z2 = z * z;
    const y3 = y * y * y;

    const term1 = x2 + (9 / 4) * z2 + y2 - 1;
    const term2 = x2 * y3;
    const term3 = (9 / 80) * z2 * y3;

    // If point exists inside the 3D Taubin Heart volume, keep it!
    if (Math.pow(term1, 3) - term2 - term3 <= 0) {
      points.push(new THREE.Vector3(x, y, z));
    }
  }
  return points;
};

// ----------------------------------------------------
// 2. Base Mesh: The tiny individual "candy" heart
// ----------------------------------------------------
const getHeartGeometry = () => {
  const shape = new THREE.Shape();
  const x = 0, y = 0;
  shape.moveTo(x + 2.5, y + 2.5);
  shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
  shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
  shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
  shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 5.5, x + 8, y + 3.5);
  shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
  shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

  const extrudeSettings = { depth: 1.5, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 1, bevelThickness: 1 };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  
  // Perfectly center the geometry mapping
  geometry.computeBoundingBox();
  const centerOffset = new THREE.Vector3();
  geometry.boundingBox.getCenter(centerOffset).multiplyScalar(-1);
  geometry.translate(centerOffset.x, centerOffset.y, centerOffset.z);
  
  return geometry;
};

// ----------------------------------------------------
// 3. Child Component: Each tiny floating heart instance
// ----------------------------------------------------
const TinyHeart = ({ position }) => {
  const ref = useRef();
  
  // Randomizer so every single heart wiggles at a different micro-frequency
  const factor = useMemo(() => 0.5 + Math.random(), []);
  
  useFrame((state) => {
    if(ref.current) {
        const t = state.clock.elapsedTime * factor;
        // Apply slight independent micro-vibration
        ref.current.position.y = position.y + Math.sin(t * 3) * 0.03;
    }
  });
  
  return (
    <Instance 
      ref={ref} 
      position={position} 
      // Size randomization to match the requested granular image texture
      scale={0.035 + Math.random() * 0.025} 
      // Ensure all 2D extrusions generally face the camera but with organic jiggle parameters
      rotation={[Math.PI, 0, Math.random() * 0.4 - 0.2]} 
    />
  );
};

// ----------------------------------------------------
// 4. Container Component: The Massive Heart Cloud
// ----------------------------------------------------
const BigHeartCloud = () => {
  const points = useMemo(() => generateHeartPoints(450), []);
  const geom = useMemo(() => getHeartGeometry(), []);
  const groupRef = useRef();
  
  // The macro heartbeat math that pumps the whole cluster as one unit
  useFrame((state) => {
    if (groupRef.current) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.03;
        groupRef.current.scale.set(pulse, pulse, pulse);
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={1.8} position={[0, -0.6, 0]}>
      {/* High Performance R3F Instances to render 450 meshes securely with 1 draw call */}
      <Instances 
        range={450} 
        material={
           new THREE.MeshStandardMaterial({ 
             color: '#E11D48',         // Deep Candy Apple Red!
             roughness: 0.1,           // Extremely glossy
             metalness: 0.2,           // Shiny highlights 
             side: THREE.DoubleSide
           })
        } 
        geometry={geom}
      >
        {points.map((p, i) => (
          <TinyHeart key={i} position={p} />
        ))}
      </Instances>
    </group>
  );
};

const Hero3D = () => {
  return (
    <div className="h-[400px] md:h-[500px] w-full cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-700">
      <Canvas camera={{ position: [0, 0, 5.5] }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 5]} intensity={3} />
        <directionalLight position={[-5, 5, -5]} intensity={1} />
        
        {/* Photorealistic Lighting Reflections to make the red hearts "shiny" */}
        <Environment preset="city" />

        {/* 100% Procedurally Generated 3D Asset ! */}
        <BigHeartCloud />

        {/* OrbitControls guarantees rotation & cursor drag! */}
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2.5} />
      </Canvas>
    </div>
  );
};

export default Hero3D;
