import { useState } from "react";
import { useMagnetic } from "./hooks";

/**
 * AudioGateway — the "Entry Gateway".
 * A drafting work-order that acquires an explicit user gesture so the
 * global Web Audio context (Sketch Hum + Relay Clicks) can initialize
 * cleanly under every autoplay policy.
 */
interface AudioGatewayProps {
  leaving: boolean;
  onEnter: (audioEnabled: boolean) => void;
}

export function AudioGateway({ leaving, onEnter }: AudioGatewayProps) {
  const [ambient, setAmbient] = useState(true);
  const [relays, setRelays] = useState(true);
  const btnRef = useMagnetic<HTMLButtonElement>(22, 190);

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center bg-paper p-4 ${
        leaving ? "gateway-leave pointer-events-none" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Entry gateway — audio permission"
    >
      <div className="bp-grid absolute inset-0" aria-hidden="true" />
      <div className="bp-vignette absolute inset-0" aria-hidden="true" />

      {/* Corner registration crosses */}
      {[
        "top-6 left-6",
        "top-6 right-6",
        "bottom-6 left-6",
        "bottom-6 right-6",
      ].map((pos) => (
        <svg
          key={pos}
          className={`absolute ${pos} h-8 w-8 text-ink/60`}
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
        >
          <path d="M16 2v28M2 16h28" stroke="currentColor" strokeWidth="1" />
          <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1" />
        </svg>
      ))}

      <div className="gateway-rise relative w-full max-w-xl border-2 border-ink bg-paper shadow-[10px_10px_0_0_rgb(27_54_93_/_0.16)]">
        {/* Title strip */}
        <div className="flex items-center justify-between border-b-2 border-ink bg-ink px-5 py-2.5 text-paper">
          <span className="font-tech text-[11px] tracking-[0.25em]">
            WORK ORDER Nº SA-2026-001
          </span>
          <span className="font-tech text-[11px] tracking-[0.25em] text-rust">
            REV C
          </span>
        </div>

        <div className="px-6 py-7 sm:px-9 sm:py-9">
          <p className="font-tech text-[11px] tracking-[0.3em] text-ink-soft">
            PERMIT TO OPERATE — DRAFTING FLOOR
          </p>
          <h1 className="mt-2 font-display text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl">
            Hands on
            <br />
            the <span className="text-rust">board.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
            This sheet is drawn live: a WebGL drafting assembly behind the ink,
            and a spatialized mechanical soundscape under your cursor. Arm the
            channels you want, then step onto the floor.
          </p>

          {/* Channel toggles */}
          <div className="mt-6 space-y-2.5">
            <ChannelToggle
              label="THE SKETCH HUM"
              desc="low draft-table drone · 46 Hz"
              on={ambient}
              onToggle={() => setAmbient((v) => !v)}
            />
            <ChannelToggle
              label="THE RELAY CLICK"
              desc="spatial switch-clinks on hover & press"
              on={relays}
              onToggle={() => setRelays((v) => !v)}
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              ref={btnRef}
              onClick={() => onEnter(ambient || relays)}
              className="group relative border-2 border-ink bg-rust px-7 py-3.5 font-display text-2xl font-extrabold uppercase tracking-wide text-paper transition-colors duration-200 hover:bg-ink"
            >
              Enter the drafting floor
              <svg
                className="ml-3 inline h-5 w-5 transition-transform duration-200 group-hover:translate-x-1.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <path d="M4 12h16M13 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => onEnter(false)}
              className="border-2 border-transparent px-4 py-3 font-tech text-xs tracking-[0.2em] text-ink-soft underline decoration-dashed underline-offset-4 transition-colors hover:text-rust"
            >
              ENTER MUTED
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-ink/30 px-6 py-2.5 font-tech text-[10px] tracking-[0.2em] text-ink-faint">
          <span>SCALE 1:1</span>
          <span>SHEET 00 / GATE</span>
        </div>
      </div>
    </div>
  );
}

function ChannelToggle({
  label,
  desc,
  on,
  onToggle,
}: {
  label: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      className={`flex w-full items-center gap-4 border-2 px-4 py-3 text-left transition-all duration-200 ${
        on
          ? "border-ink bg-ink text-paper"
          : "border-ink/35 bg-transparent text-ink-soft hover:border-ink/70"
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center border-2 ${
          on ? "border-rust bg-rust" : "border-current"
        }`}
      >
        {on && (
          <svg viewBox="0 0 16 16" className="h-4 w-4 text-paper" fill="none">
            <path
              d="M3 8.5 6.5 12 13 4.5"
              stroke="currentColor"
              strokeWidth="2.4"
            />
          </svg>
        )}
      </span>
      <span>
        <span className="block font-display text-lg font-bold uppercase tracking-wide">
          {label}
        </span>
        <span
          className={`block font-tech text-[10px] tracking-[0.15em] ${
            on ? "text-paper/70" : "text-ink-faint"
          }`}
        >
          {desc}
        </span>
      </span>
      <span
        className={`ml-auto font-tech text-[10px] tracking-[0.2em] ${
          on ? "text-rust" : "text-ink-faint"
        }`}
      >
        {on ? "ARMED" : "OFF"}
      </span>
    </button>
  );
}
