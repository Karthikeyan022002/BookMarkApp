SMART BOOKMARK APP

Live URL:
https://book-mark-app-indol.vercel.app

GitHub Repository:
https://github.com/Karthikeyan022002/BookMarkApp

PROJECT OVERVIEW

This is a Smart Bookmark Manager built using Next.js (App Router) and Supabase.

Users can:

Sign up and log in using Google OAuth only

Add bookmarks (URL and title)

View only their own bookmarks

See real-time updates across browser tabs

Delete their own bookmarks

Access the live deployed version on Vercel

All bookmarks are private per user and secured using Supabase Row Level Security (RLS).

TECH STACK

Frontend:
Next.js (App Router)
Tailwind CSS

Backend:
Supabase (Authentication, PostgreSQL, Realtime)

Deployment:
Vercel

LOCAL SETUP INSTRUCTIONS

Clone the repository:

git clone https://github.com/Karthikeyan022002/BookMarkApp.git

cd BookMarkApp

Install dependencies:

npm install

Create environment variables:

Create a file named .env.local in the root folder and add:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

Run the application:

npm run dev

Open:
http://localhost:3000

SECURITY IMPLEMENTATION

Google OAuth authentication using Supabase

Dashboard route is protected

Row Level Security (RLS) enabled on bookmarks table

Policies implemented:

Users can read their own bookmarks

Users can insert their own bookmarks

Users can delete their own bookmarks

Delete policy condition:
auth.uid() = user_id

Frontend delete also verifies:
.eq("id", id).eq("user_id", userId)

REAL-TIME IMPLEMENTATION

Used Supabase Realtime with postgres_changes subscription.
Bookmarks are filtered by user_id.
When a bookmark is added or deleted in one tab, it updates automatically in other tabs.

PROBLEMS FACED AND SOLUTIONS

OAuth Redirect Issue

Problem:
After login, users were redirected to the wrong domain (localhost instead of production).

Solution:
Used dynamic redirect:
redirectTo: window.location.origin + "/dashboard"

Configured correct Site URL and Redirect URLs inside Supabase Authentication settings.

Delete Not Working

Problem:
Delete button was not removing bookmarks.

Cause:
Row Level Security DELETE policy was missing.

Solution:
Created DELETE policy with condition:
auth.uid() = user_id

Also added additional filter on frontend:
.eq("user_id", userId)

Route Protection

Problem:
Users could manually access /dashboard without login.

Solution:
Used supabase.auth.getUser() inside useEffect and redirected unauthenticated users to "/".

Real-Time Not Updating

Problem:
Bookmarks did not refresh across tabs.

Solution:
Used Supabase postgres_changes subscription filtered by user_id.

FINAL STATUS

Google OAuth authentication working
Bookmarks private per user
Real-time updates working
Delete functionality working with security checks
Successfully deployed on Vercel
Public GitHub repository available

HOW TO CREATE THIS FILE

In your project root folder, create a file named:
README.txt

Paste the above content inside.

Run:

git add README.txt
git commit -m "Added final README"
git push

If you want, I can now:

Make it more concise

Make it more technical

Make it more recruiter-friendly

Prepare submission email text

You are officially submission ready.
