
CREATE TABLE public.dinners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  time_start TEXT NOT NULL DEFAULT '7:30 PM',
  time_end TEXT NOT NULL DEFAULT '9:00 PM',
  menu_items TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dinners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dinners TO authenticated;
GRANT ALL ON public.dinners TO service_role;
ALTER TABLE public.dinners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view dinners" ON public.dinners FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage dinners" ON public.dinners FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  stars SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (date, user_id)
);
GRANT SELECT ON public.ratings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ratings TO authenticated;
GRANT ALL ON public.ratings TO service_role;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Users insert own rating" ON public.ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own rating" ON public.ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own rating" ON public.ratings FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX ratings_date_idx ON public.ratings(date);
CREATE INDEX dinners_date_idx ON public.dinners(date);
