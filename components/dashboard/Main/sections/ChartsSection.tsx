import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGsapStagger } from "@/lib/hooks/useGsapstagger";

interface ChartItem {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
}

interface ChartsSectionProps {
  title?: string;
  data: ChartItem[];
  gridCols?: string;
  showDescription?: boolean;
}

const ChartsSection = ({ 
  title = "Charts", 
  data, 
  gridCols = "grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8",
  showDescription = false 
}: ChartsSectionProps) => {
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
    trigger: data.length,
    inView: chartsInView,
    stagger: 0.8,
  });

  // Don't render if no data
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <motion.div
      ref={chartsRef}
      variants={fadeInUp}
      initial="hidden"
      animate={chartsInView ? "visible" : "hidden"}
      className="p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>

      <div className={`grid ${gridCols} gap-3`}>
        {data.map((chart, index) => (
          <Link
            key={chart.id}
            href= {`/dashboard/charts/${chart.id}`}
            className="group cursor-pointer"
            ref={(el) => {
              if (el) chartsItemsRef.current[index] = el;
            }}
          >
            <div className="bg-zinc-900 rounded-xl p-3 hover:bg-zinc-800 transition-colors cursor-pointer relative group">
              <div className="w-full aspect-square mb-2 rounded-lg shadow-lg overflow-hidden relative">
                <img
                  src={chart.image}
                  alt={chart.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback for broken images
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5DaGFydDwvdGV4dD4KPC9zdmc+';
                  }}
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

              <h3 className="font-medium text-sm truncate">
                {chart.title}
              </h3>
              {showDescription && chart.description && (
                <p className="text-xs text-zinc-400 truncate">
                  {chart.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default ChartsSection;