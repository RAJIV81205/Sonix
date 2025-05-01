"use client"

import { PlayerProvider } from "@/context/PlayerContext";
import Sidebar from "@/components/dashboard/Sidebar";
import Player from "@/components/dashboard/Player";
import MobileSidebar from "@/components/dashboard/mobile/MobileSidebar";
import MobilePlayer from "@/components/dashboard/mobile/MobilePlayer";
import React, { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768); // 768px is our md breakpoint
      };

      // Initial check
      checkMobile();

      // Add event listener for window resize
      window.addEventListener('resize', checkMobile);

      // Cleanup
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  return (
    <PlayerProvider>
      {isMobile ? (
        // Mobile Layout
        <div className="w-full h-screen bg-gradient-to-b from-[#121212] to-[#181818] text-white">
          {children}
          <MobileSidebar />
          <MobilePlayer />
        </div>
      ) : (
        // Desktop Layout
        <div className="w-full h-screen bg-gradient-to-b from-[#121212] to-[#181818] text-white flex flex-col relative">
          {/* Main grid content */}
          <div className="flex-1 flex flex-col md:grid md:grid-cols-5 gap-2 p-4 pb-0 relative overflow-hidden mb-22">
            {/* Sidebar - fixed height, no scroll */}
            <div className="w-full md:w-auto md:col-span-1 border-2 border-gray-100/20 rounded-3xl overflow-y-scroll">
              <Sidebar />
            </div>

            {/* Main content - scrollable */}
            <div className="flex-1 md:col-span-4 border-2 border-gray-100/20 rounded-3xl overflow-y-auto h-full">
              {children}
            </div>
          </div>

          {/* Player - fixed at bottom */}
          <div className="w-full fixed bottom-0 z-10 bg-black">
            <Player />
          </div>
        </div>
      )}
    </PlayerProvider>
  );
} 