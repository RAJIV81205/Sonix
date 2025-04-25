

const Chat = () => {
  return (
    <div className="col-span-6 bg-white rounded-lg p-4 shadow-lg">
                    <h1 className="text-3xl text-[#8B4513] text-center mb-4">Chat with Harry Potter</h1>
                    <p className="text-center text-gray-600 italic mb-6">"I solemnly swear that I am up to no good."</p>

                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-red-700 to-yellow-600 text-white p-4 rounded-lg mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <span className="text-red-700">HP</span>
                            </div>
                            <div>
                                <div className="font-bold">Harry Potter</div>
                                <div className="text-sm">Gryffindor • Boy Who Lived</div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="space-y-4 mb-4">
                        <div className="bg-red-100 text-red-800 p-4 rounded-lg max-w-[80%]">
                            Hello there! I'm Harry Potter. What brings you to our magical conversation today?
                        </div>
                        <div className="bg-gray-100 text-gray-800 p-4 rounded-lg max-w-[80%] ml-auto">
                            Hi Harry! I'm a big fan. What was it like when you first learned you were a wizard?
                        </div>
                        <div className="bg-red-100 text-red-800 p-4 rounded-lg max-w-[80%]">
                            Well, it was quite a shock! I'd spent years with the Dursleys being told I was nothing special. Then Hagrid burst in on my 11th birthday and told me I was a wizard! Honestly, it was the best moment of my life up until then.
                        </div>
                    </div>

                    {/* Chat Input */}
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Type your message here..."
                            className="w-full p-4 pr-12 rounded-full border border-gray-300 focus:outline-none focus:border-red-500"
                        />
                        <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500">
                            <span className="text-2xl">➜</span>
                        </button>
                    </div>
                    <p className="text-center text-gray-500 text-sm mt-2">
                        Ask Harry about Hogwarts, magic spells, or his adventures!
                    </p>
                </div>
  )
}



export default Chat