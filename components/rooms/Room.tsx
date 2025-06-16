"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Hash, Copy, Music, Headphones, Zap, CheckCircle } from 'lucide-react'
import Link from 'next/link'

type Room = {
  code: string
  name: string
}

type User = {
  id: string
  name?: string
  email?: string
}

const Room: React.FC = () => {
  const [roomCode, setRoomCode] = useState<string>('')
  const [roomName, setRoomName] = useState<string>('')
  const [joinCode, setJoinCode] = useState<string>('')
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [isJoining, setIsJoining] = useState<boolean>(false)
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null)
  const [copySuccess, setCopySuccess] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const generateRoomCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const getUserFromStorage = (): User | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
      }
      return null
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
      return null
    }
  }

  const handleCreateRoom = async (): Promise<void> => {
    if (!roomName.trim()) {
      setError('Please enter a room name')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      const newCode = generateRoomCode()
      const user = getUserFromStorage()

      if (!user?.id) {
        throw new Error('User not found. Please log in again.')
      }


      const response = await fetch('/api/room/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name: roomName.trim(), 
          code: newCode, 
          host: user.id 
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create room: ${response.statusText}`)
      }

      // Simulate API response time
      setTimeout(() => {
        setCreatedRoom({ code: newCode, name: roomName.trim() })
        setRoomCode(newCode)
        setIsCreating(false)
      }, 1500)

    } catch (error) {
      console.error('Error creating room:', error)
      setError(error instanceof Error ? error.message : 'Failed to create room')
      setIsCreating(false)
    }
  }

  const handleJoinRoom = async (): Promise<void> => {
    if (!joinCode.trim() || joinCode.length !== 6) {
      setError('Please enter a valid 6-digit room code')
      return
    }

    setIsJoining(true)
    setError('')

    try {
      // Add your room joining API logic here
      console.log('Joining room:', joinCode)
      
      // Simulate API call
      setTimeout(() => {
        // Redirect to room or handle join logic
        window.location.href = `/dashboard/room/${joinCode}`
      }, 1000)

    } catch (error) {
      console.error('Error joining room:', error)
      setError('Failed to join room. Please check the code and try again.')
      setIsJoining(false)
    }
  }

  const copyToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = roomCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
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

  // Success screen after room creation
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

            <div className="bg-gray-900/50 rounded-lg p-4 mb-6 relative">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-mono font-bold text-purple-400">{createdRoom.code}</span>
                <button
                  onClick={copyToClipboard}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    copySuccess 
                      ? 'bg-green-600 text-white' 
                      : 'hover:bg-gray-700 text-gray-400'
                  }`}
                  title={copySuccess ? 'Copied!' : 'Copy to clipboard'}
                >
                  {copySuccess ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              {copySuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-green-400 text-sm"
                >
                  Copied to clipboard!
                </motion.div>
              )}
            </div>

            <Link href={`/dashboard/room/${createdRoom.code}`} className="block w-full">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                Start Listening
              </motion.button>
            </Link>
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
                  boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.5)', 
                    '0 0 40px rgba(168, 85, 247, 0.8)', 
                    '0 0 20px rgba(168, 85, 247, 0.5)'
                  ]
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

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 max-w-md mx-auto"
            >
              <p className="text-red-400 text-center">{error}</p>
            </motion.div>
          )}

          {/* Content Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Create Room Section */}
            <motion.div variants={itemVariants}>
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
                      maxLength={50}
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
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <Zap className="w-5 h-5" />
                        </motion.div>
                        Creating Room...
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 mr-2" />
                        Create Room
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Join Room Section */}
            <motion.div variants={itemVariants}>
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
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="Enter 6-digit code..."
                      maxLength={6}
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-center text-lg tracking-widest"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleJoinRoom}
                    disabled={joinCode.length !== 6 || isJoining}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {isJoining ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <Zap className="w-5 h-5" />
                        </motion.div>
                        Joining...
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 mr-2" />
                        Join Room
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Room