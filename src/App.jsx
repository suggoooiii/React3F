/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  RoundedBox,
  MeshReflectorMaterial,
  MeshWobbleMaterial,
  Environment,
  Plane,
  shaderMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useControls } from "leva";
import Experience from "./components/Experience";
import ParticleSystem from "./components/ParticleSystem";

function App() {
  return (
    <Canvas gl={{}} camera={{ position: [0, 0, -10], fov: 75 }}>
      <OrbitControls />
      <Experience />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <ParticleSystem />
    </Canvas>
  );
}

export default App;
