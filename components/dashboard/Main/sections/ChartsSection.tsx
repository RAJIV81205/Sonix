import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useRef, useMemo } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGsapStagger } from "@/lib/hooks/useGsapstagger";
import { charts } from "@/lib/constant";


const ChartsSection = () => {
  const chartsItemsRef = useRef<HTMLAnchorElement[]>([]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const { ref: chartsRef, inView: chartsInView } = useInView({
    triggerOnce: true,
    threshold: 0.15,
  });

  useGsapStagger(chartsItemsRef, {
    trigger: 4,
    inView: chartsInView,
    stagger: 0.8,
  });

  return (
    <motion.div
      ref={chartsRef}
      variants={fadeInUp}
      initial="hidden"
      animate={chartsInView ? "visible" : "hidden"}
      className="p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Charts</h2>
        
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {charts.map((chart, index) => (
          <Link
            key={chart.id}
            href={chart.link}
            className="group cursor-pointer"
            ref={(el) => {
              if (el) chartsItemsRef.current[index] = el;
            }}
          >
            <div className="bg-zinc-900 rounded-xl p-4 hover:bg-zinc-800 transition-all duration-300 group-hover:scale-105">
              <div className="w-full aspect-square mb-3 rounded-lg shadow-lg overflow-hidden relative">
                {/* Chart background image */}
                <img
                  src={chart.image}
                  alt={chart.title}
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
                {chart.title}
              </h3>
              {/* <p className="text-xs text-zinc-400 line-clamp-2">
                {chart.description}
              </p> */}
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default ChartsSection;
