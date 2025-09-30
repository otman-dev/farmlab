"use client";

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// Exact Hssakra farm coordinates from Google Maps
const FARM_LAT = 35.459668;
const FARM_LNG = -5.6523763;

// Convert lat/lng to 3D coordinates on sphere (corrected formula)
function latLngToCartesian(lat: number, lng: number, radius: number) {
  // Convert degrees to radians
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  
  // Calculate 3D position on sphere
  const x = radius * Math.cos(latRad) * Math.cos(lngRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lngRad);
  
  return { x, y, z };
}

// Animated globe component with real Earth texture
function Globe() {
  const meshRef = useRef<THREE.Mesh>(null);
  const farmMarkerRef = useRef<THREE.Mesh>(null);
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null);
  
  // Use real Earth texture from NASA
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    // First try to load a real Earth texture from a public CDN
    loader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_atmos_2048.jpg',
      (texture) => {
        setEarthTexture(texture);
      },
      undefined,
      () => {
        console.log('Failed to load Earth texture, using fallback');
        // Fallback to procedural generation with much better accuracy
        setEarthTexture(createRealisticEarthTexture());
      }
    );
    
    function createRealisticEarthTexture(): THREE.Texture {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;
      
      // Base ocean color
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1e3a5f'); // Arctic ocean
      gradient.addColorStop(0.5, '#0d47a1'); // Deep ocean
      gradient.addColorStop(1, '#1e3a5f'); // Antarctic ocean
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw continents with accurate shapes using path data
      const continents = [
        // Africa - much more accurate shape
        {
          color: '#8D6E63', // Brown for North Africa (Morocco region)
          path: [
            [canvas.width * 0.48, canvas.height * 0.25], // Morocco area
            [canvas.width * 0.52, canvas.height * 0.28],
            [canvas.width * 0.545, canvas.height * 0.32],
            [canvas.width * 0.58, canvas.height * 0.45],
            [canvas.width * 0.57, canvas.height * 0.65],
            [canvas.width * 0.52, canvas.height * 0.82],
            [canvas.width * 0.48, canvas.height * 0.78],
            [canvas.width * 0.45, canvas.height * 0.65],
            [canvas.width * 0.43, canvas.height * 0.45],
            [canvas.width * 0.445, canvas.height * 0.32]
          ]
        },
        // Europe
        {
          color: '#4CAF50', // Green
          path: [
            [canvas.width * 0.45, canvas.height * 0.20],
            [canvas.width * 0.55, canvas.height * 0.18],
            [canvas.width * 0.58, canvas.height * 0.25],
            [canvas.width * 0.52, canvas.height * 0.28],
            [canvas.width * 0.48, canvas.height * 0.25],
            [canvas.width * 0.44, canvas.height * 0.22]
          ]
        },
        // Asia
        {
          color: '#689F38', // Olive green
          path: [
            [canvas.width * 0.58, canvas.height * 0.18],
            [canvas.width * 0.85, canvas.height * 0.15],
            [canvas.width * 0.88, canvas.height * 0.25],
            [canvas.width * 0.90, canvas.height * 0.40],
            [canvas.width * 0.85, canvas.height * 0.50],
            [canvas.width * 0.75, canvas.height * 0.55],
            [canvas.width * 0.65, canvas.height * 0.45],
            [canvas.width * 0.58, canvas.height * 0.35]
          ]
        },
        // North America
        {
          color: '#66BB6A', // Light green
          path: [
            [canvas.width * 0.15, canvas.height * 0.15],
            [canvas.width * 0.32, canvas.height * 0.12],
            [canvas.width * 0.35, canvas.height * 0.25],
            [canvas.width * 0.38, canvas.height * 0.40],
            [canvas.width * 0.32, canvas.height * 0.52],
            [canvas.width * 0.25, canvas.height * 0.55],
            [canvas.width * 0.18, canvas.height * 0.50],
            [canvas.width * 0.12, canvas.height * 0.35]
          ]
        },
        // South America
        {
          color: '#558B2F', // Dark green
          path: [
            [canvas.width * 0.25, canvas.height * 0.55],
            [canvas.width * 0.35, canvas.height * 0.52],
            [canvas.width * 0.37, canvas.height * 0.65],
            [canvas.width * 0.35, canvas.height * 0.78],
            [canvas.width * 0.32, canvas.height * 0.85],
            [canvas.width * 0.28, canvas.height * 0.83],
            [canvas.width * 0.26, canvas.height * 0.75],
            [canvas.width * 0.23, canvas.height * 0.62]
          ]
        }
      ];
      
      // Draw continents
      continents.forEach(continent => {
        ctx.fillStyle = continent.color;
        ctx.beginPath();
        ctx.moveTo(continent.path[0][0], continent.path[0][1]);
        continent.path.forEach(point => {
          ctx.lineTo(point[0], point[1]);
        });
        ctx.closePath();
        ctx.fill();
        
        // Add texture variation
        ctx.fillStyle = `rgba(0,0,0,${0.1 + Math.random() * 0.1})`;
        ctx.fill();
      });
      
      // Calculate exact pixel position for Hssakra coordinates
      // Longitude: -5.6523763° → pixel X
      // Latitude: 35.459668° → pixel Y
      const moroccoX = (((-5.6523763) + 180) / 360) * canvas.width; // Convert lng to X
      const moroccoY = ((90 - 35.459668) / 180) * canvas.height; // Convert lat to Y
      
      // Highlight Morocco region
      ctx.fillStyle = '#8D6E63'; // Brown for Morocco region
      ctx.beginPath();
      ctx.ellipse(moroccoX, moroccoY, 25, 15, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Exact Hssakra farm location
      ctx.fillStyle = '#FF4444'; // Bright red for exact farm location
      ctx.beginPath();
      ctx.arc(moroccoX, moroccoY, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add a glow around the farm
      ctx.fillStyle = '#FF6F00'; // Orange glow
      ctx.beginPath();
      ctx.arc(moroccoX, moroccoY, 8, 0, 2 * Math.PI);
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.globalAlpha = 1.0;
      
      // Spain (approximate position relative to Morocco)
      const spainX = moroccoX - 15;
      const spainY = moroccoY - 35;
      ctx.fillStyle = '#FFC107'; // Yellow for Spain
      ctx.beginPath();
      ctx.ellipse(spainX, spainY, 20, 12, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add some cloud-like atmospheric effects
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;
        const radius = Math.random() * 25 + 10;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      return new THREE.CanvasTexture(canvas);
    }
  }, []);

  // Slow rotation
    useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003; // Slow rotation
    }
    
    // Animate farm marker
    if (farmMarkerRef.current) {
      const time = state.clock.getElapsedTime();
      farmMarkerRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.2);
    }
  });

  // Calculate exact farm position on globe
  const farmPosition = useMemo(() => 
    latLngToCartesian(FARM_LAT, FARM_LNG, 2.05), 
    []
  );

  return (
    <group>
      {/* Main Globe */}
      <Sphere ref={meshRef} args={[2, 128, 64]}>
        <meshStandardMaterial 
          map={earthTexture} 
          transparent 
          opacity={0.98}
          roughness={0.8}
          metalness={0.1}
        />
      </Sphere>
      
      {/* Atmosphere Glow */}
      <Sphere args={[2.15, 64, 32]}>
        <meshBasicMaterial 
          color="#87ceeb" 
          transparent 
          opacity={0.08}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Farm Location Marker - Exact coordinates */}
      <mesh
        ref={farmMarkerRef}
        position={[farmPosition.x, farmPosition.y, farmPosition.z]}
      >
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#ff1744" />
      </mesh>
      
      {/* Data transmission beam */}
      <mesh position={[farmPosition.x, farmPosition.y, farmPosition.z]}>
        <cylinderGeometry args={[0.01, 0.03, 0.5, 8]} />
        <meshBasicMaterial 
          color="#00ff41" 
          transparent 
          opacity={0.7}
        />
      </mesh>
      
      {/* Pulsing Ring around Farm */}
      <mesh 
        position={[farmPosition.x, farmPosition.y, farmPosition.z]}
        lookAt={[0, 0, 0]}
      >
        <ringGeometry args={[0.06, 0.1, 32]} />
        <meshBasicMaterial 
          color="#00ff41" 
          transparent 
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Location label */}
      <Html position={[farmPosition.x * 1.3, farmPosition.y * 1.3, farmPosition.z * 1.3]}>
        <div className="bg-black/80 text-green-400 px-2 py-1 rounded text-xs font-mono border border-green-400/50">
          HSSAKRA FARM
        </div>
      </Html>
    </group>
  );
}

// Data visualization panel
interface DataPanelProps {
  temperature?: number;
  humidity?: number;
  timestamp?: number;
}

function DataPanel({ temperature, humidity }: DataPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getTemperatureColor = (temp?: number) => {
    if (!temp) return '#10b981';
    if (temp < 15) return '#3b82f6'; // Blue for cold
    if (temp < 25) return '#10b981'; // Green for optimal
    if (temp < 35) return '#f59e0b'; // Yellow for warm
    return '#ef4444'; // Red for hot
  };

  const getHumidityColor = (humidity?: number) => {
    if (!humidity) return '#06b6d4';
    if (humidity < 30) return '#ef4444'; // Red for low
    if (humidity < 70) return '#10b981'; // Green for optimal
    return '#3b82f6'; // Blue for high
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
          transition={{ duration: 1, type: "spring", stiffness: 100 }}
          className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-lg border border-green-200 rounded-xl p-6 text-gray-700 font-sans shadow-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(34,197,94,0.08) 100%)',
            boxShadow: '0 8px 32px rgba(34,197,94,0.15), 0 0 0 1px rgba(34,197,94,0.1)'
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">Live Sensor Data - Hssakra</span>
          </div>
          
          <div className="space-y-4">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="border-b border-green-200 pb-3"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600 text-sm font-medium">AIR TEMPERATURE</span>
                <span 
                  className="text-2xl font-bold"
                  style={{ color: getTemperatureColor(temperature) }}
                >
                  {temperature !== undefined ? `${temperature}°C` : '--'}
                </span>
              </div>
              {temperature !== undefined && (
                <div className="text-xs text-gray-400">
                  {temperature < 15 ? 'COLD' : 
                   temperature < 25 ? 'OPTIMAL' : 
                   temperature < 35 ? 'WARM' : 'HOT'} | {((temperature * 9/5) + 32).toFixed(1)}°F
                </div>
              )}
            </motion.div>
            
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="border-b border-green-200 pb-3"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600 text-sm font-medium">RELATIVE HUMIDITY</span>
                <span 
                  className="text-2xl font-bold"
                  style={{ color: getHumidityColor(humidity) }}
                >
                  {humidity !== undefined ? `${humidity}%` : '--'}
                </span>
              </div>
              {humidity !== undefined && (
                <div className="text-xs text-gray-400">
                  {humidity < 30 ? 'LOW' : 
                   humidity < 70 ? 'OPTIMAL' : 'HIGH'} MOISTURE
                </div>
              )}
            </motion.div>
            
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xs space-y-1"
            >
              <div className="flex justify-between text-gray-500">
                <span className="font-medium">LAST UPDATE:</span>
                <span>N/A</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span className="font-medium">LOCATION:</span>
                <span className="font-mono">35.4597°N, 5.6524°W</span>
              </div>
            </motion.div>
          </div>
          
          {/* Real-time data visualization */}
          <div className="mt-4 flex items-end gap-1 h-8">
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-green-600 to-green-400 rounded-full opacity-70"
                animate={{
                  height: temperature && humidity ? 
                    `${Math.max(10, (temperature + humidity) / 8 + Math.sin(Date.now() / 1000 + i) * 5)}px` : 
                    `${10 + Math.random() * 20}px`,
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Location info panel
function LocationPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8 }}
      className="absolute bottom-4 left-4 w-72 bg-white/95 backdrop-blur-lg border border-green-200 rounded-xl p-6 text-gray-700 font-sans shadow-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(34,197,94,0.08) 100%)',
        boxShadow: '0 8px 32px rgba(34,197,94,0.15), 0 0 0 1px rgba(34,197,94,0.1)'
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
        <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">Hssakra Farm</span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">COUNTRY</span>
          <span className="font-semibold text-green-700">Morocco</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">REGION</span>
          <span className="font-semibold text-green-700">Tangier-Tetouan</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">COORDINATES</span>
          <span className="font-mono text-green-700">35.4597°N, 5.6524°W</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">ALTITUDE</span>
          <span className="font-semibold text-green-700">~150M</span>
        </div>
      </div>
    </motion.div>
  );
}

// Main component
interface FuturisticGlobeProps {
  sensorData?: {
    air_temp_c?: number;
    air_humidity_percent?: number;
    timestamp?: number;
  };
}

export default function FuturisticGlobe({ sensorData }: FuturisticGlobeProps) {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl overflow-hidden shadow-lg">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
        <div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-green-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* 3D Canvas */}
      <Canvas
        camera={{ 
          position: [3, 1.5, 4], 
          fov: 50 
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-5, 2, 3]} intensity={0.6} color="#87ceeb" />
        <pointLight position={[2, -3, -2]} intensity={0.4} color="#4ade80" />
        
        <Globe />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          minDistance={2.5}
          maxDistance={10}
          autoRotate={true}
          autoRotateSpeed={0.3}
          target={[0, 0.5, 0]}
        />
      </Canvas>
      
      {/* UI Overlays */}
      <DataPanel 
        temperature={sensorData?.air_temp_c}
        humidity={sensorData?.air_humidity_percent}
        timestamp={sensorData?.timestamp}
      />
      
      <LocationPanel />
      
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-4 left-4 text-white"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          FARMLAB GLOBAL MONITORING
        </h2>
        <p className="text-sm text-gray-400 font-mono">Real-time agricultural intelligence system</p>
      </motion.div>
      
      {/* Status indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-green-400/30"
      >
        <motion.div 
          className="w-2 h-2 bg-green-400 rounded-full"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-green-400 text-xs font-mono">SYSTEM ACTIVE</span>
      </motion.div>
    </div>
  );
}