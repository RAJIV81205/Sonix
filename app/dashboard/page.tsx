"use client"

import Main from "@/components/dashboard/Main";
import MobileMain from "@/components/dashboard/mobile/MobileMain";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

const DashboardPage = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

            // Simulate content loading
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 1500); // Show loader for 1.5 seconds or adjust as needed

            // Cleanup
            return () => {
                window.removeEventListener('resize', checkMobile);
                clearTimeout(timer);
            };
        }
    }, []);

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <>
            {isMobile ? <MobileMain /> : <Main />}
        </>
    );
};

export default DashboardPage;