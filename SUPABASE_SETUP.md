# Supabase Setup Yo'riqnomasi

## 1. Supabase Account Yaratish

1. [https://supabase.com](https://supabase.com) ga boring
2. "Start your project" tugmasini bosing
3. GitHub yoki email orqali ro'yxatdan o'ting

## 2. Yangi Project Yaratish

1. Dashboard da "New Project" tugmasini bosing
2. Project nomi kiriting (masalan: `media-favorites`)
3. Database parolini kiriting va eslang
4. Region tanlang (eng yaqinini, masalan Frankfurt)
5. "Create new project" tugmasini bosing (1-2 daqiqa kutish kerak)

## 3. API Keys Olish

1. Project ochilgandan keyin chapda "Settings" > "API" ga boring
2. Quyidagilarni ko'chirib oling:
   - **Project URL** (masalan: `https://xxxxx.supabase.co`)
   - **anon public** key (uzun token)

3. `.env.local` fayliga qo'shing:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## 4. Database Table Yaratish

1. Chapda "SQL Editor" ga boring
2. "New query" tugmasini bosing
3. Quyidagi SQL ni ko'chirib paste qiling va "Run" bosing:

```sql
-- Create favorites table
CREATE TABLE favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  film_id TEXT NOT NULL,
  media_type TEXT NOT NULL,
  title TEXT,
  poster TEXT,
  rating DECIMAL,
  imdb_rating DECIMAL,
  year INTEGER,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, film_id, media_type)
);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create policy: users can only see their own favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

## 5. Email Authentication Sozlash (MUHIM!)

**Bu qadamni o'tkazmasang "Email signups are disabled" xatoligi chiqadi!**

1. Supabase Dashboard da chapdan **Authentication** > **Providers** ga boring
2. **Email** ni toping va ustiga bosing
3. Quyidagilarni sozlang:
   - **"Enable Email provider"** - ✅ **ON** (yoqilgan bo'lishi kerak)
   - **"Confirm email"** - ❌ **OFF** (o'chiring, email tasdiqlash shart emas)
   - **"Enable Email Signup"** - ✅ **ON** (yoqilgan bo'lishi kerak)
4. **Save** tugmasini bosing

## 6. Email Settings (Ixtiyoriy)

Agar production da ishlatsangiz:

1. "Settings" > "Authentication" > "Email Auth" ga boring
2. Email template larini o'zgartiring (ixtiyoriy)
3. SMTP settings ni sozlang (yoki Supabase default ni ishlating)

## 7. Test Qilish

1. Development server ni qayta ishga tushiring:
```bash
npm run dev
```

2. `/register` ga boring va yangi account yarating
3. Email tasdiqlash KERAK EMAS (darhol login qilish mumkin)
4. `/login` ga boring va kirish
5. Film ga favorite tugmasini bosib test qiling

## 8. Production Deploy (Vercel)

1. Vercel da loyihangizni deploy qiling
2. Vercel Settings > Environment Variables ga:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   ni qo'shing

3. Supabase da "Settings" > "Authentication" > "URL Configuration" ga:
   - Site URL: `https://your-domain.vercel.app` ni qo'shing

## Troubleshooting

**Problem: Email kelmayapti**
- Spam papkani tekshiring
- Supabase Settings > Auth > Email Templates ni tekshiring

**Problem: Favorites ishlamayapti**
- Browser console da error larni tekshiring
- Supabase SQL Editor da `SELECT * FROM favorites;` ni run qiling
- Row Level Security policies borligini tekshiring

**Problem: Login qilgandan keyin error**
- `.env.local` dagi keys to'g'riligini tekshiring
- Server ni restart qiling: `Ctrl+C` va `npm run dev`
