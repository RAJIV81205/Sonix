import Sidebar from "@/components/dashboard/Sidebar";
import Main from "@/components/dashboard/Main";
import Player from "@/components/dashboard/Player";

const DashboardPage = () => {
    return (
        <div className="w-full h-screen bg-gradient-to-b from-[#121212] to-[#181818] text-white flex flex-col relative">
            {/* Main grid content */}
            <div className="flex-1 grid grid-cols-5 gap-2 p-4 pb-0 relative overflow-hidden mb-24">
                {/* Sidebar - fixed height, no scroll */}
                <div className="col-span-1 border-2 border-gray-100/20 rounded-3xl overflow-hidden h-[85vh]">
                    <Sidebar />
                </div>

                {/* Main - scrollable */}
                <div className="col-span-4 border-2 border-gray-100/20 rounded-3xl overflow-y-auto h-full">
                    <Main />
                </div>
            </div>

            {/* Player - fixed at bottom */}
            <div className="h-[88px] w-full fixed bottom-0 z-10 bg-black">
                <Player />
            </div>
        </div>
    )
}


export default DashboardPage;