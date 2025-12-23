"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"
import Link from "next/link";
import { Menu, X, Music } from 'lucide-react';
import gsap from "gsap";

const Navbar = () => {
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const menuItemsRef = useRef<HTMLDivElement>(null);
    const menuButtonsRef = useRef<HTMLDivElement>(null);

    const handleLogin = () => {
        router.push("/auth/login");
    };

    const handleSignup = () => {
        router.push("/auth/register")
    }

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            // Animate menu in
            if (mobileMenuRef.current) {
                gsap.set(mobileMenuRef.current, { opacity: 0, y: -20 });
                gsap.to(mobileMenuRef.current, { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.2, 
                    ease: "power2.out" 
                });
            }
            // Animate menu items
            if (menuItemsRef.current) {
                gsap.set(menuItemsRef.current.children, { opacity: 0, x: -20 });
                gsap.to(menuItemsRef.current.children, {
                    opacity: 1,
                    x: 0,
                    duration: 0.3,
                    stagger: 0.1,
                    delay: 0.1,
                    ease: "power2.out"
                });
            }
            // Animate buttons
            if (menuButtonsRef.current) {
                gsap.set(menuButtonsRef.current, { opacity: 0 });
                gsap.to(menuButtonsRef.current, {
                    opacity: 1,
                    duration: 0.3,
                    delay: 0.4,
                    ease: "power2.out"
                });
            }
        } else {
            document.body.style.overflow = 'auto';
            // Animate menu out
            if (mobileMenuRef.current) {
                gsap.to(mobileMenuRef.current, { 
                    opacity: 0, 
                    y: -20, 
                    duration: 0.2, 
                    ease: "power2.in" 
                });
            }
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileMenuOpen]);

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 overflow-x-hidden ${
                    isScrolled
                    ? "bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800 py-3"
                    : "bg-transparent py-5"
                }`}
            >
                <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-2xl font-bold"
                    >
                        <Music className="text-purple-500" size={28} />
                        <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                            Sonix
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <div className="flex space-x-6">
                            {["Discover", "Playlists", "Premium", "Support"].map((item) => (
                                <a
                                    key={item}
                                    href="#"
                                    className="font-medium text-gray-300 hover:text-purple-400 transition-colors"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>

                        <div className="flex space-x-3">
                            <button 
                                onClick={handleLogin} 
                                className="px-4 py-2 rounded-lg text-gray-200 hover:bg-gray-800 transition"
                            >
                                Log In
                            </button>
                            <button 
                                onClick={handleSignup} 
                                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>

                    <button
                        className="md:hidden text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </nav>

            {isMobileMenuOpen && (
                <div
                    ref={mobileMenuRef}
                    className="fixed inset-0 z-40 bg-gray-900 md:hidden overflow-hidden"
                >
                    <div className="flex flex-col h-full">
                        <div className="pt-20 px-6 flex-1 overflow-y-auto">
                            <div 
                                ref={menuItemsRef}
                                className="flex flex-col space-y-6 py-8"
                            >
                                {["Discover", "Playlists", "Premium", "Support"].map((item) => (
                                    <a
                                        key={item}
                                        href="#"
                                        className="text-2xl font-medium text-gray-200 hover:text-purple-400 transition py-2"
                                    >
                                        {item}
                                    </a>
                                ))}
                            </div>
                            
                            <div 
                                ref={menuButtonsRef}
                                className="mt-12 flex flex-col space-y-4"
                            >
                                <button 
                                    onClick={handleLogin}
                                    className="w-full px-4 py-4 border border-gray-700 rounded-lg text-gray-200 hover:bg-gray-800 transition"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={handleSignup} 
                                    className="w-full px-4 py-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;