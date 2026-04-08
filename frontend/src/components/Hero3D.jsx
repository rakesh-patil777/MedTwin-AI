import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// ----------------------------------------------------
// 1. Procedural Heart Asset (Matches 2D Image Concept)
// ----------------------------------------------------
const HeartShape = () => {
  const geom = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 2.5, y + 2.5);
    shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 5.5, x + 8, y + 3.5);
    shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

    const extrudeSettings = { depth: 1.5, bevelEnabled: true, bevelSegments: 4, steps: 2, bevelSize: 0.5, bevelThickness: 0.5 };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // Center it
    geometry.computeBoundingBox();
    const centerOffset = new THREE.Vector3();
    geometry.boundingBox.getCenter(centerOffset).multiplyScalar(-1);
    geometry.translate(centerOffset.x, centerOffset.y, centerOffset.z);
    
    return geometry;
  }, []);

  return (
    <mesh geometry={geom} scale={0.35} rotation={[Math.PI, 0, 0]} position={[-0.5, 0.5, 0]}>
      <meshStandardMaterial color="#eb5b5b" roughness={0.2} metalness={0.1} />
    </mesh>
  );
};

// ----------------------------------------------------
// 2. Procedural Stethoscope Asset (Wrapped around Heart)
// ----------------------------------------------------
const Stethoscope = () => {
    return (
        <group position={[0.8, -0.5, 1.2]} rotation={[0, 0, Math.PI / 8]}>
            {/* The Main Light Green Tubing Loop */}
            <mesh position={[-1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
               <torusGeometry args={[2.2, 0.25, 16, 100, Math.PI * 1.6]} />
               <meshStandardMaterial color="#9ff0c9" roughness={0.4} />
            </mesh>
            
            {/* The Chest-Piece (Dark Green disc on the Heart) */}
            <mesh position={[-3.1, -0.2, 0.2]} rotation={[0.2, Math.PI/2, 0]}>
               <cylinderGeometry args={[0.7, 0.7, 0.3, 32]} />
               <meshStandardMaterial color="#00C853" roughness={0.2} metalness={0.5} />
            </mesh>

            {/* Inner green detail on chest piece */}
            <mesh position={[-3.1, 0, 0.2]} rotation={[0.2, Math.PI/2, 0]}>
               <cylinderGeometry args={[0.4, 0.4, 0.35, 32]} />
               <meshStandardMaterial color="#9ff0c9" roughness={0.3} />
            </mesh>

            {/* Top Y-Junction Tubing connecting to Earpieces */}
            <mesh position={[1, 2.2, 0]} rotation={[0, 0, Math.PI / 12]}>
                <torusGeometry args={[0.8, 0.15, 16, 100, Math.PI]} />
                <meshStandardMaterial color="#00C853" roughness={0.4} />
            </mesh>

            {/* Earpiece Tips */}
            <mesh position={[0.2, 2.2, 0]}>
               <sphereGeometry args={[0.25, 16, 16]} />
               <meshStandardMaterial color="#00C853" />
            </mesh>
            <mesh position={[1.8, 2.2, 0]}>
               <sphereGeometry args={[0.25, 16, 16]} />
               <meshStandardMaterial color="#00C853" />
            </mesh>
        </group>
    );
};

// ----------------------------------------------------
// 3. Mathematical Animation Engine (Auto-Rotate + Mouse Movement)
// ----------------------------------------------------
const Composition = () => {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // 1. Base Automatic Continious Rotation
    const autoRotateX = Math.sin(time * 0.8) * 0.1;
    const autoRotateY = time * 0.4;
    
    // 2. Dynamic Cursor Integration (Mapping Mouse X/Y to Tilt Values)
    // state.pointer holds normalized mouse coords from -1 to 1 based on canvas size
    const targetX = state.pointer.x * 0.6; 
    const targetY = -state.pointer.y * 0.6;

    // Smoothly interpolate the Rotation Physics combining Both!
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, autoRotateY + targetX, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, autoRotateX + targetY, 0.05);
    
    // Subtle float logic specific to the model bundle
    groupRef.current.position.y = Math.sin(time * 2) * 0.1;
  });

  return (
    <group ref={groupRef}>
         <HeartShape />
         <Stethoscope />
    </group>
  );
};

// ----------------------------------------------------
// 4. Scene Render Controller
// ----------------------------------------------------
const Hero3D = () => {
  return (
    <div className="h-[400px] md:h-[500px] w-full cursor-crosshair">
      <Canvas camera={{ position: [0, 0, 8.5], fov: 45 }}>
        {/* Soft, premium lighting complementing Beige/Green palette */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={3} color="#ffffff" />
        <directionalLight position={[-10, -5, -5]} intensity={1.5} color="#faf0e6" />
        
        {/* Generates realistic glossary specular mapping */}
        <Environment preset="studio" />

        <Composition />
        
        {/* Beautiful projected grounding shadow onto the #faf0e6 background */}
        <ContactShadows 
           position={[0, -3.5, 0]} 
           opacity={0.35} 
           scale={10} 
           blur={2.5} 
           far={4} 
           color="#a89b8d" 
        />
      </Canvas>
    </div>
  );
};

export default Hero3D;
