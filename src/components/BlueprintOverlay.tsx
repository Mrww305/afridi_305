import type { MouseEvent, ReactNode } from "react";
import { SplitText } from "./SplitText";
import {
  useCountUp,
  useInkBleed,
  useMagnetic,
  useReveal,
} from "./hooks";
import { panFromX, spatialAudio } from "../lib/SpatialAudioController";

/* ------------------------------------------------------------------ */
/* Shared relay helpers                                                */
/* ------------------------------------------------------------------ */

const tickOn = (e: MouseEvent) =>
  spatialAudio.hoverTick(panFromX(e.clientX));

const clickRelay = (e: MouseEvent<HTMLElement>) => {
  spatialAudio.click(panFromX(e.clientX), 1);
  const el = e.currentTarget;
  el.classList.remove("relay-flash");
  void el.offsetWidth;
  el.classList.add("relay-flash");
};

/* ------------------------------------------------------------------ */
/* Small drafting primitives                                           */
/* ------------------------------------------------------------------ */

function SectionHead({
  code,
  title,
  note,
}: {
  code: string;
  title: string;
  note: string;
}) {
  const rule = useReveal<HTMLDivElement>();
  return (
    <div className="mb-10 sm:mb-14">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-tech text-[11px] tracking-[0.3em] text-rust">
          {code}
        </span>
        <span className="hidden font-tech text-[10px] tracking-[0.2em] text-ink-faint sm:block">
          {note}
        </span>
      </div>
      <SplitText
        as="h2"
        text={title}
        stagger={22}
        className="mt-3 font-display text-[clamp(2.6rem,6.5vw,5.2rem)] font-black uppercase leading-[0.94] tracking-tight"
      />
      <div
        ref={rule}
        className="rv-line mt-5 h-[3px] w-full bg-ink"
        aria-hidden="true"
      />
    </div>
  );
}

function DimLine({ label }: { label: string }) {
  return (
    <div
      className="flex items-center gap-3 text-ink/55"
      aria-hidden="true"
    >
      <span className="h-4 w-[2px] bg-current" />
      <span className="relative h-[2px] flex-1 bg-current">
        <span className="absolute -left-1 -top-[3px] h-2 w-2 rotate-45 border-b-2 border-l-2 border-current" />
        <span className="absolute -right-1 -top-[3px] h-2 w-2 rotate-45 border-r-2 border-t-2 border-current" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-paper px-2 font-tech text-[10px] tracking-[0.22em] text-ink/70">
          {label}
        </span>
      </span>
      <span className="h-4 w-[2px] bg-current" />
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span
      data-relay
      onMouseEnter={tickOn}
      className="inline-block border border-ink/50 px-2.5 py-1 font-tech text-[10px] tracking-[0.14em] text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-rust hover:bg-rust hover:text-paper"
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* S0 — Title block                                                    */
/* ------------------------------------------------------------------ */

function TitleBlock() {
  const nameRef = useInkBleed<HTMLHeadingElement>();
  const cue = useReveal<HTMLDivElement>(0.1);

  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col justify-between px-5 pb-8 pt-28 sm:px-10 lg:px-16"
    >
      {/* Sheet frame border */}
      <div
        className="pointer-events-none absolute inset-3 border border-ink/35 sm:inset-5"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 font-tech text-[10px] tracking-[0.28em] text-ink-soft sm:text-[11px]">
          <span className="text-rust">DWG Nº SA-2026-C</span>
          <span>INTERACTIVE PORTFOLIO ASSEMBLY</span>
          <span className="hidden md:inline">SCALE 1:1 · SHEET 01</span>
        </div>

        <h1
          ref={nameRef}
          className="ink-bleed mt-6 select-none font-display text-[clamp(4.2rem,15.5vw,15rem)] font-black uppercase leading-[0.82] tracking-[-0.01em]"
          style={{ filter: "url(#ink-bleed-filter)" }}
        >
          <SplitText text="SAJID" stagger={55} delay={150} as="span" className="block" />
          <SplitText
            text="AFRIDI"
            stagger={55}
            delay={500}
            as="span"
            className="block text-rust"
          />
        </h1>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-7">
            <SplitText
              as="p"
              text="BRIDGING SOVEREIGN INTELLIGENCE & PHYSICAL AUTOMATION."
              stagger={16}
              delay={950}
              className="font-display text-[clamp(1.5rem,3.4vw,2.6rem)] font-bold uppercase leading-[1.04]"
            />
          </div>
          <div className="rv lg:col-span-4 lg:col-start-9" style={{ "--d": "1200ms" } as never}>
            <p className="border-l-[3px] border-rust pl-4 text-sm leading-relaxed text-ink-soft">
              AI governance consultant, SCADA deployer, red-team operator.
              One drafting board where national policy, factory floors and
              encrypted pipelines are drawn to the same tolerances.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Chip>SCADA × AI</Chip>
              <Chip>NITB POLICY</Chip>
              <Chip>RED TEAM CTO</Chip>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-12 space-y-4">
        <DimLine label="6+ COUNTRIES · PKR 300M+ RECOVERED · 12% → 6% ERROR RATE" />
        <div
          ref={cue}
          className="rv flex items-center justify-between font-tech text-[10px] tracking-[0.3em] text-ink-soft"
          style={{ "--d": "1400ms" } as never}
        >
          <span>SCROLL TO TRAVERSE ASSEMBLY</span>
          <svg
            className="scroll-cue h-6 w-6 text-rust"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M12 3v18M5 14l7 7 7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* S1 — Telemetry / key metrics                                        */
/* ------------------------------------------------------------------ */

function MetricDelta() {
  const from = useCountUp<HTMLSpanElement>(12);
  const to = useCountUp<HTMLSpanElement>(6);
  const mag = useMagnetic<HTMLDivElement>(14);
  return (
    <div
      ref={mag}
      data-relay
      onMouseEnter={tickOn}
      onClick={clickRelay}
      className="group relative col-span-12 cursor-pointer border-2 border-ink bg-paper p-6 shadow-[8px_8px_0_0_rgb(27_54_93_/_0.14)] transition-colors duration-200 hover:bg-ink sm:col-span-7 sm:p-8"
    >
      <span className="absolute right-3 top-2 font-tech text-[10px] tracking-[0.2em] text-ink-faint group-hover:text-paper/60">
        M-01
      </span>
      <p className="font-tech text-[11px] tracking-[0.25em] text-rust">
        RESHMATEX — SCADA AUTOMATION
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span
          ref={from.ref}
          className="font-display text-[clamp(4rem,9vw,7.5rem)] font-black leading-none text-ink/45 line-through decoration-rust decoration-[5px] group-hover:text-paper/45"
        >
          {from.display}%
        </span>
        <svg
          className="h-10 w-14 shrink-0 text-rust"
          viewBox="0 0 56 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          aria-hidden="true"
        >
          <path d="M2 20h44M34 6l14 14-14 14" className="dash-flow" />
        </svg>
        <span
          ref={to.ref}
          className="font-display text-[clamp(4.5rem,11vw,9rem)] font-black leading-none group-hover:text-paper group-hover:[text-shadow:6px_6px_0_rgb(210_105_30)]"
        >
          {to.display}%
        </span>
      </div>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft group-hover:text-paper/75">
        Process error rate halved on a live textile line — the defect curve
        re-drawn by closed-loop telemetry and PLC sequencing.
      </p>
    </div>
  );
}

function MetricScada() {
  const v = useCountUp<HTMLSpanElement>(1);
  const mag = useMagnetic<HTMLDivElement>(14);
  return (
    <div
      ref={mag}
      data-relay
      onMouseEnter={tickOn}
      onClick={clickRelay}
      className="group relative col-span-12 cursor-pointer border-2 border-ink bg-rust p-6 text-paper shadow-[8px_8px_0_0_rgb(27_54_93_/_0.3)] sm:col-span-5 sm:p-8"
    >
      <span className="absolute right-3 top-2 font-tech text-[10px] tracking-[0.2em] text-paper/70">
        M-02
      </span>
      <p className="font-tech text-[11px] tracking-[0.25em] text-paper/85">
        REGIONAL MANUFACTURING
      </p>
      <div className="mt-4 flex items-start">
        <span ref={v.ref} className="font-display text-[clamp(4.5rem,10vw,8.5rem)] font-black leading-none">
          {v.display}
        </span>
        <span className="mt-2 font-display text-[clamp(1.6rem,3vw,2.4rem)] font-extrabold uppercase leading-none">
          st
        </span>
      </div>
      <p className="mt-1 font-display text-2xl font-extrabold uppercase leading-tight">
        Native SCADA system deployed
      </p>
      <p className="mt-3 text-sm leading-relaxed text-paper/85">
        First home-grown process-control stack on a regional factory floor —
        specification, ladder logic, HMI and commissioning drawn in-house.
      </p>
    </div>
  );
}

function MetricRevenue() {
  const v = useCountUp<HTMLSpanElement>(300);
  const mag = useMagnetic<HTMLDivElement>(14);
  return (
    <div
      ref={mag}
      data-relay
      onMouseEnter={tickOn}
      onClick={clickRelay}
      className="group relative col-span-12 cursor-pointer border-2 border-ink bg-paper p-6 shadow-[8px_8px_0_0_rgb(27_54_93_/_0.14)] transition-colors duration-200 hover:bg-ink sm:col-span-5 sm:p-8"
    >
      <span className="absolute right-3 top-2 font-tech text-[10px] tracking-[0.2em] text-ink-faint group-hover:text-paper/60">
        M-03
      </span>
      <p className="font-tech text-[11px] tracking-[0.25em] text-rust">
        ASIA FOAM — RECOVERY
      </p>
      <div className="mt-4 font-display text-[clamp(3.4rem,7.5vw,6.2rem)] font-black leading-none group-hover:text-paper">
        <span className="text-[0.45em] font-extrabold align-top mr-1">PKR</span>
        <span ref={v.ref}>{v.display}</span>
        <span className="text-rust">M+</span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft group-hover:text-paper/75">
        Annual revenue recovered through automation, loss tracking and
        logistics instrumentation across the operation.
      </p>
    </div>
  );
}

function MetricCountries() {
  const v = useCountUp<HTMLSpanElement>(6);
  const mag = useMagnetic<HTMLDivElement>(14);
  return (
    <div
      ref={mag}
      data-relay
      onMouseEnter={tickOn}
      onClick={clickRelay}
      className="group relative col-span-12 cursor-pointer border-2 border-ink bg-paper p-6 shadow-[8px_8px_0_0_rgb(27_54_93_/_0.14)] transition-colors duration-200 hover:bg-ink sm:col-span-7 sm:p-8"
    >
      <span className="absolute right-3 top-2 font-tech text-[10px] tracking-[0.2em] text-ink-faint group-hover:text-paper/60">
        M-04
      </span>
      <p className="font-tech text-[11px] tracking-[0.25em] text-rust">
        INTERNATIONAL TRADE & LOGISTICS
      </p>
      <div className="mt-4 flex items-baseline gap-3">
        <span
          ref={v.ref}
          className="font-display text-[clamp(4.5rem,10vw,8.5rem)] font-black leading-none group-hover:text-paper"
        >
          {v.display}
        </span>
        <span className="font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold text-rust">
          +
        </span>
      </div>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft group-hover:text-paper/75">
        Countries in active trade & logistics operation — Indonesia, China,
        Singapore, Thailand, Saudi Arabia and counting. See the network
        ledger below.
      </p>
    </div>
  );
}

function TelemetrySection() {
  return (
    <section
      id="telemetry"
      data-reading
      className="relative px-5 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <SectionHead
        code="SEC 02 — TELEMETRY"
        title="Measured on the floor, not in the deck."
        note="CLICK ANY BLOCK TO CLOSE THE RELAY"
      />
      <div className="grid grid-cols-12 gap-4 sm:gap-5">
        <MetricDelta />
        <MetricScada />
        <MetricRevenue />
        <MetricCountries />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* S2 — Core pillars / systems timeline                                */
/* ------------------------------------------------------------------ */

function LadderDiagram() {
  return (
    <svg
      viewBox="0 0 300 150"
      className="w-full max-w-sm text-ink"
      fill="none"
      aria-label="Animated PLC ladder-logic diagram"
    >
      {/* rails */}
      <path d="M14 8v134M286 8v134" stroke="currentColor" strokeWidth="2.5" />
      {/* rung 1 */}
      <path d="M14 34h52M98 34h52M182 34h104" stroke="currentColor" strokeWidth="2" className="dash-flow" />
      <path d="M66 24v20M74 24v20M150 24v20M158 24v20" stroke="currentColor" strokeWidth="2" />
      <circle cx="170" cy="34" r="11" stroke="#d2691e" strokeWidth="2" className="rung-pulse" />
      <text x="170" y="38" textAnchor="middle" fontSize="9" fill="#d2691e" fontFamily="IBM Plex Mono, monospace">
        M1
      </text>
      <text x="70" y="16" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="IBM Plex Mono, monospace">
        X0 START
      </text>
      <text x="154" y="16" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="IBM Plex Mono, monospace">
        T1
      </text>
      {/* rung 2 */}
      <path d="M14 88h70M118 88h168" stroke="currentColor" strokeWidth="2" className="dash-flow" />
      <path d="M84 78v20M92 78v20" stroke="currentColor" strokeWidth="2" />
      <path d="M104 80l12 16M104 96l12-16" stroke="#d2691e" strokeWidth="2" />
      <circle cx="136" cy="88" r="11" stroke="currentColor" strokeWidth="2" className="rung-pulse" style={{ animationDelay: "0.9s" }} />
      <text x="136" y="92" textAnchor="middle" fontSize="9" fill="currentColor" fontFamily="IBM Plex Mono, monospace">
        Y2
      </text>
      <text x="88" y="70" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="IBM Plex Mono, monospace">
        X1
      </text>
      {/* rung 3 */}
      <path d="M14 132h272" stroke="currentColor" strokeWidth="2" className="dash-flow" />
      <path d="M120 122v20M128 122v20" stroke="currentColor" strokeWidth="2" />
      <circle cx="156" cy="132" r="11" stroke="#d2691e" strokeWidth="2" className="rung-pulse" style={{ animationDelay: "0.45s" }} />
      <text x="156" y="136" textAnchor="middle" fontSize="9" fill="#d2691e" fontFamily="IBM Plex Mono, monospace">
        ALM
      </text>
      <text x="124" y="114" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="IBM Plex Mono, monospace">
        E-STOP
      </text>
    </svg>
  );
}

function PillarRow({
  index,
  code,
  title,
  body,
  chips,
  aside,
}: {
  index: string;
  code: string;
  title: string;
  body: ReactNode;
  chips: string[];
  aside?: ReactNode;
}) {
  const rv = useReveal<HTMLDivElement>();
  return (
    <article
      ref={rv}
      data-relay
      onMouseEnter={tickOn}
      className="rv group relative grid gap-6 border-t-2 border-ink py-10 transition-colors duration-300 lg:grid-cols-12 lg:gap-4 lg:py-14"
    >
      <div className="lg:col-span-2">
        <span className="font-display text-[clamp(3.4rem,7vw,6rem)] font-black leading-none text-ink/15 transition-colors duration-300 group-hover:text-rust">
          {index}
        </span>
      </div>
      <div className="lg:col-span-6">
        <p className="font-tech text-[10px] tracking-[0.3em] text-rust">{code}</p>
        <h3 className="mt-2 font-display text-[clamp(1.9rem,4vw,3.2rem)] font-black uppercase leading-[0.95]">
          {title}
        </h3>
        <div className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          {body}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </div>
      </div>
      <div className="flex items-start justify-start lg:col-span-4 lg:justify-end">
        {aside}
      </div>
    </article>
  );
}

function SystemsSection() {
  return (
    <section
      id="systems"
      data-reading
      className="relative px-5 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <SectionHead
        code="SEC 03 — SYSTEMS OF RECORD"
        title="Three pillars, one tolerance stack."
        note="HOVER A PILLAR — THE RELAY ANSWERS"
      />

      <PillarRow
        index="01"
        code="PILLAR A — COGNITION LAYER"
        title="AI Governance & Data Science"
        body={
          <>
            <p>
              National AI policy consultant to the{" "}
              <strong className="text-ink">National IT Board (NITB)</strong> —
              translating sovereign-intelligence doctrine into deployable
              standards. Co-founder of{" "}
              <strong className="text-ink">AIPakistani.com</strong> and{" "}
              <strong className="text-ink">AIMarhaba.com</strong>.
            </p>
            <p className="mt-3">
              Builds deep-learning, NLP and computer-vision pipelines with
              explainability wired in from the first layer — models that can
              be audited like drawings.
            </p>
          </>
        }
        chips={[
          "NITB POLICY",
          "AIPAKISTANI.COM",
          "AIMARHABA.COM",
          "DEEP LEARNING",
          "NLP",
          "COMPUTER VISION",
          "XAI PIPELINES",
        ]}
        aside={
          <div className="border-2 border-ink/40 p-4 font-tech text-[10px] leading-relaxed tracking-[0.12em] text-ink-soft">
            <p className="text-rust">// GOVERNANCE SPEC</p>
            <p className="mt-2">POLICY.DOC → PIPELINE.CODE</p>
            <p>TRACEABILITY: FULL</p>
            <p>EXPLAINABILITY: BY DESIGN</p>
            <p className="mt-2 text-ink">STATUS: <span className="text-rust">ACTIVE</span></p>
          </div>
        }
      />

      <PillarRow
        index="02"
        code="PILLAR B — PHYSICAL LAYER"
        title="Industrial Automation"
        body={
          <>
            <p>
              Deployed process-control <strong className="text-ink">SCADA</strong>{" "}
              systems where none existed — first native stack in regional
              manufacturing. Customized{" "}
              <strong className="text-ink">PLC ladder-logic sequencing</strong>,{" "}
              HMI layouts and industrial telemetry from sensor to supervisor.
            </p>
            <p className="mt-3">
              The Reshmatex line is the proof piece: a 12% → 6% error rate,
              redrawn rung by rung.
            </p>
          </>
        }
        chips={[
          "SCADA DEPLOYMENT",
          "PLC LADDER LOGIC",
          "HMI LAYOUTS",
          "PROCESS CONTROL",
          "INDUSTRIAL TELEMETRY",
        ]}
        aside={<LadderDiagram />}
      />

      <PillarRow
        index="03"
        code="PILLAR C — DEFENSE LAYER"
        title="Cybersecurity & DevSecOps"
        body={
          <>
            <p>
              CTO of the <strong className="text-ink">Pakistan Red Team</strong>{" "}
              — offensive operations that find the fault lines before anyone
              else does. Container defenses across{" "}
              <strong className="text-ink">Docker & Kubernetes</strong>,
              hardened CI paths, and privacy architectures built on{" "}
              <strong className="text-ink">homomorphic encryption</strong> and{" "}
              federated learning.
            </p>
            <p className="mt-3">
              Every pipeline ships with its own threat drawing attached.
            </p>
          </>
        }
        chips={[
          "RED TEAM OPS",
          "PAKISTAN RED TEAM — CTO",
          "DOCKER / KUBERNETES",
          "HOMOMORPHIC ENCRYPTION",
          "FEDERATED LEARNING",
          "DEVSECOPS",
        ]}
        aside={
          <svg
            viewBox="0 0 160 160"
            className="w-40 text-ink sm:w-48"
            fill="none"
            aria-label="Hexagonal defense perimeter glyph"
          >
            <path
              d="M80 10 142 45v70L80 150 18 115V45L80 10Z"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <path
              d="M80 34 122 58v48L80 130 38 106V58L80 34Z"
              stroke="#d2691e"
              strokeWidth="1.5"
              className="dash-flow"
            />
            <circle cx="80" cy="80" r="10" stroke="currentColor" strokeWidth="2" className="rung-pulse" />
            <path d="M80 46v24M80 90v24M50 63l21 12M89 85l21 12M110 63 89 75M71 85 50 97" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        }
      />

      <div className="border-t-2 border-ink" aria-hidden="true" />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* S3 — Network ledger                                                 */
/* ------------------------------------------------------------------ */

const NODES = [
  { c: "INDONESIA", coord: "6.2°S / 106.8°E", ch: "TRADE · LOGISTICS", d: "0.0s" },
  { c: "CHINA", coord: "31.2°N / 121.5°E", ch: "SOURCING · FREIGHT", d: "0.4s" },
  { c: "SINGAPORE", coord: "1.35°N / 103.8°E", ch: "TRANS-SHIP HUB", d: "0.8s" },
  { c: "THAILAND", coord: "13.7°N / 100.5°E", ch: "TRADE · ROUTING", d: "1.2s" },
  { c: "SAUDI ARABIA", coord: "24.7°N / 46.7°E", ch: "TRADE · OPS", d: "1.6s" },
  { c: "PAKISTAN — HQ", coord: "33.7°N / 73.1°E", ch: "COMMAND · MFG", d: "2.0s" },
];

function NetworkSection() {
  const rv = useReveal<HTMLDivElement>();
  return (
    <section
      id="networks"
      data-reading
      className="relative px-5 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <SectionHead
        code="SEC 04 — NETWORK LEDGER"
        title="Active trade & logistics routes."
        note="LIVE NODES · 6+ JURISDICTIONS"
      />
      <div ref={rv} className="rv overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b-2 border-ink font-tech text-[10px] tracking-[0.25em] text-ink-soft">
              <th className="py-3 text-left font-medium">NODE</th>
              <th className="py-3 text-left font-medium">COORD</th>
              <th className="py-3 text-left font-medium">CHANNEL</th>
              <th className="py-3 text-right font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {NODES.map((n) => (
              <tr
                key={n.c}
                data-relay
                onMouseEnter={tickOn}
                className="group border-b border-ink/25 transition-colors duration-200 hover:bg-ink hover:text-paper"
              >
                <td className="py-4 font-display text-xl font-extrabold uppercase tracking-wide sm:text-2xl">
                  {n.c}
                </td>
                <td className="py-4 font-tech text-xs tracking-[0.12em] text-ink-soft group-hover:text-paper/70">
                  {n.coord}
                </td>
                <td className="py-4 font-tech text-xs tracking-[0.12em] text-ink-soft group-hover:text-paper/70">
                  {n.ch}
                </td>
                <td className="py-4 text-right">
                  <span className="inline-flex items-center gap-2 font-tech text-[10px] tracking-[0.2em] text-rust">
                    <span
                      className="status-dot inline-block h-2.5 w-2.5 rounded-full bg-rust"
                      style={{ animationDelay: n.d }}
                    />
                    ONLINE
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 font-tech text-[10px] tracking-[0.22em] text-ink-faint">
        * LEDGER TRUNCATED — ADDITIONAL ROUTES UNDER NON-DISCLOSURE
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* S4 — Record, credentials & sign-off                                 */
/* ------------------------------------------------------------------ */

function RecordSection() {
  const rvA = useReveal<HTMLDivElement>();
  const rvB = useReveal<HTMLDivElement>();
  return (
    <section
      id="record"
      data-reading
      className="relative px-5 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <SectionHead
        code="SEC 05 — RECORD & SIGN-OFF"
        title="Credentials, notes, approval."
        note="ALL DIMENSIONS IN MILLIMETERS UNLESS NOTED"
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div
          ref={rvA}
          data-relay
          onMouseEnter={tickOn}
          className="rv relative border-2 border-ink bg-paper p-7 shadow-[8px_8px_0_0_rgb(27_54_93_/_0.14)] lg:col-span-5"
        >
          <p className="font-tech text-[11px] tracking-[0.25em] text-rust">
            ACADEMIC CREDENTIALS
          </p>
          <h3 className="mt-3 font-display text-4xl font-black uppercase leading-[0.95] sm:text-5xl">
            Siena College,
            <br />
            New York
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Bachelor's degree trajectory — the drafting fundamentals:
            rigorous argument, clean notation, and the habit of showing
            every line of work.
          </p>
          <div className="mt-6 border-t border-ink/30 pt-4 font-tech text-[10px] tracking-[0.2em] text-ink-soft">
            LOUDONVILLE, NY · 42.86°N / 73.75°W
          </div>
        </div>

        <div
          ref={rvB}
          className="rv relative border-2 border-ink bg-ink p-7 text-paper shadow-[8px_8px_0_0_rgb(210_105_30_/_0.55)] lg:col-span-7"
          style={{ "--d": "150ms" } as never}
        >
          <p className="font-tech text-[11px] tracking-[0.25em] text-rust">
            DRAWING NOTES
          </p>
          <ol className="mt-4 space-y-2.5 font-tech text-xs leading-relaxed tracking-[0.06em] text-paper/85">
            <li>1. ASSEMBLY RENDERED LIVE — WEBGL / REACT THREE FIBER, NPR INK SHADERS.</li>
            <li>2. ALL RELAY CLICKS SPATIALLY PANNED TO CURSOR POSITION.</li>
            <li>3. CAMERA PATH: CATMULL-ROM SPLINE, SCROLL-PARAMETERIZED.</li>
            <li>4. FOCAL PLANE BLURS WHILE READING; SNAPS SHARP ON DWELL.</li>
            <li>5. DO NOT SCALE FROM SCREEN. VERIFY ON SITE.</li>
          </ol>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-tech text-[10px] tracking-[0.25em] text-paper/60">
                APPROVED BY
              </p>
              <p className="mt-2 font-display text-3xl font-black uppercase italic tracking-wide">
                S. Afridi
              </p>
              <div className="mt-1 h-[2px] w-44 bg-rust" />
              <p className="mt-2 font-tech text-[10px] tracking-[0.2em] text-paper/60">
                DATE: 2026 · CHECKED: SA · SHEET 05/05
              </p>
            </div>
            <div className="stamp-wobble border-[3px] border-rust px-4 py-2 text-center">
              <p className="font-display text-xl font-black uppercase tracking-[0.18em] text-rust">
                Issued for
                <br />
                Construction
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer() {
  const mag = useMagnetic<HTMLAnchorElement>(20);
  return (
    <footer className="relative border-t-2 border-ink px-5 py-16 sm:px-10 lg:px-16">
      <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
        <div>
          <p className="font-tech text-[11px] tracking-[0.3em] text-rust">
            END OF SHEET — CONTINUE OFF-SHEET
          </p>
          <SplitText
            as="h2"
            text="Open a work order."
            stagger={30}
            className="mt-3 block font-display text-[clamp(2.8rem,7vw,6rem)] font-black uppercase leading-[0.9]"
          />
          <a
            href="mailto:workorders@sajidafridi.dev"
            data-relay
            onMouseEnter={tickOn}
            onClick={(e) => spatialAudio.click(panFromX(e.clientX), 0.9)}
            ref={mag}
            className="group mt-7 inline-flex items-center gap-4 border-2 border-ink bg-paper px-7 py-4 font-display text-2xl font-extrabold uppercase tracking-wide transition-colors duration-200 hover:bg-rust hover:text-paper"
          >
            workorders@sajidafridi.dev
            <svg
              className="h-6 w-6 transition-transform duration-200 group-hover:translate-x-1.5 group-hover:-translate-y-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <path d="M6 18 18 6M9 6h9v9" />
            </svg>
          </a>
        </div>

        <div className="font-tech text-[10px] leading-relaxed tracking-[0.2em] text-ink-soft">
          <p>DRAWN: WEBGL + WEB AUDIO API</p>
          <p>CHECKED: REACT THREE FIBER</p>
          <p>SHEET SET: SA-2026 REV C</p>
          <a
            href="#top"
            data-relay
            onMouseEnter={tickOn}
            className="mt-3 inline-block text-rust underline decoration-dashed underline-offset-4 transition-colors hover:text-ink"
          >
            ↑ RETURN TO TITLE BLOCK
          </a>
        </div>
      </div>
      <p className="mt-12 border-t border-ink/25 pt-4 font-tech text-[10px] tracking-[0.22em] text-ink-faint">
        © 2026 SAJID AFRIDI — BRIDGING SOVEREIGN INTELLIGENCE & PHYSICAL AUTOMATION
      </p>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Overlay root — crawlable DOM at z-20 over the WebGL canvas (z-10)   */
/* ------------------------------------------------------------------ */

export function BlueprintOverlay() {
  return (
    <div className="relative z-20">
      <TitleBlock />
      <TelemetrySection />
      <SystemsSection />
      <NetworkSection />
      <RecordSection />
      <Footer />
    </div>
  );
}
