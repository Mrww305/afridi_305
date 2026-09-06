import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Environment helpers                                                 */
/* ------------------------------------------------------------------ */

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function isFinePointer() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches
  );
}

/* ------------------------------------------------------------------ */
/* useReveal — IntersectionObserver adds .is-in once                   */
/* ------------------------------------------------------------------ */

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.16
) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}

/* ------------------------------------------------------------------ */
/* useCountUp — odometer that fires when the element scrolls in        */
/* ------------------------------------------------------------------ */

export function useCountUp<T extends HTMLElement = HTMLSpanElement>(
  target: number,
  { duration = 1500, decimals = 0 }: { duration?: number; decimals?: number } = {}
) {
  const ref = useRef<T | null>(null);
  const [display, setDisplay] = useState("0");
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fmt = (v: number) =>
      v.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    if (prefersReducedMotion()) {
      setDisplay(fmt(target));
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || fired.current) return;
        fired.current = true;
        io.disconnect();
        const t0 = performance.now();
        const loop = (now: number) => {
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(2, -10 * p);
          setDisplay(fmt(target * (p === 1 ? 1 : eased)));
          if (p < 1) requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration, decimals]);

  return { ref, display };
}

/* ------------------------------------------------------------------ */
/* useMagnetic — spring-damper lerp pulling the element toward cursor  */
/* ------------------------------------------------------------------ */

export function useMagnetic<T extends HTMLElement = HTMLDivElement>(
  strength = 18,
  radius = 170
) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !isFinePointer()) return;
    let tx = 0,
      ty = 0,
      x = 0,
      y = 0,
      vx = 0,
      vy = 0,
      raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.hypot(dx, dy);
      if (d < radius) {
        const pull = 1 - d / radius;
        tx = dx * pull * (strength / 42);
        ty = dy * pull * (strength / 42);
      } else {
        tx = 0;
        ty = 0;
      }
    };
    const loop = () => {
      vx = (vx + (tx - x) * 0.1) * 0.76;
      vy = (vy + (ty - y) * 0.1) * 0.76;
      x += vx;
      y += vy;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, [strength, radius]);
  return ref;
}

/* ------------------------------------------------------------------ */
/* useInkBleed — elastic SVG displacement on hover, spring snap-back   */
/* Expects <filter id="ink-bleed-filter"> with #ink-turb + #ink-disp.  */
/* ------------------------------------------------------------------ */

export function useInkBleed<T extends HTMLElement = HTMLHeadingElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const disp = document.getElementById("ink-disp");
    const turb = document.getElementById("ink-turb");
    if (!disp) return;
    let scale = 0,
      target = 0,
      raf = 0,
      running = false;
    const loop = () => {
      scale += (target - scale) * (target > 0 ? 0.16 : 0.1);
      if (target === 0 && Math.abs(scale) < 0.06) {
        scale = 0;
        disp.setAttribute("scale", "0");
        running = false;
        return;
      }
      disp.setAttribute("scale", scale.toFixed(2));
      if (turb && target > 0) {
        const w = 0.012 + Math.sin(performance.now() * 0.018) * 0.007;
        turb.setAttribute("baseFrequency", `${w.toFixed(4)} 0.021`);
      }
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const enter = () => {
      target = 15;
      kick();
    };
    const leave = () => {
      target = 0;
      kick();
    };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);
  return ref;
}

/* ------------------------------------------------------------------ */
/* useUtcClock — living header readout                                 */
/* ------------------------------------------------------------------ */

export function useUtcClock() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setTime(`${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}
