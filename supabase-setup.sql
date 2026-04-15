-- ============================================================
-- Super-Novae Courses — Supabase Database Setup
-- Run this in Supabase Studio > SQL Editor
-- ============================================================

-- 1. PROFILES table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  first_name  text NOT NULL,
  last_name   text NOT NULL,
  role        text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  timestamptz DEFAULT now()
);

-- 2. COURSES table
CREATE TABLE IF NOT EXISTS public.courses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  subtitle     text,
  type         text NOT NULL CHECK (type IN ('Environnement', 'Security', 'Gender')),
  source_type  text NOT NULL CHECK (source_type IN ('link', 'zip')),
  url          text NOT NULL,
  github_path  text,
  created_at   timestamptz DEFAULT now(),
  created_by   uuid REFERENCES public.profiles(id),
  is_active    boolean DEFAULT true
);

-- 3. USER_COURSES table
CREATE TABLE IF NOT EXISTS public.user_courses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id    uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  started_at   timestamptz DEFAULT now(),
  finished_at  timestamptz,
  UNIQUE(user_id, course_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Allow insert on registration"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- COURSES policies
CREATE POLICY "Any authenticated user can view active courses"
  ON public.courses FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can view all courses"
  ON public.courses FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Admins can insert courses"
  ON public.courses FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Admins can update courses"
  ON public.courses FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Admins can delete courses"
  ON public.courses FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- USER_COURSES policies
CREATE POLICY "Users can view own progress"
  ON public.user_courses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_courses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON public.user_courses FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- To make a user admin: run this in SQL Editor after they register
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
-- ============================================================
