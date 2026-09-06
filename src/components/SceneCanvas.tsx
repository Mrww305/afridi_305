import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TechnicalAssemblyMesh } from "./TechnicalAssemblyMesh";

/** Mutable scroll state shared between the DOM layer and the R3F render
 *  loop — written by App's scroll handler, read per-frame (no re-renders). */
export interface ScrollStore {
  p: number; // 0..1 scroll progress
}

/* ------------------------------------------------------------------ */
/* Cinematic camera pathing — Lusion-style scroll-driven flight        */
/* Catmull-Rom splines carry the lens around, then straight through    */
/* the wireframe cluster at mid-scroll.                                */
/* ------------------------------------------------------------------ */
function CameraRig({ store }: { store: ScrollStore }) {
  const posCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.2, 10.6),
        new THREE.Vector3(4.7, 1.9, 7.3),
        new THREE.Vector3(2.6, 0.5, 2.9),
        new THREE.Vector3(-0.4, -0.25, 1.35), // through the cluster
        new THREE.Vector3(-3.5, 0.9, 4.8),
        new THREE.Vector3(-5.4, 2.7, 8.2),
        new THREE.Vector3(0.2, 3.6, 10.4),
      ]),
    []
  );
  const tgtCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.3, 0.2, 0),
        new THREE.Vector3(0.1, 0.1, 0),
        new THREE.Vector3(-0.3, -0.1, 0),
        new THREE.Vector3(0, 0.35, 0),
        new THREE.Vector3(0.1, 0.1, 0),
        new THREE.Vector3(0, -0.3, 0),
      ]),
    []
  );

  const cur = useRef(new THREE.Vector3(0, 0.2, 10.6));
  const curT = useRef(new THREE.Vector3(0, 0, 0));
  const pPos = useRef(new THREE.Vector3());
  const pTgt = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const p = THREE.MathUtils.clamp(store.p, 0, 1);
    // Gentle ease on the parameter so section boundaries feel like cuts.
    const pe = p * p * (3 - 2 * p);
    posCurve.getPoint(pe, pPos.current);
    tgtCurve.getPoint(pe, pTgt.current);

    const lam = 2.1;
    cur.current.x = THREE.MathUtils.damp(cur.current.x, pPos.current.x, lam, delta);
    cur.current.y = THREE.MathUtils.damp(cur.current.y, pPos.current.y, lam, delta);
    cur.current.z = THREE.MathUtils.damp(cur.current.z, pPos.current.z, lam, delta);
    curT.current.x = THREE.MathUtils.damp(curT.current.x, pTgt.current.x, lam, delta);
    curT.current.y = THREE.MathUtils.damp(curT.current.y, pTgt.current.y, lam, delta);
    curT.current.z = THREE.MathUtils.damp(curT.current.z, pTgt.current.z, lam, delta);

    state.camera.position.copy(cur.current);
    // Subtle pointer parallax layered over the dolly
    state.camera.position.x += state.pointer.x * 0.32;
    state.camera.position.y += state.pointer.y * 0.2;
    state.camera.lookAt(curT.current);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/* PointerSync — the canvas sits under the z-20 DOM overlay, so R3F's  */
/* own hit-tested pointer never fires. Feed window pointer events      */
/* straight into the shared state for drift + parallax.                */
/* ------------------------------------------------------------------ */
function PointerSync() {
  const pointer = useThree((s) => s.pointer);
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [pointer]);
  return null;
}

/* ------------------------------------------------------------------ */
/* Canvas — mounted at z-10, beneath the crawlable DOM overlay (z-20)  */
/* ------------------------------------------------------------------ */
export function SceneCanvas({ store }: { store: ScrollStore }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 42, near: 0.1, far: 60, position: [0, 0.2, 10.6] }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
    >
      <fog attach="fog" args={["#f4f3ef", 11, 26]} />
      <PointerSync />
      <CameraRig store={store} />
      <TechnicalAssemblyMesh store={store} />
    </Canvas>
  );
}
