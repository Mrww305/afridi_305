import { useEffect, useRef, useState } from "react";
import { SceneCanvas, type ScrollStore } from "./components/SceneCanvas";
import { BlueprintOverlay } from "./components/BlueprintOverlay";
import { AudioGateway } from "./components/AudioGateway";
import { panFromX, spatialAudio } from "./lib/SpatialAudioController";
import {
  isFinePointer,
  prefersReducedMotion,
  useMagnetic,
  useUtcClock,
} from "./components/hooks";

/* ================================================================== */
/* Header — fixed title-block strip                                    */
/* ================================================================== */

function NavLink({ href, label }: { href: string; label: string }) {
  const ref = useMagnetic<HTMLAnchorElement>(14, 110);
  return (
    <a
      ref={ref}
      href={href}
      data-relay
      onMouseEnter={(e) => spatialAudio.hoverTick(panFromX(e.clientX))}
      onClick={() => spatialAudio.click(0, 0.55)}
      className="border-b-2 border-transparent pb-0.5 font-tech text-[11px] tracking-[0.22em] text-ink transition-colors duration-200 hover:border-rust hover:text-rust"
    >
      {label}
    </a>
  );
}

function Header({
  audioOn,
  onToggleAudio,
}: {
  audioOn: boolean;
  onToggleAudio: () => void;
}) {
  const clock = useUtcClock();
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b-2 border-ink bg-paper/90 backdrop-blur-[2px]">
      <div className="flex items-center justify-between gap-4 px-5 py-2.5 sm:px-10 lg:px-16">
        <a href="#top" className="flex items-center gap-3" data-relay>
          <svg className="h-7 w-7 text-ink" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M16 2v8M16 22v8M2 16h8M22 16h8" stroke="#d2691e" strokeWidth="2" />
          </svg>
          <span className="font-display text-xl font-black uppercase tracking-wide">
            S. Afridi
            <span className="ml-2 hidden font-tech text-[9px] font-normal tracking-[0.25em] text-ink-faint sm:inline">
              REV C
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Sheet sections">
          <NavLink href="#telemetry" label="TELEMETRY" />
          <NavLink href="#systems" label="SYSTEMS" />
          <NavLink href="#networks" label="NETWORKS" />
          <NavLink href="#record" label="RECORD" />
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden font-tech text-[10px] tracking-[0.2em] text-ink-soft lg:inline" aria-label="Coordinated Universal Time">
            UTC {clock}
          </span>
          <button
            onClick={onToggleAudio}
            data-relay
            aria-pressed={audioOn}
            aria-label={audioOn ? "Mute drafting-floor audio" : "Enable drafting-floor audio"}
            className={`flex items-center gap-2 border-2 px-3 py-1.5 font-tech text-[10px] tracking-[0.2em] transition-all duration-200 ${
              audioOn
                ? "border-rust bg-rust text-paper"
                : "border-ink/50 text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M2 8v4h3l4 3V5L5 8H2Z" fill="currentColor" stroke="none" />
              {audioOn ? (
                <path d="M12 7c1.2 1.6 1.2 4.4 0 6M14.5 5c2.2 2.9 2.2 7.1 0 10" />
              ) : (
                <path d="M12.5 8.5l4 4M16.5 8.5l-4 4" />
              )}
            </svg>
            {audioOn ? "AUDIO ARMED" : "AUDIO OFF"}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ================================================================== */
/* Drafting cursor — crosshair with millimeter readout                 */
/* ================================================================== */

function DraftingCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return;
    let x = -100,
      y = -100,
      rx = -100,
      ry = -100,
      raf = 0;
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (rootRef.current)
        rootRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (coordRef.current)
        coordRef.current.textContent = `X ${(x * 0.2646).toFixed(1)} · Y ${(y * 0.2646).toFixed(1)}`;
      const t = e.target as HTMLElement;
      const hot = !!t.closest("a, button, [data-relay]");
      if (ringRef.current) {
        ringRef.current.style.width = hot ? "46px" : "26px";
        ringRef.current.style.height = hot ? "46px" : "26px";
        ringRef.current.style.borderColor = hot ? "#d2691e" : "#1b365d";
      }
    };
    const loop = () => {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      if (ringRef.current)
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
      <div ref={rootRef} className="absolute left-0 top-0">
        <span className="absolute -left-px -top-[11px] h-[22px] w-[2px] -translate-x-1/2 bg-ink/70" />
        <span className="absolute -left-[11px] -top-px h-[2px] w-[22px] -translate-y-1/2 bg-ink/70" />
        <span
          ref={coordRef}
          className="absolute left-3 top-3 whitespace-nowrap font-tech text-[9px] tracking-[0.14em] text-ink/70"
        >
          X 0.0 · Y 0.0
        </span>
      </div>
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-[26px] w-[26px] rounded-full border-2 border-ink transition-[width,height,border-color] duration-200 ease-out"
        style={{ transform: "translate3d(-100px,-100px,0)", marginLeft: -13, marginTop: -13 }}
      />
    </div>
  );
}

/* ================================================================== */
/* Scroll rail — live sheet position readout                           */
/* ================================================================== */

function ScrollRail() {
  const fillRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (fillRef.current) fillRef.current.style.height = `${(p * 100).toFixed(1)}%`;
      if (pctRef.current) pctRef.current.textContent = `${Math.round(p * 100)
        .toString()
        .padStart(3, "0")}%`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex">
      <span className="font-tech text-[9px] tracking-[0.2em] text-ink-faint [writing-mode:vertical-rl]">
        TRAVERSE
      </span>
      <div className="relative h-40 w-[3px] bg-ink/15">
        <div ref={fillRef} className="absolute left-0 top-0 w-full bg-rust" style={{ height: "0%" }} />
      </div>
      <span ref={pctRef} className="font-tech text-[10px] tracking-[0.15em] text-ink-soft">
        000%
      </span>
    </div>
  );
}

/* ================================================================== */
/* App — layer stack & engine wiring                                   */
/* ================================================================== */

export default function App() {
  const scrollStore = useRef<ScrollStore>({ p: 0 }).current;
  const canvasWrap = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [hideCursor, setHideCursor] = useState(false);

  useEffect(() => {
    setHideCursor(isFinePointer() && !prefersReducedMotion());
  }, []);

  /* Lock scroll behind the gateway */
  useEffect(() => {
    document.body.style.overflow = entered ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [entered]);

  /* Scroll progress → mutable store (read by the R3F camera rig) */
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        scrollStore.p = max > 0 ? window.scrollY / max : 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [scrollStore]);

  /* Focal-shift engine: the WebGL layer blurs while the reader is
     traversing text sections, and snaps sharp on dwell. */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const reading = { v: false };
    const io = new IntersectionObserver(
      (entries) => {
        reading.v = entries.some((e) => e.isIntersecting);
      },
      { threshold: 0.45 }
    );
    document.querySelectorAll("[data-reading]").forEach((el) => io.observe(el));

    let raf = 0;
    let last = scrollStore.p;
    let lastT = performance.now();
    let blur = 0;
    const loop = (now: number) => {
      const dt = Math.max(16, now - lastT);
      lastT = now;
      const speed = Math.abs(scrollStore.p - last) / (dt / 1000);
      last = scrollStore.p;
      const target = Math.min(7.5, speed * 9) * (reading.v ? 1 : 0.35);
      blur += (target - blur) * 0.09;
      if (canvasWrap.current) {
        canvasWrap.current.style.filter =
          blur > 0.06 ? `blur(${blur.toFixed(2)}px)` : "none";
        canvasWrap.current.style.transform =
          blur > 0.06 ? "scale(1.03)" : "scale(1)";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [scrollStore, entered]);

  const handleEnter = (audioEnabled: boolean) => {
    if (audioEnabled) {
      spatialAudio.init();
      spatialAudio.setEnabled(true);
      spatialAudio.bootSequence();
    }
    setAudioOn(audioEnabled);
    setLeaving(true);
    window.setTimeout(() => setEntered(true), 800);
  };

  const handleToggleAudio = () => {
    spatialAudio.init();
    const next = !spatialAudio.isEnabled;
    spatialAudio.setEnabled(next);
    setAudioOn(next);
    if (next) spatialAudio.click(0, 0.7);
  };

  return (
    <div className={hideCursor ? "cursor-none-fine relative min-h-screen bg-paper text-ink" : "relative min-h-screen bg-paper text-ink"}>
      {/* Ink-bleed displacement filter (driven by useInkBleed) */}
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <filter id="ink-bleed-filter" x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence
            id="ink-turb"
            type="fractalNoise"
            baseFrequency="0.012 0.021"
            numOctaves="2"
            seed="7"
            result="n"
          />
          <feDisplacementMap
            id="ink-disp"
            in="SourceGraphic"
            in2="n"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      {/* z-0 : drafting-board backing */}
      <div className="bp-grid fixed inset-0 z-0" aria-hidden="true" />
      <div className="bp-vignette fixed inset-0 z-0" aria-hidden="true" />

      {/* z-10 : non-photorealistic 3D drafting canvas */}
      <div
        ref={canvasWrap}
        className="fixed inset-0 z-10 transition-transform duration-300 will-change-filter"
        aria-hidden="true"
      >
        <SceneCanvas store={scrollStore} />
      </div>

      {/* z-20 : crawlable DOM overlay */}
      <BlueprintOverlay />

      {/* z-30 : paper grain + vignette */}
      <div className="bp-noise pointer-events-none fixed inset-0 z-30" aria-hidden="true" />

      <Header audioOn={audioOn} onToggleAudio={handleToggleAudio} />
      <ScrollRail />
      {hideCursor && <DraftingCursor />}

      {/* z-70 : entry gateway */}
      {!entered && <AudioGateway leaving={leaving} onEnter={handleEnter} />}
    </div>
  );
}
