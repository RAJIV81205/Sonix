export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-[#0b0e14] overflow-hidden flex items-center justify-center text-zinc-100">

      {/* Subtle stars */}
      <div className="absolute inset-0 bg-stars opacity-40" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-md">

        {/* 404 */}
        <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight text-zinc-200">
          404
        </h1>

        {/* Puppy */}
        <div className="mt-6 flex justify-center">
          <div className="relative animate-float">
            <div className="text-[96px] select-none animate-blink">
              🐶
            </div>

            {/* Question marks */}
            <span className="qm qm-1">?</span>
            <span className="qm qm-2">?</span>
            <span className="qm qm-3">?</span>
          </div>
        </div>

        {/* Message */}
        <p className="mt-4 text-zinc-400 text-base">
          Oops… even I’m confused where this page went.
        </p>

        {/* CTA */}
        <a
          href="/"
          className="inline-block mt-6 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition text-sm font-medium shadow-lg"
        >
          Take me home →
        </a>
      </div>
    </div>
  );
}
