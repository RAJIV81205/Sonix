"use client";

import React from "react";
import { Play, TrendingUp, ArrowRight, Headphones } from "lucide-react";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const chartData = [
  {
    id: 1,
    title: "Midnight Vibes",
    artist: "Luna Ray",
    plays: "2.4M",
    image:
      "https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=400",
  },
  {
    id: 2,
    title: "Electric Dreams",
    artist: "Neon Pulse",
    plays: "1.8M",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400",
  },
  {
    id: 3,
    title: "Ocean Waves",
    artist: "Aqua Beat",
    plays: "1.2M",
    image:
      "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=400",
  },
  {
    id: 4,
    title: "Urban Jungle",
    artist: "Metro Sounds",
    plays: "986K",
    image:
      "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400",
  },
];

const TopCharts = () => {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure ScrollTrigger is registered
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (cardsRef.current && cardsRef.current.children.length > 0) {
      // Set initial state
      gsap.set(cardsRef.current.children, {
        y: 60,
        opacity: 0
      });

      // Create the animation
      gsap.to(cardsRef.current.children, {
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        },
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
      });
    }

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-black to-gray-900 relative">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-black to-transparent z-0"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-[80px] z-0"></div>
      <div className="absolute top-1/3 left-20 w-64 h-64 bg-blue-600/10 rounded-full filter blur-[60px] z-0"></div>

      <div className="container px-6 md:px-8 max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 text-purple-500 mb-3">
              <TrendingUp size={18} />
              <span className="text-sm font-medium uppercase tracking-wider">
                Popular Now
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Top Charts
            </h2>
            <p className="text-gray-400 mt-2 max-w-lg">
              The hottest tracks trending right now on our platform
            </p>
          </div>

          <a
            href="#"
            className="mt-6 md:mt-0 text-purple-400 hover:text-purple-300 flex items-center gap-2 group transition duration-300"
          >
            <span className="font-medium">View all charts</span>
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </a>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {chartData.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl bg-gray-800/60 border border-gray-700/50 overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10 hover:border-gray-600/50"
            >
              <div className="relative w-full aspect-square overflow-hidden">
                <img
                  src={item.image.replace("150x150", "500x500")}
                  alt={item.title.replaceAll("&quot;", `"`)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-lg">
                    <Play className="w-6 h-6 ml-1" />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-lg text-white group-hover:text-purple-300 transition-colors duration-300">
                  {item.title.replaceAll("&quot;", `"`)}
                </h3>
                <p className="text-gray-400 text-sm mt-1">{item.artist}</p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700/50">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <Headphones size={14} />
                    <span>{item.plays} plays</span>
                  </div>
                  <button className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors duration-300">
                    Add to playlist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <button className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition duration-300 border border-gray-700 flex items-center gap-2">
            Explore All Trending Tracks
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopCharts;
