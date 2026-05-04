
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Watched
CREATE TABLE public.user_watched (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  series_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, series_id)
);
ALTER TABLE public.user_watched ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own watched select" ON public.user_watched FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own watched insert" ON public.user_watched FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own watched delete" ON public.user_watched FOR DELETE USING (auth.uid() = user_id);

-- Watchlist
CREATE TABLE public.user_watchlist (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  series_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, series_id)
);
ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wl select" ON public.user_watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own wl insert" ON public.user_watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own wl delete" ON public.user_watchlist FOR DELETE USING (auth.uid() = user_id);

-- Ratings
CREATE TABLE public.user_ratings (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  series_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 10),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, series_id)
);
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ratings select" ON public.user_ratings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own ratings insert" ON public.user_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own ratings update" ON public.user_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own ratings delete" ON public.user_ratings FOR DELETE USING (auth.uid() = user_id);

-- Tier list
CREATE TABLE public.user_tierlist (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  series_id TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('S','A','B','C','D','F')),
  position INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, series_id)
);
ALTER TABLE public.user_tierlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tier select" ON public.user_tierlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own tier insert" ON public.user_tierlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own tier update" ON public.user_tierlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own tier delete" ON public.user_tierlist FOR DELETE USING (auth.uid() = user_id);

-- Avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatars publicly readable"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
