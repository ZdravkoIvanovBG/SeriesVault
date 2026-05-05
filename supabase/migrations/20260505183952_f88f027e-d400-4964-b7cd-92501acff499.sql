CREATE TABLE public.user_currently_watching (
  user_id UUID NOT NULL,
  series_id TEXT NOT NULL,
  season INTEGER NOT NULL DEFAULT 1,
  episode INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, series_id)
);

ALTER TABLE public.user_currently_watching ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own cw select" ON public.user_currently_watching FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own cw insert" ON public.user_currently_watching FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own cw update" ON public.user_currently_watching FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own cw delete" ON public.user_currently_watching FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_cw_updated_at
BEFORE UPDATE ON public.user_currently_watching
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();