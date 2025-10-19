"use client"

import React from 'react'
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

const Forgot = () => {
    const [error, setError] = useState<string[]>([])



    
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-gray-400">Sign in to continue to your account</p>
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

            </div>
        </div>
    )
}

export default Forgot