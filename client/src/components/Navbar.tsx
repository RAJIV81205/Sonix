

const Navbar = () => {
    return (
        <header className="w-full ">
            <nav className="bg-[#8B4513] text-white p-4">
                <div className="max-w-7xl mx-auto flex items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
                        <span className="text-xl font-semibold">Wizarding World</span>
                    </div>
                    <div className="ml-auto space-x-6">
                        <span>Home</span>
                        <span>Characters</span>
                        <span>Spells</span>
                        <span>About</span>
                    </div>
                </div>
            </nav>
        </header>
    )
}


export default Navbar