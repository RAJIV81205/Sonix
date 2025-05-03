"use client";

import { PlayerProvider } from "@/context/PlayerContext";
import Sidebar from "@/components/dashboard/Sidebar";
import Player from "@/components/dashboard/Player";
import MobileSidebar from "@/components/dashboard/mobile/MobileSidebar";
import MobilePlayer from "@/components/dashboard/mobile/MobilePlayer";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  const verifyToken = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Token invalid or expired");
      }

      const data = await response.json();
      console.log("Token verified:", data); // Optional debug log
    } catch (error) {
      console.error(error);
      toast.error("Session expired, please login again.");
      localStorage.clear();
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 950);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    verifyToken(); // ✅ Call the token check here

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black text-white flex items-center justify-center">
        <div className="w-full h-screen bg-gradient-to-b from-blue-900/20 to-gray-900 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <PlayerProvider>
      {isMobile ? (
        <div className="w-full h-screen bg-gradient-to-b from-[#121212] to-[#181818] text-white">
          {children}
          <MobileSidebar />
          <MobilePlayer />
        </div>
      ) : (
        <div className="w-full h-screen bg-gradient-to-b from-[#121212] to-[#181818] text-white flex flex-col relative">
          <div className="flex-1 flex flex-col md:grid md:grid-cols-5 gap-2 p-4 pb-0 relative overflow-hidden mb-22">
            <div className="w-full md:w-auto md:col-span-1 border-2 border-gray-100/20 rounded-3xl overflow-y-scroll">
              <Sidebar />
            </div>
            <div className="flex-1 md:col-span-4 border-2 border-gray-100/20 rounded-3xl overflow-y-auto h-full">
              {children}
            </div>
          </div>
          <div className="w-full fixed bottom-0 z-10 bg-black">
            <Player />
          </div>
        </div>
      )}
    </PlayerProvider>
  );
}
