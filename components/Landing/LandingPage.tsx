"use client"

import Link from "next/link";
import { useRouter } from "next/navigation"; // Correct import for navigation
import Image from "next/image";
import { Pause, SkipForward, SkipBack, Volume2, Music, Headphones, Download, Wifi, Star, Shuffle } from "lucide-react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import TopCharts from "./TopCharts";

export default function LandingPage() {


  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <Hero />
      <TopCharts />

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Sonix</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Discover the features that make Sonix the ultimate music experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:border-purple-500/50 transition-colors">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Headphones className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">High-Quality Audio</h3>
              <p className="text-zinc-400">
                Experience crystal clear sound with our lossless audio streaming technology.
              </p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:border-purple-500/50 transition-colors">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Download className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Offline Listening</h3>
              <p className="text-zinc-400">
                Download your favorite tracks and playlists to enjoy them without an internet connection.
              </p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:border-purple-500/50 transition-colors">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Wifi className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Cross-Device Sync</h3>
              <p className="text-zinc-400">
                Seamlessly switch between devices without missing a beat. Your music follows you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">Flexible pricing options to suit your needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="p-8">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <p className="text-zinc-400 mb-6">Basic features for casual listeners</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-zinc-400 ml-2">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                    <span>Ad-supported listening</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                    <span>Basic audio quality</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                    <span>Limited skips</span>
                  </li>
                </ul>
              </div>
              <div className="px-8 pb-8">
                <button className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md">Get Started</button>
              </div>
            </div>
            <div className="bg-zinc-900 rounded-2xl border border-purple-500 overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-center py-1 text-xs font-medium">
                MOST POPULAR
              </div>
              <div className="p-8 pt-12">
                <h3 className="text-xl font-bold mb-2">Premium</h3>
                <p className="text-zinc-400 mb-6">Enhanced features for music lovers</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold">$9.99</span>
                  <span className="text-zinc-400 ml-2">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                    <span>Ad-free listening</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                    <span>High quality audio</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                    <span>Unlimited skips</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                    <span>Offline listening</span>
                  </li>
                </ul>
              </div>
              <div className="px-8 pb-8">
                <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-md">
                  Get Premium
                </button>
              </div>
            </div>
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="p-8">
                <h3 className="text-xl font-bold mb-2">Family</h3>
                <p className="text-zinc-400 mb-6">Share the experience with loved ones</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold">$14.99</span>
                  <span className="text-zinc-400 ml-2">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                    <span>Up to 6 accounts</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                    <span>Premium for everyone</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                    <span>Parental controls</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                    <span>Lossless audio</span>
                  </li>
                </ul>
              </div>
              <div className="px-8 pb-8">
                <button className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md">Get Family Plan</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 md:py-32 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">Join thousands of satisfied music lovers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-zinc-300 mb-6">
                "Sonix has completely transformed how I experience music. The sound quality is unmatched and the
                interface is beautiful."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-full overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=48&width=48"
                    alt="User avatar"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">Alex Johnson</h4>
                  <p className="text-sm text-zinc-400">Premium User</p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-zinc-300 mb-6">
                "The family plan is perfect for us. Everyone gets their own personalized experience, and the parental
                controls give me peace of mind."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-full overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=48&width=48"
                    alt="User avatar"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">Sarah Miller</h4>
                  <p className="text-sm text-zinc-400">Family Plan User</p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-zinc-300 mb-6">
                "As a music producer, I appreciate the lossless audio quality. Sonix lets me hear every detail exactly
                as intended."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-full overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=48&width=48"
                    alt="User avatar"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">David Chen</h4>
                  <p className="text-sm text-zinc-400">Premium User</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Get Sonix Today</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">Available on all your favorite platforms</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center max-w-3xl mx-auto">
            <button className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 w-full md:w-auto flex items-center gap-2 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-apple"
              >
                <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                <path d="M10 2c1 .5 2 2 2 5" />
              </svg>
              <span>iOS App</span>
            </button>
            <button className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 w-full md:w-auto flex items-center gap-2 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-android-logo"
              >
                <path d="M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
                <path d="M7 10v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8" />
                <path d="M5 10h14" />
                <path d="M15 16a1 1 0 1 0 2 0 1 1 0 1 0-2 0" />
                <path d="M8 16a1 1 0 1 0 2 0 1 1 0 1 0-2 0" />
              </svg>
              <span>Android App</span>
            </button>
            <button className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 w-full md:w-auto flex items-center gap-2 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-laptop"
              >
                <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
              </svg>
              <span>Desktop App</span>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Experience Sonix?</h2>
            <p className="text-xl text-zinc-300 mb-8">
              Join millions of music lovers and start your journey today. No credit card required for free trial.
            </p>
            <button
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-md"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-6">
                <Music className="h-8 w-8 text-purple-500" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Sonix
                </span>
              </Link>
              <p className="text-zinc-400 mb-6">
                Your ultimate music companion. Discover, stream, and enjoy millions of songs.
              </p>
              <div className="flex gap-4">
                <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-twitter"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </button>
                <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-instagram"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </button>
                <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-facebook"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                    Licenses
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-zinc-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Sonix Music Player. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-zinc-500 hover:text-white text-sm">
                Privacy
              </Link>
              <Link href="#" className="text-zinc-500 hover:text-white text-sm">
                Terms
              </Link>
              <Link href="#" className="text-zinc-500 hover:text-white text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
