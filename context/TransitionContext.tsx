"use client";

import React, { createContext, useContext, useRef } from "react";
import gsap from "gsap";
import { useRouter } from "next/navigation";

const TransitionContext = createContext<(href: string) => void>(() => {});

export const usePageTransition = () => useContext(TransitionContext);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const topBar = useRef<HTMLDivElement>(null);
  const bottomBar = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const navigate = async (href: string) => {
    // CLOSE
    await new Promise<void>((resolve) => {
      const tl = gsap.timeline({ onComplete: resolve });

      tl.to(content.current, {
        scale: 0.96,
        opacity: 0.6,
        filter: "blur(6px)",
        duration: 0.8,
        ease: "power2.out",
      })
        .to(
          topBar.current,
          {
            y: "0%",
            duration: 1.2,
            ease: "power3.inOut",
          },
          "<0.1"
        )
        .to(
          bottomBar.current,
          {
            y: "0%",
            duration: 1.2,
            ease: "power3.inOut",
          },
          "<0.15"
        )
        // HOLD
        .to({}, { duration: 0.3 });
    });

    router.push(href);

    // OPEN
    const tl = gsap.timeline();

    tl.to(topBar.current, {
      y: "-150%",
      duration: 1.2,
      ease: "power3.inOut",
    })
      .to(
        bottomBar.current,
        {
          y: "150%",
          duration: 1.2,
          ease: "power3.inOut",
        },
        "<0.1"
      )
      .to(
        content.current,
        {
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power2.out",
        },
        "<0.2"
      );
  };

  return (
    <TransitionContext.Provider value={navigate}>
      {/* TRANSITION LAYERS */}
      <div className="pointer-events-none fixed inset-0 z-[9999]">
        <div
          ref={topBar}
          className="absolute top-0 h-[50vh] w-full bg-purple-800 -translate-y-full"
        />
        <div
          ref={bottomBar}
          className="absolute bottom-0 h-[50vh] w-full bg-gray-900 translate-y-full"
        />
      </div>

      {/* PAGE CONTENT */}
      <div ref={content}>{children}</div>
    </TransitionContext.Provider>
  );
}
