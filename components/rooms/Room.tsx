"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Hash, Copy, Music, Headphones, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
      console.log('Joining room:', joinCode)
      window.location.href = `/dashboard/room/${joinCode}`
      setJoinCode('')
      setIsJoining(false)
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

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  // Success screen after room creation
  if (createdRoom) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-slate-800 shadow-xl rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 dark:border-slate-700"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Room Created Successfully
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Share this code with your friends to start listening together
            </p>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 mb-8 relative">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Room Code</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-mono font-bold text-slate-900 dark:text-white tracking-wider">
                  {createdRoom.code}
                </span>
                <button
                  onClick={copyToClipboard}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    copySuccess 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
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
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-emerald-600 dark:text-emerald-400 text-sm mt-2"
                >
                  Copied to clipboard!
                </motion.p>
              )}
            </div>

            <Link href={`/dashboard/room/${createdRoom.code}`} className="block w-full">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors duration-200 flex items-center justify-center"
              >
                Start Listening
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-25 lg:py-16">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-slate-900 dark:bg-white rounded-2xl mr-4">
                <Headphones className="w-8 h-8 text-white dark:text-slate-900" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white">
                Listen Together
              </h1>
            </div>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Create or join a room to enjoy music with your friends in perfect sync
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-8 max-w-md mx-auto"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Create Room Section */}
            <motion.div variants={fadeInUp}>
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 lg:p-10 shadow-xl border border-slate-200 dark:border-slate-700 h-full">
                <div className="flex items-center mb-8">
                  <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mr-4">
                    <Plus className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                    Create Room
                  </h2>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
                  Start a new listening session and invite friends to join you
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Room Name
                    </label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="e.g., Friday Night Vibes"
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-2xl px-4 py-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      maxLength={50}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateRoom}
                    disabled={!roomName.trim() || isCreating}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white disabled:text-slate-500 py-4 rounded-2xl font-semibold transition-colors duration-200 flex items-center justify-center"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Creating Room...
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 mr-3" />
                        Create Room
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Join Room Section */}
            <motion.div variants={fadeInUp}>
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 lg:p-10 shadow-xl border border-slate-200 dark:border-slate-700 h-full">
                <div className="flex items-center mb-8">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mr-4">
                    <Hash className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                    Join Room
                  </h2>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
                  Enter a room code to join an existing listening session
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Room Code
                    </label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="ABCD12"
                      maxLength={6}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-2xl px-4 py-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-center text-xl tracking-widest"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleJoinRoom}
                    disabled={joinCode.length !== 6 || isJoining}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white disabled:text-slate-500 py-4 rounded-2xl font-semibold transition-colors duration-200 flex items-center justify-center"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Joining Room...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-5 h-5 mr-3" />
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