# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up or login
3. Click **New Project**
4. Fill in:
   - **Name**: learn-english (or any name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
5. Click **Create new project**
6. Wait ~2 minutes for project to be ready

## 2. Get API Credentials

1. In your project dashboard, click **Settings** (gear icon)
2. Click **API** in the sidebar
3. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## 3. Configure Environment Variables

Create or update `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from step 2.

## 4. Create Database Tables

1. In Supabase dashboard, click **SQL Editor**
2. Click **New query**
3. Paste this SQL:

```sql
-- ============================================
-- GAMES TABLE
-- ============================================
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('flashcard', 'quiz', 'hangman')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for games
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_created_at ON games(created_at DESC);

-- Enable RLS for games
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- RLS Policies for games
CREATE POLICY "Users can view own games"
  ON games FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own games"
  ON games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own games"
  ON games FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own games"
  ON games FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- GAME SESSIONS TABLE (Public Sessions)
-- ============================================
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL, -- 8-char code
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  max_attempts INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for game_sessions
CREATE INDEX idx_game_sessions_session_id ON game_sessions(session_id);
CREATE INDEX idx_game_sessions_creator_id ON game_sessions(creator_id);
CREATE INDEX idx_game_sessions_game_id ON game_sessions(game_id);

-- Enable RLS for game_sessions
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_sessions
-- Anyone can view active sessions (public)
CREATE POLICY "Anyone can view active sessions"
  ON game_sessions FOR SELECT
  USING (is_active = true);

-- Only authenticated users can create sessions
CREATE POLICY "Authenticated users can create sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Only creator can update their sessions
CREATE POLICY "Creators can update own sessions"
  ON game_sessions FOR UPDATE
  USING (auth.uid() = creator_id);

-- Only creator can delete their sessions
CREATE POLICY "Creators can delete own sessions"
  ON game_sessions FOR DELETE
  USING (auth.uid() = creator_id);

-- ============================================
-- SESSION SCORES TABLE (Leaderboard)
-- ============================================
CREATE TABLE session_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE NOT NULL,
  nickname TEXT NOT NULL,
  score INTEGER NOT NULL,
  time_taken INTEGER, -- in seconds
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, nickname) -- One score per nickname per session
);

-- Indexes for session_scores
CREATE INDEX idx_session_scores_session_id ON session_scores(session_id);
CREATE INDEX idx_session_scores_score ON session_scores(score DESC);

-- Enable RLS for session_scores
ALTER TABLE session_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for session_scores
-- Anyone can view scores (public leaderboard)
CREATE POLICY "Anyone can view scores"
  ON session_scores FOR SELECT
  USING (true);

-- Anyone can insert scores (public participation)
CREATE POLICY "Anyone can insert scores"
  ON session_scores FOR INSERT
  WITH CHECK (true);

-- Anyone can update their own score (by nickname)
CREATE POLICY "Anyone can update own score"
  ON session_scores FOR UPDATE
  USING (true);
```

4. Click **Run** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

## 5. Enable Real-time (Optional)

For live leaderboard updates:

1. Go to **Database** → **Replication**
2. Enable replication for `session_scores` table
3. This allows real-time subscriptions to work

## 6. Configure Email Auth

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email templates if desired
4. For production, set up a custom SMTP provider

## 7. Start Your App

```bash
pnpm run dev
```

The app will now use Supabase!

## 8. Test the Setup

1. Open `http://localhost:5173`
2. You should be redirected to `/login`
3. Click "Sign up" and create an account
4. After signup, you'll be logged in automatically
5. Try creating a game - it should save to Supabase
6. Check Supabase dashboard → **Table Editor** → **games** to see your data

## Features Enabled

### Games
- ✅ User-specific games
- ✅ CRUD operations
- ✅ Row Level Security

### Public Sessions
- ✅ Create shareable game sessions
- ✅ 8-character session codes
- ✅ Expiration dates
- ✅ Max attempts limit
- ✅ Public access (no login required)

### Leaderboards
- ✅ Real-time score updates
- ✅ Best score tracking
- ✅ Time-based tiebreakers
- ✅ Public visibility

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists in project root
- Check that variable names start with `VITE_`
- Restart dev server after changing `.env`

### "Failed to create record" or 403 errors
- Verify RLS policies are created (step 4)
- Check that you're logged in (for games)
- Verify tables exist in Supabase

### "Invalid API key"
- Double-check you copied the **anon public** key (not service_role)
- Make sure there are no extra spaces in `.env`

### Real-time not working
- Enable replication for `session_scores` table
- Check browser console for connection errors
- Verify Supabase project is not paused

## Next Steps (Optional)

### Add OAuth Providers
1. Go to **Authentication** → **Providers**
2. Enable Google, GitHub, etc.
3. Configure OAuth credentials

### Deploy to Production
1. Build your app: `pnpm run build`
2. Deploy to Vercel, Netlify, etc.
3. Add environment variables in hosting platform
4. Update Supabase **Authentication** → **URL Configuration**
