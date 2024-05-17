/* eslint-disable react/no-unknown-property */
import { TorusKnot } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

export default function Experience() {
  const ref = useRef();
  const bufferRef = useRef();
  //   const { legs } = useConfigurator(); // Force rerender the stage & shadows

  useEffect(() => {
    let positions = ref.current.children[0].geometry.attributes.position.array;
    let normals = ref.current.children[0].geometry.attributes.normal.array;
    let uvs = ref.current.children[0].geometry.attributes.uv.array;
    console.log(positions, normals, uvs);
    console.log(bufferRef.current);
  }, []);
  useFrame((state, delta) => {
    ref.current.rotation.y += delta;
  });

  return (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />

      <mesh receiveShadow={true} ref={ref} visible={false}>
        <planeGeometry args={[100, 100]} />
        <TorusKnot
          material-wireframe={true}
          material-fog={false}
          material-lightMapIntensity={0.2}
          material-color="red"
          args={[10, 3.2, 250, 20, 2, 9]}
        />
      </mesh>
    </>
  );
}
