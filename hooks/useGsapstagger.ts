"use client";
import { useEffect } from "react";
import { gsap } from "gsap";

interface GsapStaggerOptions {
  trigger: any;
  stagger?: number;
  hover?: boolean;
}

export function useGsapStagger(
  refs: React.MutableRefObject<HTMLElement[]>,
  { trigger, stagger = 1, hover = true }: GsapStaggerOptions
) {
  useEffect(() => {
    if (!refs.current.length) return;

    // Initial state
    gsap.set(refs.current, {
      opacity: 0,
      scale: 0.6,
      y: 50,
      rotation: -5,
    });

    // Entrance animation
    gsap.to(refs.current, {
      opacity: 1,
      scale: 1,
      y: 0,
      rotation: 0,
      duration: 0.8,
      ease: "back.out(1.4)",
      stagger: {
        amount: stagger,
        from: "start",
        ease: "power2.out",
      },
    });

    if (!hover) return;

    // Hover animation
    refs.current.forEach((item) => {
      if (!item) return;

      const onEnter = () =>
        gsap.to(item, { scale: 1.05, y: -5, duration: 0.3, ease: "power2.out" });

      const onLeave = () =>
        gsap.to(item, { scale: 1, y: 0, duration: 0.3, ease: "power2.out" });

      item.addEventListener("mouseenter", onEnter);
      item.addEventListener("mouseleave", onLeave);

      // cleanup
      return () => {
        item.removeEventListener("mouseenter", onEnter);
        item.removeEventListener("mouseleave", onLeave);
      };
    });
  }, [trigger]);
}
