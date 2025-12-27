import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useRef, useMemo } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGsapStagger } from "@/lib/hooks/useGsapstagger";
import { topHits } from "@/lib/constant";


const TopHitsSection = () => {
  const topHitsItemsRef = useRef<HTMLAnchorElement[]>([]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const { ref: topHitsRef, inView: topHitsInView } = useInView({
    triggerOnce: true,
    threshold: 0.15,
  });

  useGsapStagger(topHitsItemsRef, {
    trigger: 4,
    inView: topHitsInView,
    stagger: 0.8,
  });

  return (
    <motion.div
      ref={topHitsRef}
      variants={fadeInUp}
      initial="hidden"
      animate={topHitsInView ? "visible" : "hidden"}
      className="p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Top Hits</h2>
        
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {topHits.map((hit, index) => (
          <Link
            key={hit.id}
            href={hit.link}
            className="group cursor-pointer"
            ref={(el) => {
              if (el) topHitsItemsRef.current[index] = el;
            }}
          >
            <div className="bg-zinc-900 rounded-xl p-4 hover:bg-zinc-800 transition-all duration-300 group-hover:scale-105">
              <div className="w-full aspect-square mb-3 rounded-lg shadow-lg overflow-hidden relative">
                {/* Top hit background image */}
                <img
                  src={hit.image}
                  alt={hit.title}
                  className="w-full h-full object-cover"
                  onClick={(e) => {
                    // Add click animation
                    const target = e.currentTarget.closest(".group");
                    if (target) {
                      gsap.to(target, {
                        scale: 0.95,
                        duration: 0.1,
                        ease: "power2.out",
                        yoyo: true,
                        repeat: 1,
                      });
                    }
                  }}
                />
              </div>

              <h3 className="font-medium text-sm truncate mb-1">
                {hit.title}
              </h3>
              {/* <p className="text-xs text-zinc-400 line-clamp-2">
                {hit.description}
              </p> */}
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default TopHitsSection;