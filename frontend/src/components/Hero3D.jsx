import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

const Hero3D = () => {
  return (
    <div className="h-[400px] md:h-[500px] w-full cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[1, 2, 3]} intensity={2} />
        <Sphere args={[1, 100, 200]} scale={1.3}>
          <MeshDistortMaterial 
            color="#9ee2fb" 
            attach="material" 
            distort={0.4} 
            speed={2.5} 
            roughness={0.2} 
          />
        </Sphere>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={3} />
      </Canvas>
    </div>
  );
};
export default Hero3D;
