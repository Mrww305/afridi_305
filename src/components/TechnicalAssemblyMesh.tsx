import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ScrollStore } from "./SceneCanvas";

/* ------------------------------------------------------------------ */
/* NPR shader sources — "mechanical ink being drawn in real time"      */
/* ------------------------------------------------------------------ */

const INK = "vec3(0.106, 0.212, 0.365)"; // #1B365D
const RUST = "vec3(0.824, 0.412, 0.118)"; // #D2691E
const PAPER = "vec3(0.957, 0.953, 0.937)"; // #F4F3EF

const vert = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vObjPos;
  void main() {
    vObjPos = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

/** Torus knot: screen-space engraving hatching + fresnel rim + rust scan band */
const knotFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vObjPos;
  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);
    float ndl = dot(N, normalize(vec3(0.55, 0.75, 0.55)));
    float shade = clamp(ndl * 0.5 + 0.5, 0.0, 1.0);

    // Two-direction screen-space hatch. Line *width* grows with light,
    // so shadows read as dense engraving — exactly like a pen plotter.
    float d1 = fract((gl_FragCoord.x + gl_FragCoord.y) / 9.0);
    float l1 = smoothstep(0.0, 0.05 + shade * 0.30, d1);
    float d2 = fract((gl_FragCoord.x - gl_FragCoord.y) / 13.0);
    float l2 = smoothstep(0.0, 0.10 + shade * 0.44, d2);

    float ink = (1.0 - l1) * (0.35 + 0.65 * (1.0 - shade));
    ink += (1.0 - l2) * (1.0 - shade) * 0.55;

    // Capillary fresnel rim = the sharp vector outline.
    float fres = pow(1.0 - abs(dot(N, V)), 2.6);
    ink = clamp(ink + fres * 0.95, 0.0, 1.0);

    vec3 col = mix(vec3(${PAPER}), vec3(${INK}), ink * 0.92);

    // Industrial rust callout band sweeping the assembly.
    float band = 1.0 - smoothstep(0.0, 0.035,
      abs(fract(vObjPos.y * 0.25 - uTime * 0.07) - 0.5));
    col = mix(col, vec3(${RUST}), band * 0.85);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Sphere: latitude / longitude drafting grid + equatorial rust datum */
const sphereFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vObjPos;
  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);
    vec3 nPos = normalize(vObjPos);

    float lon = atan(nPos.z, nPos.x);
    float lat = asin(clamp(nPos.y, -1.0, 1.0));

    float mU = 0.5 - abs(fract(lon * 2.5465) - 0.5); // 16 meridians
    float mV = 0.5 - abs(fract(lat * 2.8648) - 0.5); // 9 parallels
    float grid = max(smoothstep(0.43, 0.5, mU), smoothstep(0.43, 0.5, mV));

    float fres = pow(1.0 - abs(dot(N, V)), 2.2);
    float ink = clamp(grid * 0.9 + fres * 0.85, 0.0, 1.0);

    vec3 col = mix(vec3(${PAPER}), vec3(${INK}), ink);

    float eq = 1.0 - smoothstep(0.0, 0.045, abs(lat));
    col = mix(col, vec3(${RUST}), eq * 0.9);

    // Slow longitude "plotting head" sweep
    float head = 1.0 - smoothstep(0.0, 0.02,
      abs(fract(lon * 0.15915 - uTime * 0.045) - 0.5));
    col = mix(col, vec3(${RUST}), head * 0.5);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ------------------------------------------------------------------ */
/* Assembly                                                            */
/* ------------------------------------------------------------------ */

export function TechnicalAssemblyMesh({ store }: { store: ScrollStore }) {
  const group = useRef<THREE.Group>(null!);
  const knot = useRef<THREE.Mesh>(null!);
  const sphere = useRef<THREE.Mesh>(null!);
  const ringA = useRef<THREE.Mesh>(null!);
  const ringB = useRef<THREE.Mesh>(null!);
  const ringC = useRef<THREE.Mesh>(null!);
  const drift = useRef({ x: 0, y: 0 });

  const knotMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: knotFrag,
        uniforms: { uTime: { value: 0 } },
      }),
    []
  );
  const sphereMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: sphereFrag,
        uniforms: { uTime: { value: 0 } },
      }),
    []
  );

  useEffect(() => {
    return () => {
      knotMat.dispose();
      sphereMat.dispose();
    };
  }, [knotMat, sphereMat]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    knotMat.uniforms.uTime.value = t;
    sphereMat.uniforms.uTime.value = t;

    // Cursor-driven rotational drift (damped spring)
    drift.current.x = THREE.MathUtils.damp(
      drift.current.x,
      state.pointer.x * 0.45,
      2.4,
      delta
    );
    drift.current.y = THREE.MathUtils.damp(
      drift.current.y,
      -state.pointer.y * 0.3,
      2.4,
      delta
    );

    // Base slow rotation + drift + scroll-driven revolution so the camera
    // path and the assembly co-author the composition.
    group.current.rotation.y = t * 0.06 + drift.current.x + store.p * Math.PI * 1.4;
    group.current.rotation.x =
      Math.sin(t * 0.1) * 0.08 + drift.current.y + store.p * 0.5;

    knot.current.rotation.z = t * 0.05;
    sphere.current.rotation.y = -t * 0.14;
    sphere.current.rotation.z = t * 0.07;

    ringA.current.rotation.z = t * 0.12;
    ringB.current.rotation.x = Math.PI / 2.4 + t * 0.09;
    ringC.current.rotation.y = t * -0.07;
  });

  return (
    <group ref={group}>
      {/* ---- Torus knot: SCADA mechanical core ---- */}
      <mesh ref={knot}>
        <torusKnotGeometry args={[1.5, 0.4, 280, 36, 2, 3]} />
        <primitive object={knotMat} attach="material" />
      </mesh>
      {/* Ink outline hull */}
      <mesh scale={1.03}>
        <torusKnotGeometry args={[1.5, 0.4, 140, 20, 2, 3]} />
        <meshBasicMaterial color="#1b365d" side={THREE.BackSide} />
      </mesh>
      {/* Live wireframe telemetry */}
      <mesh scale={1.001}>
        <torusKnotGeometry args={[1.5, 0.4, 96, 14, 2, 3]} />
        <meshBasicMaterial
          color="#1b365d"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* ---- Sphere: sovereign neural network ---- */}
      <group>
        <mesh ref={sphere}>
          <icosahedronGeometry args={[0.82, 5]} />
          <primitive object={sphereMat} attach="material" />
        </mesh>
        <mesh scale={1.05}>
          <icosahedronGeometry args={[0.82, 2]} />
          <meshBasicMaterial color="#1b365d" side={THREE.BackSide} />
        </mesh>
        <mesh scale={1.002}>
          <icosahedronGeometry args={[0.82, 2]} />
          <meshBasicMaterial
            color="#d2691e"
            wireframe
            transparent
            opacity={0.16}
          />
        </mesh>
      </group>

      {/* ---- Drafting orbit rings ---- */}
      <mesh ref={ringA} rotation={[Math.PI / 2.15, 0.3, 0]}>
        <torusGeometry args={[2.62, 0.008, 6, 200]} />
        <meshBasicMaterial color="#1b365d" transparent opacity={0.5} />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 2.4, -0.5, 0.4]}>
        <torusGeometry args={[3.05, 0.006, 6, 200]} />
        <meshBasicMaterial color="#1b365d" transparent opacity={0.28} />
      </mesh>
      <mesh ref={ringC} rotation={[1.2, 0.7, 0.2]}>
        <torusGeometry args={[2.28, 0.007, 6, 200]} />
        <meshBasicMaterial color="#d2691e" transparent opacity={0.55} />
      </mesh>

      {/* Datum ticks riding the outer ring */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 2.62, 0, Math.sin(a) * 2.62]}
            rotation={[Math.PI / 2.15, 0.3, 0]}
          >
            <boxGeometry args={[0.02, 0.1, 0.02]} />
            <meshBasicMaterial color={i % 3 === 0 ? "#d2691e" : "#1b365d"} />
          </mesh>
        );
      })}
    </group>
  );
}
