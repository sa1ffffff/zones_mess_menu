
CREATE TABLE public.queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  feedback TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Anyone can read and insert queries (no auth required)
GRANT SELECT, INSERT ON public.queries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.queries TO authenticated;
GRANT ALL ON public.queries TO service_role;

ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view queries" ON public.queries FOR SELECT USING (true);
CREATE POLICY "Anyone can submit queries" ON public.queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can manage queries" ON public.queries FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX queries_created_at_idx ON public.queries(created_at DESC);
