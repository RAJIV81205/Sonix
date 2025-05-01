"use client"

import PlaylistPage from "@/components/dashboard/PlaylistPage";
import MobilePlaylistPage from "@/components/dashboard/mobile/MobilePlaylistPage";
import { useEffect, useState } from "react";

const PlaylistDetailsPage = () => {
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
        <>
            {isMobile ? <MobilePlaylistPage /> : <PlaylistPage />}
        </>
    );
};

export default PlaylistDetailsPage;