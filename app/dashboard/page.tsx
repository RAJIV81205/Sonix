
const DashboardPage = () => {
    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-[#121212] to-[#181818] text-white flex flex-col gap-6 p-4 ">
            <div className="grid grid-cols-5 grid-rows-5 gap-2 h-screen w-full">
            <div className="col-start-1 col-end-2 row-start-1 row-end-6 border-2 border-gray-100/20 rounded-3xl p-4 ">1</div>
            <div className="col-start-2 col-end-6 row-start-1 row-end-6 border-2 border-gray-100/20 rounded-3xl p-4">2</div>
            </div>
        </div>
    )
}

export default DashboardPage;