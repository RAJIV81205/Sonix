"use client";

import React from "react";
import { usePageTransition } from "@/context/TransitionContext"
import { Play, Headphones } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Hero = () => {
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const navigate = usePageTransition();

  useEffect(() => {
    if (
      !badgeRef.current ||
      !titleRef.current ||
      !descRef.current ||
      !ctaRef.current ||
      !statsRef.current
    )
      return;

    // ✅ FIX: ensure buttons are visible
    gsap.set(ctaRef.current.querySelectorAll("button"), { opacity: 1 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(badgeRef.current!, {
        opacity: 0,
        y: 20,
        duration: 0.5,
      })
        .from(
          titleRef.current!.children,
          {
            opacity: 0,
            y: 40,
            stagger: 0.08,
            duration: 0.7,
          },
          "-=0.2"
        )
        .from(
          descRef.current!,
          {
            opacity: 0,
            y: 20,
            duration: 0.4,
          },
          "-=0.3"
        )
        .from(
          ctaRef.current!.querySelectorAll("button"),
          {
            opacity: 0,
            scale: 1,
            y: 20,
            stagger: 0.15,
            duration: 0.6,
            ease: "elastic.out(1, 0.6)",
          },
          "-=0.2"
        )
        .from(
          statsRef.current!.children,
          {
            opacity: 0,
            y: 20,
            stagger: 0.1,
            duration: 0.5,
          },
          "-=0.2"
        );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center overflow-hidden px-4 ">
      {/* Overlay pattern */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik01NC42MjcgMEw4NS4zNzMgMzAuNzQ2IDU0LjYyNyA2MS40OTFsMCAtNjEuNDkxeiIgY2xhc3M9InNoYXBlIiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjAyIj48L3BhdGg+Cjwvc3ZnPg==')] bg-repeat" />
      </div>

      {/* Purple/blue glow effects */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-600 rounded-full filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-20 -right-20 w-72 h-72 bg-blue-600 rounded-full filter blur-[128px] opacity-20"></div>

      {/* Content */}
      <div className="container relative z-20 max-w-6xl mx-auto text-center my-25">
        <div className="space-y-8">
          <div
            ref={badgeRef}
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-800/60 rounded-full border border-gray-700 mb-4"
          >
            <span className="text-purple-400 text-sm font-medium mr-2">
              New
            </span>
            <span className="text-gray-300 text-sm">
              Premium plan available now
            </span>
          </div>

          <h1
            ref={titleRef}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
          >
            <span className="block">Feel the Music.</span>
            <span className="block bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Live the Vibe.
            </span>
          </h1>

          <p
            ref={descRef}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Stream your favorite tracks, discover new artists, and create
            playlists — anytime, anywhere.
          </p>

          <div
            ref={ctaRef}
            className="pt-6 flex flex-col sm:flex-row justify-center gap-4"
          >
            <button
              onClick={() => navigate("/auth/login")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg rounded-lg transition duration-300 flex items-center justify-center gap-2 font-medium w-full sm:w-auto"
            >
              <Play size={20} />
              Get Started
            </button>

            <button className="border border-gray-700 bg-gray-800/50 text-white hover:bg-gray-700 px-8 py-4 text-lg rounded-lg transition duration-300 flex items-center justify-center gap-2 font-medium w-full sm:w-auto">
              <Headphones size={20} />
              Explore Music
            </button>
          </div>

          {/* Stats */}
          <div
            ref={statsRef}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-800 max-w-3xl mx-auto"
          >
            <div className="p-4">
              <div className="text-3xl font-bold text-white">20M+</div>
              <div className="text-gray-400 text-sm">Songs</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-white">5M+</div>
              <div className="text-gray-400 text-sm">Users</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-white">500K+</div>
              <div className="text-gray-400 text-sm">Artists</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-white">2M+</div>
              <div className="text-gray-400 text-sm">Playlists</div>
            </div>
          </div>
        </div>

        {/* Audio Visualizer */}
        <div className="pt-12 flex justify-center items-end h-24 gap-1">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="w-2 md:w-3 bg-purple-600 rounded-full opacity-90 animate-pulse"
              style={{
                height: `${Math.max(8, Math.sin(i * 0.8) * 20 + 20)}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${0.8 + Math.random() * 0.5}s`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
