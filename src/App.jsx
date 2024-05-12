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
import blackholesun from "./glsl/blackHoleSun.glsl";

function BlackHoleMaterial() {
  const materialRef = useRef();
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.resolution.value = new THREE.Vector2(
        window.innerWidth,
        window.innerHeight
      );
      materialRef.current.uniforms.RenderSize.value = new THREE.Vector2(
        window.innerWidth,
        window.innerHeight
      );
    }
    console.log(materialRef.current.uniforms.resolution);
    console.log(materialRef.current.uniforms.RenderSize);
  }, []);
  useFrame((state, delta) => {
    if (materialRef.current) {
      const clock = state.clock;
      const elapsedTime = clock.getElapsedTime();
      const time = 10.5 + 9.5 * Math.sin(elapsedTime * 0.5);
      materialRef.current.uniforms.time.value = time;
      materialRef.current.uniformsNeedUpdate = true;
      console.log(materialRef.current.uniforms);
    }
  });
  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={{
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2() },
        brightness: { value: 4.0 },
        ray_brightness: { value: 2.5 },
        spot_brightness: { value: 15.0 },
        ray_density: { value: 12.0 },
        curvature: { value: 300.0 },
        angle: { value: 0.5 },
        freq: { value: 5.0 },
        warp: { value: true },
        RenderSize: { value: new THREE.Vector2() },
      }}
      vertexShader={`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `}
      fragmentShader={`

      varying vec2 vUv;

      uniform float brightness;
      uniform float ray_brightness;
      uniform float spot_brightness;
      uniform float ray_density;
      uniform float curvature;
      uniform float angle;
      uniform float freq;
      uniform float time;
      uniform bool warp;
      uniform bool RenderSize;
      
      #define OCTAVES 6
      
      vec2 hash(vec2 x) {
        const vec2 k = vec2(0.3183099, 0.3678794);
        x = x * k + k.yx;
        return -1.0 + 2.0 * fract(64.0 * k * fract(x.x * x.y * (x.x + x.y)));
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)), dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x), mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
      }
      
      mat2 rot2d(float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c);
      }
      
      float fbm(vec2 p, float freq) {
        float z = 1.0;
        float rz = 0.0;
        p *= 0.25;
        mat2 mrot = rot2d(angle);
        for (int i = 1; i < OCTAVES; i++) {
          rz += (sin(noise(p) * freq) * 0.5 + 0.5) / (z + time * 0.001);
          z *= 1.75;
          p *= 2.0;
          p *= mrot;
        }
        return rz;
      }
      
      void main() {
        float t = time * 0.025;
        vec2 uv = (2.0 * gl_FragCoord.xy - RenderSize) / min(RenderSize.x, RenderSize.y);
        uv *= curvature * 5e-2;
        float r = sqrt(dot(uv, uv));
        float x = dot(normalize(uv), vec2(0.5, 0.0)) + t;
        float y = dot(normalize(uv), vec2(0.0, 0.5)) + t;
        if (warp) {
          float d = ray_density * 0.5;
          x = fbm(vec2(y * d, r + x * d), freq);
          y = fbm(vec2(r + y * d, x * d), freq);
        }
        float val = fbm(vec2(r + y * ray_density, r + x * ray_density - y), freq);
        val = smoothstep(0.0, ray_brightness, val);
        vec3 col = clamp(1.0 - vec3(val), 0.0, 1.0);
        col = mix(col, vec3(1.0), spot_brightness - 10.0 * r / curvature * 200.0 / brightness);
        gl_FragColor = sqrt(vec4(col, 1.0));
      }`}
    />
  );
}

function BlackHoleGeo() {
  return (
    <mesh>
      <Plane args={[20, 20]} />

      <BlackHoleMaterial />
    </mesh>
  );
}
function ReactionDiffusionMaterial() {
  const materialRef = useRef();

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.resolution.value = new THREE.Vector2(
        window.innerWidth,
        window.innerHeight
      );
    }
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      const clock = state.clock;
      const elapsedTime = clock.getElapsedTime();
      const time = 10.5 + 9.5 * Math.sin(elapsedTime * 0.5);

      materialRef.current.uniforms.time.value += time;
      materialRef.current.uniforms.dt.value += delta;

      materialRef.current.uniformsNeedUpdate = true;
      materialRef.current.needsUpdate = true;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={{
        resolution: { value: new THREE.Vector2() },
        time: { value: 0 },
        feed: { value: 0.055 },
        kill: { value: 0.062 },
        dA: { value: 0.1 },
        dB: { value: 0.5 },
        dt: { value: 1.8 },
        noiseScale: { value: 0.5 },
        noiseStrength: { value: 2.0 },
      }}
      vertexShader={`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `}
      fragmentShader={`
        uniform vec2 resolution;
        uniform float time;
        uniform float feed;
        uniform float kill;
        uniform float dA;
        uniform float dB;
        uniform float dt;

        void main() {
          vec2 uv = gl_FragCoord.xy / resolution.xy;
          float x = uv.x * resolution.x / resolution.y;
          vec2 p = vec2(x, uv.y) *20.0;
          vec2 i = floor(p);
          vec2 f = fract(p);
          float c = 0.5 + 0.5 * sin(time + 6.2831 * dot(i, vec2(12.9898, 78.233)));
          c *= smoothstep(0.1, .9, f.x) * smoothstep(.1, .9, f.y);
          gl_FragColor = vec4(c, 0.0, c, 1.0);
        }
      `}
    />
  );
}

function ReactionDiffusionGeo() {
  const RoundedBoxRef = useRef();
  const sphereRef = useRef();

  const {
    width,
    height,
    depth,
    radius,
    smoothness,
    bevelSegments,
    creaseAngle,
  } = useControls({
    width: { value: 1, min: 0, max: 10, step: 0.1 },
    height: { value: 1, min: 0, max: 10, step: 0.1 },
    depth: { value: 1, min: 0, max: 10, step: 0.1 },
    radius: { value: 0.5, min: 0, max: 1, step: 0.1 },
    smoothness: { value: 4, min: 1, max: 10, step: 1 },
    bevelSegments: { value: 4, min: 0, max: 10, step: 1 },
    creaseAngle: { value: 0.4, min: 0, max: Math.PI / 2, step: 0.1 },
  });
  return (
    <mesh>
      <sphereGeometry ref={sphereRef} args={[1, 64, 64]} />
      <ReactionDiffusionMaterial />
    </mesh>
  );
}
function App() {
  return (
    <Canvas camera={{ position: [0, 0, -10], fov: 25 }}>
      <OrbitControls />
      <spotLight
        position={[0, 15, 0]}
        angle={0.3}
        penumbra={1}
        castShadow
        intensity={2}
        shadow-bias={-0.0001}
      />
      <ambientLight intensity={1.5} />
      <BlackHoleGeo />
      {/* <ReactionDiffusionGeo /> */}
    </Canvas>
  );
}

export default App;
