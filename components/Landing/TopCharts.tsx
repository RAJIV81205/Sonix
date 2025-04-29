import { Play } from "lucide-react";

const chartData = [
  {
    id: 1,
    title: "Midnight Vibes",
    artist: "Luna Ray",
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=400"
  },
  {
    id: 2,
    title: "Electric Dreams",
    artist: "Neon Pulse",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400"
  },
  {
    id: 3,
    title: "Ocean Waves",
    artist: "Aqua Beat",
    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=400"
  },
  {
    id: 4,
    title: "Urban Jungle",
    artist: "Metro Sounds",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400"
  }
];

const TopCharts = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#121212] to-[#181818]">
      <div className="container px-6 md:px-8">
        <h2 className="section-title text-center">Top Charts</h2>
        <p className="section-subtitle text-center">
          The hottest tracks trending right now
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {chartData.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl bg-white/5 backdrop-blur-sm overflow-hidden transition-all hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative w-full aspect-square overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="w-12 h-12 rounded-full bg-[#9b87f5] text-white flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopCharts;
