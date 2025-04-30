
const DashboardPage = () => {
    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-[#121212] to-[#181818] text-white flex flex-col gap-6 p-4">
            <div className="grid grid-cols-5 grid-rows-5 gap-2 h-full w-full">
                <div className="row-span-5 border-2 border-gray-200">1</div>
                <div className="col-span-4 row-span-5 border-2 border-gray-200">2</div>
            </div>
        </div>
    )
}

export default DashboardPage;