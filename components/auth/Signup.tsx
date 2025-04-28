import Link from "next/link"

const Signup = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
    <div className="max-w-md w-full bg-[#1a1a1a] rounded-2xl p-8 shadow-2xl">
      <h2 className="text-3xl font-bold text-white text-center mb-6">Create your account</h2>
      
      <form className="space-y-5">
        <div>
          <label className="block text-sm text-gray-300 mb-2" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            className="w-full p-3 rounded-lg bg-black text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Create a password"
            className="w-full p-3 rounded-lg bg-black text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2" htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Choose a username"
            className="w-full p-3 rounded-lg bg-black text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition duration-300"
        >
          Sign Up
        </button>
      </form>

      <p className="mt-6 text-center text-gray-400 text-sm">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-purple-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  </div>
  )
}

export default Signup