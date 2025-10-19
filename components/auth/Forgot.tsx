"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Mail, Loader, ArrowLeft, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'

const Forgot = () => {
    const [step, setStep] = useState<1 | 2>(1)
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [error, setError] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError([])

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (Array.isArray(data.error)) {
                    const errorMessages = data.error.map((err: any) => `${err.path} - ${err.message}`)
                    setError(errorMessages)
                } else {
                    setError([data.error || "Something went wrong"])
                }
                toast.error(data.error || "Failed to send OTP")
                return
            }

            toast.success("OTP sent to your email!")
            setStep(2)
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "An error occurred"
            setError([errorMsg])
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError([])

        try {
            const response = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otp }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (Array.isArray(data.error)) {
                    const errorMessages = data.error.map((err: any) => `${err.path} - ${err.message}`)
                    setError(errorMessages)
                } else {
                    setError([data.error || "Something went wrong"])
                }
                toast.error(data.error || "Invalid OTP")
                return
            }

            toast.success("OTP verified successfully!")
            // Redirect to reset password page or handle accordingly
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "An error occurred"
            setError([errorMsg])
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {step === 1 ? "Forgot Password" : "Verify OTP"}
                    </h2>
                    <p className="text-gray-400">
                        {step === 1
                            ? "Enter your email to receive a verification code"
                            : "Enter the OTP sent to your email"}
                    </p>
                </div>

                {error.length > 0 && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500 text-red-400 rounded-lg text-sm flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                            {error.map((err, idx) => (
                                <div key={idx}>{err}</div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 1 ? (
                    <form className="space-y-5" onSubmit={handleEmailSubmit}>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300" htmlFor="email">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    autoComplete='off'
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-300 flex items-center justify-center"
                        >
                            {loading ? (
                                <>Sending <Loader className="ml-2 animate-spin" size={16} /></>
                            ) : (
                                "Send OTP"
                            )}
                        </button>
                    </form>
                ) : (
                    <form className="space-y-5" onSubmit={handleOtpSubmit}>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300" htmlFor="otp">
                                Verification Code
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    autoComplete='off'
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    required
                                    maxLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-300 flex items-center justify-center"
                        >
                            {loading ? (
                                <>Verifying <Loader className="ml-2 animate-spin" size={16} /></>
                            ) : (
                                "Verify OTP"
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setStep(1)
                                setOtp("")
                                setError([])
                            }}
                            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition duration-300 border border-gray-700 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Back to Email
                        </button>
                    </form>
                )}

                <p className="mt-8 text-center text-gray-400 text-sm">
                    Remember your password?{" "}
                    <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Forgot