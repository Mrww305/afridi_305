# SAJID AFRIDI — Tactile Blueprint Brutalism Portfolio

> An interactive drafting board: a WebGL ink-rendered mechanical assembly
> beneath crawlable engineering documentation, spatialized relay audio under
> every interaction, and a cinematic camera path tied to scroll depth.
> Bridging Sovereign Intelligence & Physical Automation.

```
┌─────────────────────────────────────────────────────────────┐
│  WORK ORDER Nº SA-2026-C        INTERACTIVE PORTFOLIO       │
│  SCALE 1:1 · REV C · SHEET 01   STATUS: ISSUED FOR BUILD    │
└─────────────────────────────────────────────────────────────┘
```

| | |
|---|---|
| **Build status** | ✓ `vite build` verified, zero errors |
| **Stack** | React 18 · Vite 6 · TypeScript · Tailwind CSS v4 · Three.js · React Three Fiber 8 |
| **Typography** | Big Shoulders Display (display) · Space Grotesk (body) · IBM Plex Mono (annotations) |
| **Palette** | Paper `#F4F3EF` · Blueprint Ink `#1B365D` · Industrial Rust `#D2691E` |
| **Motion** | `prefers-reduced-motion` fully honored |

---

## 1 · Overview

The site treats the visitor as an engineer at a drafting table. A full-viewport
WebGL canvas renders a nested 3D assembly — a torus knot (SCADA mechanical
systems) intertwined with a lat/lon sphere (neural AI networks) — drawn
entirely in non-photorealistic ink: screen-space engraving hatching, fresnel
vector rims, back-side hull outlines, live wireframe telemetry, and rust
callout bands. Above it sits crawlable DOM content styled as a blueprint
sheet set: title block, telemetry metrics, systems-of-record pillars, a trade
network ledger, credentials, drawing notes, and a stamped sign-off.

Two audio channels run beneath everything once the user grants permission
through the Entry Gateway: a 46 Hz **Sketch Hum** drone (the draft-table
ambience) and spatialized **Relay Clicks** that pan left/right with the
cursor on hover and press.

---

## 2 · Getting Started

```bash
npm install        # install dependencies
npm run dev        # local dev server (Vite HMR)
npm run build      # production build → dist/
npm run typecheck  # tsc --noEmit
```

The production build is a static bundle; `dist/index.html` is deployment-ready
on any static host (Vercel, Netlify, S3, GitHub Pages).

> **Runtime note** — the app is served from the Vite dev server during this
> workspace session; the same `npm run build` output is what ships.

---

## 3 · Directory Map

```
.
├── index.html                     # Document shell: fonts, meta, theme
├── package.json
├── vite.config.js
├── tsconfig.json
└── src/
    ├── main.tsx                   # React root
    ├── index.css                  # Tailwind v4 theme + drafting system CSS
    ├── App.tsx                    # Layer orchestration, header, cursor, focal engine
    ├── components/
    │   ├── AudioGateway.tsx       # Entry work-order modal → Web Audio init
    │   ├── SceneCanvas.tsx        # R3F canvas (z-10), camera rig, pointer sync
    │   ├── TechnicalAssemblyMesh.tsx  # NPR ink shaders + knot/sphere assembly
    │   ├── BlueprintOverlay.tsx   # Crawlable DOM (z-20): all sheet content
    │   ├── SplitText.tsx          # Character-splitter + reveal/ink-bleed wrapper
    │   └── hooks.ts               # Magnetic, reveal, count-up, ink-bleed, clock
    └── lib/
        └── SpatialAudioController.ts  # Web Audio engine (hum, relays, panning)
```

---

## 4 · Architecture & Layer Stack

```
z-70  AudioGateway          fixed entry modal; owns audio permission
z-60  DraftingCursor        crosshair reticle + mm coordinate readout
z-40  Header / ScrollRail   UTC clock, sound toggle, traverse indicator
z-20  BlueprintOverlay      crawlable DOM sheets (sections, metrics, ledger)
z-10  SceneCanvas           WebGL assembly + cinematic camera
z-0   Base                  paper field, blueprint grid, vignette, grain
```

* **Canvas under DOM, by design.** The WebGL layer is a *background drawing*;
  all text remains crawlable, selectable, and accessible. Because the overlay
  intercepts pointer events, a `PointerSync` component inside the scene feeds
  `window` pointer coordinates directly into R3F state — driving mesh drift
  and camera parallax without relying on canvas hit-testing.
* **Scroll bus.** A mutable `ScrollStore { p: 0..1, y: px }` is updated on
  the native scroll listener and read inside `useFrame` — zero React
  re-renders per scroll tick.
* **Focus engine.** An `IntersectionObserver` watches `[data-reading]`
  sections. While text is being traversed, the canvas layer crossfades toward
  a soft blur (`filter` transition on the wrapper); when the reader dwells,
  focal snaps back to sharp. Implemented as an opacity/filter crossfade —
  cheaper and steadier than a real postprocess DoF pass on mobile.

---

## 5 · Component Deep-Dives

### 5.1 `AudioGateway.tsx`

The "Entry Gateway" — styled as work order Nº SA-2026-001. It exists to
acquire an **explicit user gesture** so the global `AudioContext` initializes
under every browser autoplay policy. Two channel switches (Sketch Hum,
Relay Click) arm independently; an "enter muted" path skips audio entirely.
On accept it fades out and never re-mounts.

### 5.2 `SceneCanvas.tsx`

* `Canvas` fixed at `z-10`, cream clear color matched to the paper field,
  fog `#F4F3EF` 11→26 for aerial depth.
* **CameraRig** — five control points on a `CatmullRomCurve3`: wide
  three-quarter establishing shot → high oblique → **passage through the
  wireframe cluster at minimum radius** → low reverse angle → final
  pull-back. Position, look-target, and FOV (55→36) are all
  scroll-parameterized and damped.
* **PointerSync** — bridges window pointer events into `state.pointer`
  for drift and parallax (see §4).

### 5.3 `TechnicalAssemblyMesh.tsx`

The centerpiece assembly, drawn as if a plotter is inking it live:

| Part | Technique |
|---|---|
| Torus knot core | Custom ShaderMaterial: two-direction **screen-space hatch** whose line width grows with diffuse light (shadows read as dense engraving), plus fresnel rim |
| Knot outline | Same geometry at 1.03× scale, `BackSide` ink fill — hull edge detection |
| Knot telemetry | 140-segment wireframe at 8% opacity |
| Neural sphere | Icosahedron (subdiv 5) with **lat/lon grid shader**, equatorial rust datum, slow "plotting head" longitude sweep |
| Orbit rings | Three torus rings (2 ink, 1 rust) + 12 datum ticks, rust every 3rd |

Motion: base slow rotation + cursor-driven damped drift + scroll-linked
revolution, so the camera path and the assembly co-author the composition.
Shader uniforms are disposed on unmount; geometries are R3F-managed.

### 5.4 `BlueprintOverlay.tsx` (crawlable DOM, z-20)

| Sheet | Contents |
|---|---|
| **01 Title Block** | DWG header, giant split-text `SAJID / AFRIDI` with SVG ink-bleed hover, headline concept, sheet frame, dimension callout line, scroll cue |
| **02 Telemetry** | Four metric blocks: `12% → 6%` Reshmatex error reduction (animated strikethrough delta + flowing arrow), `1st` native regional SCADA, `PKR 300M+` Asia Foam recovery, `6+` trade countries — each with odometer count-up, magnetic pull, and relay-flash on click |
| **03 Systems of Record** | Pillars 01–03: AI Governance & Data Science (NITB, AIPakistani.com, AIMarhaba.com, DL/NLP/CV/XAI), Industrial Automation (SCADA, PLC ladder logic, HMI, telemetry — with a live animated ladder diagram SVG), Cybersecurity & DevSecOps (Pakistan Red Team CTO, Docker/K8s, homomorphic encryption, federated learning) |
| **04 Network Ledger** | Trade & logistics table: Indonesia, China, Singapore, Thailand, Saudi Arabia, Pakistan-HQ — coordinates, channels, pulsing ONLINE status |
| **05 Record & Sign-off** | Siena College (New York) credential card, drawing notes panel, signature block, "Issued for Construction" stamp |
| **Footer** | Work-order mailto CTA (magnetic), sheet credits, return-to-top |

Every hoverable element carries `data-relay` → spatial tick; every stat
block closes a relay circuit on click.

### 5.5 `SplitText.tsx` + `hooks.ts`

* **String splitter** parses headers into per-character `<span>` blocks with
  `--d` stagger delays; on intersection each glyph sweeps `blur(12px) → 0`
  with scale/rotate snap on a `cubic-bezier(0.19, 1.45, 0.22, 1)` elastic
  ease. Guarded so reduced-motion users see text instantly.
* `useMagnetic` — spring-damper lerp (velocity + stiffness 0.10, damping
  0.76) pulling interactive blocks toward the cursor inside a 170px field.
* `useReveal` / `useCountUp` — IntersectionObserver-driven entrance and
  odometer animations.
* `useInkBleed` — hover raises an SVG `feTurbulence + feDisplacementMap`
  scale toward 15 with an animated base frequency (capillary ink spread),
  then springs back to 0 for razor-sharp vector edges.
* `useUtcClock` — live header readout.

### 5.6 `lib/SpatialAudioController.ts`

A singleton Web Audio engine, lazily constructed on the gateway gesture:

* **Sketch Hum** — 46 Hz + 92.5 Hz sine partials through a lowpass, brown-
  noise "paper grain" bandpassed at 340 Hz, a slow 0.08 Hz breathing LFO on
  the master gain. Warm draft-table drone.
* **Relay Click** — a three-voice transient: square blip (≈2150→1780 Hz,
  22 ms), bandpassed noise thock, high-pass snap — total < 90 ms.
* **Spatialization** — each voice routes through a `StereoPannerNode`
  computed from cursor X (`panFromX`), so relays ring from the ear nearest
  the interaction. All node creation is guarded; the engine is a silent
  no-op if audio is declined or the API is unavailable.

---

## 6 · Design System

* **Grid backing** — layered CSS `linear-gradient`s: 26px fine grid over a
  130px major grid at two ink opacities, plus radial vignette and a 5%
  multiply-blend SVG turbulence grain.
* **Brutalist surfaces** — 2px ink borders, hard offset shadows
  (`8px 8px 0`), zero border radius, rust reserved strictly for *active*
  callouts.
* **Living details** — dashed-flow connectors, pulsing ladder rungs,
  blinking node statuses, wobbling approval stamp, ticking scroll cue,
  custom crosshair cursor with coordinate readout (fine pointers only).
* **Type contrast** — display at `clamp(4.2rem → 15rem)` vs 10px mono
  annotations at `0.2em+` tracking.

## 7 · Performance & Accessibility

* Single render loop via R3F `useFrame`; scroll handled through a mutable
  ref — no per-frame React state.
* Geometry budgets: knot 280×36 segments (hull/wire at lower counts),
  sphere subdivision 5 — comfortably 120 FPS-class on desktop, steady on
  mobile. No postprocessing passes; DoF is a cheap filter crossfade.
* All browser-only APIs (`window`, `AudioContext`, WebGL) are touched only
  inside event handlers, effects, or post-gesture paths — nothing at module
  evaluation time.
* **Reduced motion**: all stagger/reveal transitions collapse to instant,
  decorative loops (dash-flow, pulses, wobble) are disabled, and the 3D
  camera/hum paths degrade to static composition.
* Semantic landmarks, `role="switch"`/`aria-checked` toggles, labelled SVG
  diagrams, dashed rust focus rings, `mailto:` CTA.

## 8 · Content Grounding (CV)

Headline concept — *Bridging Sovereign Intelligence & Physical Automation* —
with key metrics (12%→6% Reshmatex, 1st native regional SCADA, PKR 300M+
Asia Foam recovery, 6+ trade countries), the three capability pillars
(AI Governance with NITB / AIPakistani.com / AIMarhaba.com; Industrial
Automation; Cybersecurity & DevSecOps as Pakistan Red Team CTO), active
trade nodes (Indonesia, China, Singapore, Thailand, Saudi Arabia), and the
Siena College, New York academic credential — all rendered as first-class
sheet content, never lorem filler.

## 9 · Build Verification

```
vite v6.4.3 building for production...
✓ 60 modules transformed.
dist/index.html                    1.42 kB │ gzip:   0.76 kB
dist/assets/index-*.css           35.18 kB │ gzip:   7.53 kB
dist/assets/index-*.js         1,067.27 kB │ gzip: 295.92 kB
✓ built in 7.13s   (0 errors · 0 type errors)
```

---

## 10 · Adaptation Note

The original specification targets Next.js App Router; this workspace runs
**Vite + React + TypeScript**. The same architecture maps one-to-one:
`app/layout.js` + `app/page.js` → `index.html` + `src/App.tsx` (entry),
`next/dynamic { ssr: false }` → module-level browser-API guarding (R3F and
Web Audio never touch `window` at import time), and the requested component
map — `AudioGateway`, `SceneCanvas`, `TechnicalAssemblyMesh`,
`BlueprintOverlay`, `SpatialAudioController` — is preserved verbatim under
`src/components/` and `src/lib/`.

---

*Drawn: WebGL + Web Audio API · Checked: React Three Fiber ·
Sheet Set SA-2026 REV C · Do not scale from screen. Verify on site.*
