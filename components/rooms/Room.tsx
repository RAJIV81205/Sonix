"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Hash, Copy, Music, Headphones, Zap } from 'lucide-react'

type Room = {
  code: string
  name: string
}


const Room = () => {
  const [activeTab, setActiveTab] = useState('create')
  const [roomCode, setRoomCode] = useState('')
  const [roomName, setRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null)

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return
    
    setIsCreating(true)
    
    // Simulate API call
    setTimeout(() => {
      const newCode = generateRoomCode()
      setCreatedRoom({ code: newCode, name: roomName })
      setRoomCode(newCode)
      setIsCreating(false)
    }, 1500)
  }

  const handleJoinRoom = () => {
    if (!joinCode.trim()) return
    console.log('Joining room:', joinCode)
    // Here you would implement room joining logic
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomCode)
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const tabVariants = {
    inactive: { scale: 0.95, opacity: 0.7 },
    active: { scale: 1, opacity: 1 }
  }

  if (createdRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center"
            >
              <Music className="w-8 h-8 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Room Created!</h2>
            <p className="text-gray-300 mb-6">Share this code with your friends</p>
            
            <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-mono font-bold text-purple-400">{createdRoom.code}</span>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setCreatedRoom(null)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              Create Another Room
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="flex flex-col items-center justify-center min-h-screen p-4 py-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-4xl"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 20px rgba(168, 85, 247, 0.5)', '0 0 40px rgba(168, 85, 247, 0.8)', '0 0 20px rgba(168, 85, 247, 0.5)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mr-4"
              >
                <Headphones className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Listen Together
              </h1>
            </div>
            <p className="text-gray-300 text-lg md:text-xl">
              Create or join a room to enjoy music with your friends in real-time
            </p>
          </motion.div>

          {/* Tab Selector */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-2 flex">
              <motion.button
                variants={tabVariants}
                animate={activeTab === 'create' ? 'active' : 'inactive'}
                onClick={() => setActiveTab('create')}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'create'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Room
              </motion.button>
              <motion.button
                variants={tabVariants}
                animate={activeTab === 'join' ? 'active' : 'inactive'}
                onClick={() => setActiveTab('join')}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'join'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Hash className="w-5 h-5 mr-2" />
                Join Room
              </motion.button>
            </div>
          </motion.div>

          {/* Content Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Create Room Section */}
            <motion.div
              variants={itemVariants}
              className={`transition-all duration-500 ${
                activeTab === 'create' ? 'opacity-100 scale-100' : 'opacity-50 scale-95 md:opacity-100 md:scale-100'
              }`}
            >
              <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 h-full">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mr-4">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Create a Room</h2>
                </div>
                
                <p className="text-gray-300 mb-6">
                  Start a new listening session and invite your friends to join you
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Room Name
                    </label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Enter room name..."
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateRoom}
                    disabled={!roomName.trim() || isCreating}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {isCreating ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="w-5 h-5 mr-2" />
                      </motion.div>
                    ) : (
                      <Users className="w-5 h-5 mr-2" />
                    )}
                    {isCreating ? 'Creating Room...' : 'Create Room'}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Join Room Section */}
            <motion.div
              variants={itemVariants}
              className={`transition-all duration-500 ${
                activeTab === 'join' ? 'opacity-100 scale-100' : 'opacity-50 scale-95 md:opacity-100 md:scale-100'
              }`}
            >
              <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 h-full">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mr-4">
                    <Hash className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Join a Room</h2>
                </div>
                
                <p className="text-gray-300 mb-6">
                  Enter a room code to join an existing listening session
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Room Code
                    </label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="Enter 6-digit code..."
                      maxLength={6}
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-center text-lg tracking-widest"
                    />
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleJoinRoom}
                    disabled={joinCode.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Join Room
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Features */}
          <motion.div variants={itemVariants} className="mt-16 text-center">
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Synchronized Playback</h3>
                <p className="text-gray-400 text-sm">Everyone hears the same thing at the same time</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Real-time Chat</h3>
                <p className="text-gray-400 text-sm">Share reactions and discuss music together</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Instant Access</h3>
                <p className="text-gray-400 text-sm">No downloads required, works in any browser</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Room