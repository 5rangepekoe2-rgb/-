-- 1. 게시판 (posts) 테이블 생성
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  author TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General' NOT NULL,
  likes INT DEFAULT 0 NOT NULL,
  tags TEXT[] DEFAULT '{}'::TEXT[]
);

-- 2. 댓글 (comments) 테이블 생성
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL
);

-- 3. RLS (Row Level Security) 설정 및 공개 읽기/쓰기 권한 허용
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Posts Select') THEN
    CREATE POLICY "Public Posts Select" ON public.posts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Posts Insert') THEN
    CREATE POLICY "Public Posts Insert" ON public.posts FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Posts Update') THEN
    CREATE POLICY "Public Posts Update" ON public.posts FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Comments Select') THEN
    CREATE POLICY "Public Comments Select" ON public.comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Comments Insert') THEN
    CREATE POLICY "Public Comments Insert" ON public.comments FOR INSERT WITH CHECK (true);
  END IF;
END $$;
