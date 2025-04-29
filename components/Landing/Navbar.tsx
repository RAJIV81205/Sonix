"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"
import Link from "next/link";

const Navbar = () => {

    const router = useRouter();

    const handleLogin = () => {
        router.push("/auth/login");
    };

    const handleSignup = () => {
        router.push("/auth/register")
    }


    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
                    ? "bg-black/90 backdrop-blur-md shadow-md py-3"
                    : "bg-transparent py-5"
                }`}
        >
            <div className="container px-6 md:px-8 mx-auto flex items-center justify-between">
                <Link
                    href="/"
                    className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent"
                >
                    Sonix
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    <div className="flex space-x-6">
                        {["Discover", "Playlists", "Premium", "Support"].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="font-medium text-white hover:text-[#9b87f5] transition"
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex space-x-3">
                        <button onClick={handleLogin} className="px-4 py-2 rounded-md text-white hover:bg-white/10 transition">
                            Log In
                        </button>
                        <button onClick={handleSignup} className="px-4 py-2 rounded-md bg-[#9b87f5] hover:bg-[#8b77e5] text-white transition">
                            Sign Up
                        </button>
                    </div>
                </div>

                <button
                    className="md:hidden"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <svg
                        className={`w-6 h-6 ${isScrolled ? "text-gray-900" : "text-white"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {isMobileMenuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden bg-white shadow-lg">
                    <div className="container py-4 px-6 space-y-3">
                        {["Discover", "Playlists", "Premium", "Support"].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="block py-2 font-medium text-gray-800 hover:text-[#9b87f5] transition"
                            >
                                {item}
                            </a>
                        ))}
                        <div className="pt-3 flex flex-col space-y-2">
                            <button 
                            onClick={handleLogin }
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 hover:bg-gray-100 transition">
                                Log In
                            </button>
                            <button
                            onClick={handleSignup} className="w-full px-4 py-2 rounded-md bg-gradient-to-r from-purple-400 to-blue-500 text-white hover:opacity-90 transition">
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
