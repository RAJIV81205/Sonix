"use client"


import MusicSearchBar from "@/components/dashboard/Search";
import MobileSearch from "@/components/dashboard/mobile/MobileSearch";
import { useEffect, useState } from "react";

const SearchPage = () => {
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
            {isMobile ? <MobileSearch /> : <MusicSearchBar />}
        </>
    );
};

export default SearchPage;