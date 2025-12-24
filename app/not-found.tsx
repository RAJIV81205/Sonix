"use client";

import { index } from "drizzle-orm/gel-core";
import Image from "next/image";
import Snowfall from "react-snowfall";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center text-zinc-100 bg-cover bg-center">
      {/* Snow */}
      <Snowfall
        color="white"
        snowflakeCount={200}
        style={{
          background: "transparent",
          zIndex: 11,
        }}
      />
      <Image
        src="/winter.webp"
        alt="Winter night background"
        fill
        priority
        className="object-cover "
      />

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-lg">
        {/* 404 */}
        <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight">
          404
        </h1>

        {/* Dog */}
        <div className="mt-6 flex justify-center">
          <div className="relative animate-float">
            <Image
              src="/dog.webp"
              alt="Confused dog"
              width={800}
              height={800}
              priority
              className="select-none"
            />

            {/* Question marks */}
            <span className="qm qm-1">?</span>
            <span className="qm qm-2">?</span>
            <span className="qm qm-3">?</span>
          </div>
        </div>

        {/* Message */}
        <p className="mt-4 text-zinc-200/80 text-base">
          Oops… even I’m confused where this page went.
        </p>

        {/* CTA */}
        <a
          href="/"
          className="inline-block mt-6 px-6 py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 transition text-sm font-medium shadow-lg backdrop-blur"
        >
          Take me home →
        </a>
      </div>
    </div>
  );
}
