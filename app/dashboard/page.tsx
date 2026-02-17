"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

type Bookmark = {
  id: string
  title: string
  url: string
  user_id: string
  created_at: string
}

export default function Dashboard() {
  const router = useRouter()

  const [email, setEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // 🔐 Protect route
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push("/")
        return
      }

      setEmail(data.user.email ?? "")
      setUserId(data.user.id)
      fetchBookmarks(data.user.id)
    }

    checkUser()
  }, [router])

  // 🔄 Realtime subscription
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        () => fetchBookmarks(userId)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // 📥 Fetch bookmarks
  const fetchBookmarks = async (uid: string) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setBookmarks(data)
    }
  }

  // 🔧 Format URL
  const formatUrl = (input: string) => {
    if (!input.startsWith("http://") && !input.startsWith("https://")) {
      return `https://${input}`
    }
    return input
  }

  // ➕ Add bookmark
  const addBookmark = async () => {
    if (!title.trim() || !url.trim() || !userId) {
      setError("Title and URL are required")
      return
    }

    setLoading(true)
    setError("")

    const formattedUrl = formatUrl(url)

    const { error } = await supabase.from("bookmarks").insert({
      title: title.trim(),
      url: formattedUrl,
      user_id: userId,
    })

    if (error) {
      setError(error.message)
    } else {
      setTitle("")
      setUrl("")
    }

    setLoading(false)
  }

  // ❌ Delete bookmark (FINAL SAFE VERSION)
  const deleteBookmark = async (id: string) => {
    if (!userId) return

    const { data, error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select() // IMPORTANT for RLS

    if (error) {
      console.error("Delete failed:", error.message)
      setError("Failed to delete bookmark")
      return
    }

    // Immediately update UI (no waiting for realtime)
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }

  // 🚪 Logout
  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">
            Bookmark Manager
          </h1>
          <p className="text-sm text-slate-300">
            Logged in as <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        {/* Add Form */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Bookmark title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            onClick={addBookmark}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold text-white shadow-lg disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Bookmark"}
          </button>
        </div>

        {/* Bookmark List */}
        <div className="space-y-4">
          {bookmarks.length === 0 && (
            <p className="text-center text-slate-400 text-sm">
              No bookmarks yet. Add your first one.
            </p>
          )}

          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex justify-between items-start gap-4 bg-white/10 p-4 rounded-xl border border-white/10 hover:bg-white/20 transition"
            >
              <div className="flex flex-col max-w-[80%]">
                <span className="text-white font-medium break-words">
                  {bookmark.title}
                </span>

                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-sm hover:underline break-all"
                >
                  {bookmark.url}
                </a>
              </div>

              <button
                onClick={() => deleteBookmark(bookmark.id)}
                className="text-red-400 hover:text-red-500 text-sm font-medium shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 transition font-semibold text-white shadow-lg"
        >
          Logout
        </button>

      </div>
    </div>
  )
}
