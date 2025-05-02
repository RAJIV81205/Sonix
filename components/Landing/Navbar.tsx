"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"
import Link from "next/link";
import { Menu, X, Music } from 'lucide-react';

const Navbar = () => {
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
                isScrolled
                ? "bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800 py-3"
                : "bg-transparent py-5"
            }`}
        >
            <div className="container px-6 md:px-8 mx-auto flex items-center justify-between">
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
                >
                    {isMobileMenuOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800 shadow-lg animate-fade-in">
                    <div className="container py-4 px-6 space-y-3">
                        {["Discover", "Playlists", "Premium", "Support"].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="block py-2 font-medium text-gray-300 hover:text-purple-400 transition"
                            >
                                {item}
                            </a>
                        ))}
                        <div className="pt-3 flex flex-col space-y-2">
                            <button 
                                onClick={handleLogin}
                                className="w-full px-4 py-3 border border-gray-700 rounded-lg text-gray-200 hover:bg-gray-800 transition"
                            >
                                Log In
                            </button>
                            <button
                                onClick={handleSignup} 
                                className="w-full px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition"
                            >
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