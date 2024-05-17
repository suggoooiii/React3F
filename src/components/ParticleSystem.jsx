/* eslint-disable react/no-unknown-property */
import * as THREE from "three";
import { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

// Define custom shader material
const ParticleMaterial = shaderMaterial(
  { uTime: 0 },
  `
      precision mediump float;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.z += sin(uTime  + position.x * 10.0) * 0.1;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
  `
      precision mediump float;
      varying vec2 vUv;
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
      }
    `
);

extend({ ParticleMaterial });

export default function ParticleSystem() {
  const material = useRef();
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 1000; i++) {
      temp.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        )
      );
    }
    return temp;
  }, []);

  useFrame((state) => {
    material.current.uTime = state.clock.getElapsedTime();
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array(particles.flat())}
          count={particles.length}
          itemSize={3}
        />
      </bufferGeometry>
      <particleMaterial ref={material} />
    </points>
  );
}
