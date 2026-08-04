-- Create the hall_of_shame table so entries are shared across all users
CREATE TABLE public.hall_of_shame (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  reason TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allow anyone to read entries
GRANT SELECT ON public.hall_of_shame TO anon;
-- Allow authenticated users to insert/delete (admin-only enforced in app code)
GRANT SELECT, INSERT, DELETE ON public.hall_of_shame TO authenticated;
GRANT ALL ON public.hall_of_shame TO service_role;

-- Enable Row Level Security
ALTER TABLE public.hall_of_shame ENABLE ROW LEVEL SECURITY;

-- Anyone can view entries
CREATE POLICY "Anyone can view hall of shame" ON public.hall_of_shame
  FOR SELECT USING (true);

-- Only authenticated users can insert (admin check is done in the UI)
CREATE POLICY "Authenticated can insert hall of shame" ON public.hall_of_shame
  FOR INSERT TO authenticated WITH CHECK (true);

-- Only authenticated users can delete
CREATE POLICY "Authenticated can delete hall of shame" ON public.hall_of_shame
  FOR DELETE TO authenticated USING (true);
