const Hero = () => {
    return (
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-[#121212] z-10" />
          <img 
            src="https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=2000"
            alt="Music background"
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        
        {/* Content */}
        <div className="container relative z-20 px-6 md:px-8 text-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Feel the Music. 
              <span className="block bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                Live the Vibe.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Stream your favorite tracks, discover new artists, and create playlists — anytime, anywhere.
            </p>
            
            <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-[#9b87f5] hover:bg-[#8b77e5] text-white px-8 py-4 text-lg rounded-full transition">
                Get Started
              </button>
              <button className="border border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-full transition">
                Explore Music
              </button>
            </div>
            
            <div className="pt-12 flex justify-center items-end h-12">
              <div className="wave-1 wave-animation"></div>
              <div className="wave-2 wave-animation"></div>
              <div className="wave-3 wave-animation"></div>
              <div className="wave-4 wave-animation"></div>
              <div className="wave-5 wave-animation"></div>
              <div className="wave-4 wave-animation"></div>
              <div className="wave-3 wave-animation"></div>
              <div className="wave-2 wave-animation"></div>
              <div className="wave-1 wave-animation"></div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default Hero;
  