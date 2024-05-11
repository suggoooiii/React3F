/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";
import { Vector2 } from "three";
import { useEffect, useRef } from "react";
import { useControls } from "leva";

function ReactionDiffusionMaterial() {
  const materialRef = useRef();

  const { feed, kill, dA, dB, dt, noiseScale, noiseStrength } = useControls({
    feed: { value: 0.055, min: 0, max: 0.1, step: 0.001 },
    kill: { value: 0.062, min: 0, max: 0.1, step: 0.001 },
    dA: { value: 1.0, min: 0, max: 2, step: 0.1 },
    dB: { value: 0.5, min: 0, max: 2, step: 0.1 },
    dt: { value: 0.5, min: 0, max: 2, step: 0.1 },
    noiseScale: { value: 2.0, min: 0, max: 10, step: 0.1 },
    noiseStrength: { value: 0.1, min: 0, max: 1, step: 0.01 },
  });

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.resolution.value = new Vector2(
        window.innerWidth,
        window.innerHeight
      );
    }
  }, []);

  useFrame((state, delta, xrFrame) => {
    if (materialRef.current) {
      const time = delta;
      // const feed = 0.055 + 0.01 * Math.sin(time * 0.2);
      // const kill = 0.062 + 0.01 * Math.cos(time * 0.1);
      // const dA = 1.0 + 0.1 * Math.sin(time * 0.3);
      // const dB = 0.5 + 0.1 * Math.cos(time * 0.4);
      // const noiseScale = 2.0 + Math.sin(time * 0.5);
      // const noiseStrength = 0.1 + 0.05 * Math.cos(time * 0.3);

      materialRef.current.uniforms.time.value = time * 0.01;
      materialRef.current.uniforms.feed.value = feed;
      materialRef.current.uniforms.kill.value = kill;
      materialRef.current.uniforms.dA.value = dA;
      materialRef.current.uniforms.dB.value = dB;
      materialRef.current.uniforms.noiseScale.value = noiseScale;
      materialRef.current.uniforms.noiseStrength.value += noiseStrength;
      materialRef.current.uniformsNeedUpdate = true;
      materialRef.current.needsUpdate = true;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={{
        resolution: { value: new Vector2() },
        time: { value: 0 },
        feed: { value: feed },
        kill: { value: kill },
        dA: { value: dA },
        dB: { value: dB },
        dt: { value: dt },
        noiseScale: { value: noiseScale },
        noiseStrength: { value: noiseStrength },
      }}
      vertexShader={`
      uniform float utime;
      uniform float noiseScale;
      uniform float noiseStrength;
    
      varying vec2 vUv;
    
      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
    
      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
    
      vec4 permute(vec4 x) {
        return mod289(((x*34.0)+1.0)*x);
      }
    
      vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
      }
    
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
    
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
    
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
    
        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
    
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
    
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
    
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
    
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
    
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
    
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
    
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
    
      void main() {
        vUv = uv;
        vec3 pos = position;
    
        float noiseValue = snoise(vec3(pos.xy * noiseScale, utime * 0.1));
        pos.z += noiseValue * noiseStrength;
    
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
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
          vec2 p = vec2(x, uv.y) * 50.0;
          vec2 i = floor(p);
          vec2 f = floor(p);
          float c = 0.3 + 2.2 * cos(time + 6.2831 * dot(i, vec2(12.9898, 78.233)));
          c *= smoothstep(0.1, 0.9, f.x) * smoothstep(0.1, 0.9, f.y);
          gl_FragColor = vec4(c, 0.0, c, 1.0);
        }
      `}
    />
  );
}

function ReactionDiffusionPlane() {
  return (
    <mesh>
      <RoundedBox
        args={[1, 1, 1]} // Width, height, depth. Default is [1, 1, 1]
        radius={0.05} // Radius of the rounded corners. Default is 0.05
        smoothness={4} // The number of curve segments. Default is 4
        bevelSegments={4} // The number of bevel segments. Default is 4, setting it to 0 removes the bevel, as a result the texture is applied to the whole geometry.
        creaseAngle={0.4} // Smooth normals everywhere except faces that meet at an angle greater than the crease angle
      >
        <ReactionDiffusionMaterial />
      </RoundedBox>
    </mesh>
  );
}

function App() {
  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
      <OrbitControls />
      <ReactionDiffusionPlane />
    </Canvas>
  );
}

export default App;
