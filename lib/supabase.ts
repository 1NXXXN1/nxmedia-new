/**
 * Supabase Client Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://supabase.com and create a free account
 * 2. Create a new project
 * 3. Go to Project Settings > API
 * 4. Copy your Project URL and anon/public API key
 * 5. Add to .env.local:
 *    NEXT_PUBLIC_SUPABASE_URL=your_project_url
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
 * 
 * DATABASE SETUP:
 * Go to SQL Editor in Supabase and run this:
 * 
 * -- Create favorites table
 * CREATE TABLE favorites (
 *   id BIGSERIAL PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   film_id TEXT NOT NULL,
 *   media_type TEXT NOT NULL,
 *   title TEXT,
 *   poster TEXT,
 *   rating DECIMAL,
 *   imdb_rating DECIMAL,
 *   year INTEGER,
 *   type TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   UNIQUE(user_id, film_id, media_type)
 * );
 * 
 * -- Enable Row Level Security
 * ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
 * 
 * -- Create policy: users can only see their own favorites
 * CREATE POLICY "Users can view own favorites"
 *   ON favorites FOR SELECT
 *   USING (auth.uid() = user_id);
 * 
 * -- Create policy: users can insert their own favorites
 * CREATE POLICY "Users can insert own favorites"
 *   ON favorites FOR INSERT
 *   WITH CHECK (auth.uid() = user_id);
 * 
 * -- Create policy: users can delete their own favorites
 * CREATE POLICY "Users can delete own favorites"
 *   ON favorites FOR DELETE
 *   USING (auth.uid() = user_id);
 */

import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error('SUPABASE ENV ERROR:', { supabaseUrl, supabaseAnonKey });
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// if (!supabase) {
//   // eslint-disable-next-line no-console
//   console.error('Supabase client is NULL!');
// } else {
//   // eslint-disable-next-line no-console
//   console.log('Supabase client created:', { supabaseUrl });
// }

export interface Favorite {
  id?: number;
  user_id?: string;
  film_id: string;
  media_type: 'movie' | 'tv';
  title: string;
  poster?: string;
  rating?: number;
  imdb_rating?: number;
  year?: number;
  type?: string;
  created_at?: string;
}

// @ts-ignore
if (typeof window !== 'undefined') window.supabase = supabase;