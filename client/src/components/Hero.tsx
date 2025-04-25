import Characters from "./Characters"
import Chat from "./Chat"

const Hero = () => {
    return (
        <div className="min-h-screen bg-[#FDF6E9] w-full">
           

            <div className="w-full mx-auto p-4 grid grid-cols-12 gap-6">
                {/* Left Sidebar - Characters */}
                <Characters />
               

                {/* Main Chat Area */}
                <Chat />

                {/* Right Sidebar - Encyclopedia */}
                <div className="col-span-3 space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                        <h2 className="text-[#8B4513] font-semibold text-lg mb-4">Magical Encyclopedia</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Hogwarts School</h3>
                                <p className="text-sm text-gray-600">Learn about the School of Witchcraft and Wizardry</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Magical Spells</h3>
                                <p className="text-sm text-gray-600">A comprehensive list of spells and their effects</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Magical Creatures</h3>
                                <p className="text-sm text-gray-600">Discover the fantastic beasts of the wizarding world</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-lg">
                        <h2 className="text-[#8B4513] font-semibold text-lg mb-4">Daily Prophet</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Triwizard Tournament Returns</h3>
                                <p className="text-sm text-gray-600">Hogwarts to host the legendary competition after decades...</p>
                                <a href="#" className="text-red-600 text-sm">Read more →</a>
                            </div>
                            <div>
                                <h3 className="font-semibold">New Defense Against Dark Arts Professor</h3>
                                <p className="text-sm text-gray-600">Ministry appoints renowned Auror to teaching position...</p>
                                <a href="#" className="text-red-600 text-sm">Read more →</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero