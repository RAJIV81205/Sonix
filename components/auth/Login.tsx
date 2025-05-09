"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader, Mail, Lock, AlertCircle } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/firebase'

const Login = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true)
    e.preventDefault()
    setError([])

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        // If error is an array, map it to messages
        if (Array.isArray(data.error)) {
          const errorMessages = data.error.map((err: any) => `${err.path} - ${err.message}`)
          setError(errorMessages)
          toast.error("Login failed. Please check your credentials.")
        } else {
          // Otherwise, fallback to a single error message
          setError([data.error || "Something went wrong"])
          toast.error(data.error || "Something went wrong")
        }
        return
      }

      // Store the token in localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Show success toast
      toast.success("Login successful!")

      // Redirect to home page on successful login
      setTimeout(() => {
        router.push("/dashboard")
      }, 500)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred"
      setError([errorMsg])
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      // Send user data to our backend
      const response = await fetch("/api/auth/googleLogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to login with Google")
      }

      // Store the token and user data
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      
      toast.success("Google login successful!")
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 500)
    } catch (error) {
      console.error("Google login error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to login with Google")
    } finally {
      setGoogleLoading(false)
    }
  }

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

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300" htmlFor="email">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                autoComplete='off'
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300" htmlFor="password">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                autoComplete='off'
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-300 flex items-center justify-center"
          >
            {loading ? (
              <>Processing <Loader className="ml-2 animate-spin" size={16} /></>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition duration-300 border border-gray-700 flex items-center justify-center gap-2"
          >
            {googleLoading ? (
              <Loader className="animate-spin" size={16} />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400 text-sm">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-purple-400 hover:text-purple-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login