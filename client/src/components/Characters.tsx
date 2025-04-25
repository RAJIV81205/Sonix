

const Characters = () => {
    return (
        <div className="col-span-3 bg-white rounded-lg p-4 shadow-lg">
            <h2 className="text-[#8B4513] font-semibold text-lg mb-4 flex items-center">
                <span className="mr-2">👥</span> Popular Characters
            </h2>
            <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-[#FDF6E9] rounded-lg">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white">HP</div>
                    <span className="font-medium">Harry Potter</span>
                    <span className="ml-auto text-xs bg-yellow-100 px-2 py-1 rounded">Active</span>
                </div>
                <div className="flex items-center space-x-3 p-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">HG</div>
                    <span>Hermione Granger</span>
                </div>
                <div className="flex items-center space-x-3 p-2">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white">RW</div>
                    <span>Ron Weasley</span>
                </div>
                <div className="flex items-center space-x-3 p-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white">DM</div>
                    <span>Draco Malfoy</span>
                </div>
            </div>

            {/* Hogwarts Houses */}
            <h2 className="text-[#8B4513] font-semibold text-lg mt-6 mb-4 flex items-center">
                <span className="mr-2">🏰</span> Hogwarts Houses
            </h2>
            <div className="space-y-2">
                <div className="p-2 bg-gradient-to-r from-red-700 to-yellow-600 text-white rounded-lg">
                    Gryffindor
                </div>
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-black text-white rounded-lg">
                    Hufflepuff
                </div>
                <div className="p-2 bg-gradient-to-r from-blue-700 to-gray-800 text-white rounded-lg">
                    Ravenclaw
                </div>
                <div className="p-2 bg-gradient-to-r from-green-700 to-gray-800 text-white rounded-lg">
                    Slytherin
                </div>
            </div>
        </div>
    )
}

export default Characters