import { useCallback, useEffect, useRef, useState } from "react";

/* Everything below degrades to "simply present" when motion is reduced. */

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return reduced;
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);

  return matches;
}

/**
 * Fade up on first scroll into view, once. Never re-animates on scroll back.
 * Returns a ref to put on the element (or a group container, with `stagger`).
 */
export function useReveal({ stagger = 0, threshold = 0.05 } = {}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const targets = stagger
      ? Array.from(node.children)
      : [node];

    targets.forEach((el, i) => {
      el.classList.add("pk-reveal");
      if (stagger) el.style.setProperty("--reveal-delay", `${i * stagger}ms`);
    });

    if (reduced) {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }

    // Groups are observed as a whole rather than child by child. A staggered
    // group may be a horizontal rail on small screens, where the later cards
    // sit off to the right and would otherwise never intersect the viewport —
    // leaving them stuck invisible until the visitor swiped.
    const observed = stagger ? [node] : targets;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          if (stagger) targets.forEach((el) => el.classList.add("is-in"));
          else entry.target.classList.add("is-in");
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold }
    );

    observed.forEach((el) => io.observe(el));

    // Failsafe: content must never be trapped invisible.
    const failsafe = window.setTimeout(
      () => targets.forEach((el) => el.classList.add("is-in")),
      6000
    );

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [stagger, threshold, reduced]);

  return ref;
}

/** Count up over ~1800ms when the number scrolls into view. */
export function useCountUp(to, { from = 0, duration = 1800 } = {}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? to : from);

  useEffect(() => {
    if (reduced) {
      setValue(to);
      return;
    }

    const node = ref.current;
    if (!node) return;

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          const t0 = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(from + (to - from) * eased));
            if (p < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );

    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, from, duration, reduced]);

  return [value, ref];
}

/** Throttled scroll listener on rAF. */
export function useScroll(handler) {
  const saved = useRef(handler);
  saved.current = handler;

  useEffect(() => {
    let queued = false;
    const run = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        saved.current();
      });
    };
    run();
    window.addEventListener("scroll", run, { passive: true });
    window.addEventListener("resize", run);
    return () => {
      window.removeEventListener("scroll", run);
      window.removeEventListener("resize", run);
    };
  }, []);
}

/** 0 → 1 progress through a pinned section. */
export function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0);

  useScroll(
    useCallback(() => {
      const node = ref.current;
      if (!node) return;
      const span = node.offsetHeight - window.innerHeight;
      const p = -node.getBoundingClientRect().top / (span || 1);
      setProgress(Math.max(0, Math.min(1, p)));
    }, [ref])
  );

  return progress;
}

/** Which anchor section is currently in view, for the nav. */
export function useScrollSpy(ids, offset = 100) {
  const [active, setActive] = useState(null);

  useScroll(
    useCallback(() => {
      let current = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - offset <= 0) current = id;
      }
      setActive(current);
    }, [ids, offset])
  );

  return active;
}

/** Trap focus inside an open dialog and restore it on close. */
export function useFocusTrap(active) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const previous = document.activeElement;
    const selector =
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const focusables = () => Array.from(node.querySelectorAll(selector));
    focusables()[0]?.focus();

    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    node.addEventListener("keydown", onKeyDown);

    const { overflow, paddingRight } = document.body.style;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    return () => {
      node.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [active]);

  return ref;
}

/** State that survives a reload — used so a half-typed enquiry is never lost. */
export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode, quota, blocked storage — the page still works. */
    }
  }, [key, value]);

  return [value, setValue];
}
