import { motion } from "framer-motion";
import { useInView } from 'react-intersection-observer';
import { useRef, useMemo } from 'react';
import Link from "next/link";
import { gsap } from 'gsap';
import { topArtists } from '@/lib/constant';
import { useGsapStagger } from '@/lib/hooks/useGsapstagger';

const ArtistsSection = () => {
    const artistsItemsRef = useRef<HTMLAnchorElement[]>([]);
    
    // Get 6 random artists
    const randomArtists = useMemo(() => {
        const shuffled = [...topArtists].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 8);
    }, []);
    
    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
    };

    const { ref: artistRef, inView: artistInView } = useInView({ triggerOnce: true, threshold: 0.15 });

    useGsapStagger(artistsItemsRef, {
        trigger: randomArtists.length,
        inView: artistInView,
        stagger: 0.6,
    });
    return (
        <motion.div
        ref={artistRef}
        variants={fadeInUp}
        initial="hidden"
        animate={artistInView ? 'visible' : 'hidden'}
        className="p-4 px-5"
      >
        <div className="flex flex-row items-center justify-between mb-4 px-2">
          <h2 className="text-xl font-bold">Top Artists</h2>
          <Link href="/dashboard/artist" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-8 gap-6 px-4 py-10">
          {randomArtists.map((artist, index) => (
            <Link 
              key={artist.id} 
              href={`dashboard/artist/${artist.id}`} 
              className="flex flex-col"
              ref={(el) => {
                if (el) artistsItemsRef.current[index] = el;
              }}
            >
              <div className="aspect-square bg-zinc-800 rounded-full mb-4 overflow-hidden border border-gray-400/40 hover:border-gray-400/60 transition-colors">
                <img 
                  src={artist.img} 
                  alt={artist.name} 
                  loading="lazy"
                  onClick={(e) => {
                    // Add click animation
                    const target = e.currentTarget.closest('a');
                    if (target) {
                      gsap.to(target, {
                        scale: 0.95,
                        duration: 0.1,
                        ease: "power2.out",
                        yoyo: true,
                        repeat: 1
                      });
                    }
                  }}
                />
              </div>
              <h3 className="font-medium text-sm text-center mb-1 truncate">{artist.name}</h3>
              <p className="text-xs text-zinc-400 text-center truncate">{artist.genre}</p>
            </Link>
          ))}
        </div>
      </motion.div>
    );
}

export default ArtistsSection;