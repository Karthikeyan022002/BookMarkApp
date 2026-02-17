"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push("/dashboard")
      }
    }

    checkSession()
  }, [router])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-10 text-center space-y-8">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Bookmark Manager
        </h1>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-3 rounded-xl font-semibold hover:shadow-lg transition duration-200"
        >
          Continue with Google
        </button>
      </div>
    </div>
  )
}
