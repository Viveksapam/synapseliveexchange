import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Procedurally generate a high-quality radial gradient texture for round glowing stars
const createCircleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

// Glowing flying light node
function FlyingLightNode({ data }) {
  const meshRef = useRef();
  const innerMatRef = useRef();
  const outerMatRef = useRef();
  const lightRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Z position moves forward (towards the camera)
    let z = data.initialZ + (time * data.speedZ * 10);
    // Cycle Z in the range [-35, 5]
    const range = 40;
    z = ((z - (-35)) % range) + (-35);
    
    // Orbit around Z axis
    const angle = time * data.spiralSpeed + data.phase;
    let x = Math.sin(angle) * data.radius;
    let y = Math.cos(angle) * data.radius;
    
    // Add organic wobble
    x += Math.sin(time * data.wobbleSpeedX) * data.wobbleAmp;
    y += Math.cos(time * data.wobbleSpeedY) * data.wobbleAmp;

    // Calculate fade in / fade out to prevent popping at limits
    let opacityVal = 1.0;
    if (z < -25) {
      // Fade in from Z = -35 to -25
      opacityVal = (z - (-35)) / 10;
    } else if (z > 0) {
      // Fade out from Z = 0 to 5
      opacityVal = (5 - z) / 5;
    }
    opacityVal = Math.max(0, Math.min(1, opacityVal));

    if (meshRef.current) {
      meshRef.current.position.set(x, y, z);
      const pulse = 1 + Math.sin(time * 3.5 + data.id) * 0.15;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }

    // Direct mutation of materials for top performance
    if (innerMatRef.current) {
      innerMatRef.current.opacity = opacityVal;
    }
    if (outerMatRef.current) {
      outerMatRef.current.opacity = opacityVal * 0.25;
    }
    if (lightRef.current) {
      lightRef.current.intensity = opacityVal * 5.0;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Central Core Glow */}
      <mesh>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial ref={innerMatRef} color={data.color} transparent opacity={1} />
      </mesh>
      
      {/* Outer Halo */}
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial 
          ref={outerMatRef}
          color={data.color} 
          transparent 
          opacity={0.25} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>

      {/* Local point light to illuminate passing stars/dust */}
      <pointLight ref={lightRef} distance={3.0} intensity={5.0} color={data.color} />
    </group>
  );
}

// Group of flying energy lights
function FlyingLights() {
  const numLights = 12;
  const lightsData = React.useMemo(() => {
    const colors = [
      '#3b82f6', // bright blue
      '#8b5cf6', // purple
      '#f472b6', // pink
      '#00f0ff', // cyan
      '#c084fc', // light violet
      '#fbbf24', // amber/gold
    ];
    
    return [...Array(numLights)].map((_, i) => {
      return {
        id: i,
        color: colors[i % colors.length],
        // Spawn them distributed along the Z axis from -35 to 5
        initialZ: -35 + (i * (40 / numLights)),
        speedZ: 0.04 + Math.random() * 0.06,
        radius: 1.5 + Math.random() * 2.5,
        spiralSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.4),
        phase: Math.random() * Math.PI * 2,
        wobbleSpeedX: 0.5 + Math.random() * 1.0,
        wobbleSpeedY: 0.5 + Math.random() * 1.0,
        wobbleAmp: 0.3 + Math.random() * 0.5,
      };
    });
  }, []);

  return (
    <group>
      {lightsData.map((data) => (
        <FlyingLightNode key={data.id} data={data} />
      ))}
    </group>
  );
}

// Warp Speed / Space Flight Starfield
function Starfield() {
  const pointsRef = useRef();
  const numPoints = 2000;
  
  // Create circular texture once
  const starTexture = React.useMemo(() => createCircleTexture(), []);

  // Procedurally generate positions, colors and speeds
  const { positions, colors, speeds } = React.useMemo(() => {
    const pos = new Float32Array(numPoints * 3);
    const cols = new Float32Array(numPoints * 3);
    const sp = new Float32Array(numPoints);
    
    const starColors = [
      new THREE.Color('#ffffff'), // white
      new THREE.Color('#8ab4f8'), // light blue
      new THREE.Color('#c58af9'), // light purple
      new THREE.Color('#ffe082'), // warm yellow
      new THREE.Color('#24e5af'), // neon cyan
    ];

    for (let i = 0; i < numPoints; i++) {
      const idx = i * 3;
      // Distribute in a corridor stretching forward
      pos[idx] = (Math.random() - 0.5) * 18;      // X
      pos[idx + 1] = (Math.random() - 0.5) * 18;  // Y
      pos[idx + 2] = -35 + Math.random() * 40;     // Z

      // Speed (faster particles feel closer)
      sp[i] = 0.05 + Math.random() * 0.15;
      
      // Assign random color from palette
      const color = starColors[Math.floor(Math.random() * starColors.length)];
      cols[idx] = color.r;
      cols[idx + 1] = color.g;
      cols[idx + 2] = color.b;
    }
    return { positions: pos, colors: cols, speeds: sp };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const positionAttribute = pointsRef.current.geometry.getAttribute('position');
      const arr = positionAttribute.array;
      
      for (let i = 0; i < numPoints; i++) {
        const idx = i * 3;
        
        // Move star forward on Z-axis (towards camera)
        arr[idx + 2] += speeds[i];

        // If star goes past the camera viewport, recycle it far back
        if (arr[idx + 2] > 5) {
          arr[idx + 2] = -35 - Math.random() * 5;
          arr[idx] = (Math.random() - 0.5) * 18;
          arr[idx + 1] = (Math.random() - 0.5) * 18;
        }
      }
      positionAttribute.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        transparent
        vertexColors={true}
        size={0.12} // Increased size slightly to account for radial transparency fade
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        map={starTexture}
      />
    </points>
  );
}

function AbstractCore() {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.1;
      meshRef.current.rotation.y = time * 0.15;
      const scale = 1 + Math.sin(time * 2) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -2]}>
      <icosahedronGeometry args={[2.5, 1]} />
      <meshBasicMaterial 
        color="#8b5cf6" 
        wireframe={true} 
        transparent 
        opacity={0.15} 
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Gentle interactive mouse drift camera rig
function MouseCameraRig({ children }) {
  const rigRef = useRef();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMouse({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (rigRef.current) {
      // Gentle drift on X and Y over time
      const driftX = Math.sin(time * 0.25) * 0.4;
      const driftY = Math.cos(time * 0.2) * 0.3;
      
      // Combine drift with mouse parallax
      rigRef.current.position.x = THREE.MathUtils.lerp(rigRef.current.position.x, driftX + mouse.x * 0.8, 0.05);
      rigRef.current.position.y = THREE.MathUtils.lerp(rigRef.current.position.y, driftY + mouse.y * 0.6, 0.05);
      
      // Subtle rotation tilt
      rigRef.current.rotation.y = THREE.MathUtils.lerp(rigRef.current.rotation.y, mouse.x * 0.1, 0.05);
      rigRef.current.rotation.x = THREE.MathUtils.lerp(rigRef.current.rotation.x, -mouse.y * 0.08, 0.05);
    }
  });

  return <group ref={rigRef}>{children}</group>;
}

export default function ThreeVisual() {
  return (
    <div className="three-visual-canvas-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 5.0], fov: 55 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.15} />
        
        <MouseCameraRig>
          {/* Flying energy lights moving in 3D corridors */}
          <FlyingLights />
          {/* Central geometric core */}
          <AbstractCore />
        </MouseCameraRig>

        {/* Streaming multi-color warp starfield */}
        <Starfield />
      </Canvas>
    </div>
  );
}

