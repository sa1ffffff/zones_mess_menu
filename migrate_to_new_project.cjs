const https = require('https');

const PROJECT_REF = 'pufhbpkhutucjsiohdud';
const PUBLISHABLE_KEY = 'sb_publishable_Y9YLeRRDrwPM7BtpsTipIA_6mwuuKwC';

// Full SQL for all migrations
const FULL_SQL = `
-- ============================================================
-- Migration 1: dinners & ratings tables
-- ============================================================
CREATE TABLE IF NOT EXISTS public.dinners (
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
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dinners' AND policyname='Anyone can view dinners') THEN
    CREATE POLICY "Anyone can view dinners" ON public.dinners FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dinners' AND policyname='Authenticated can manage dinners') THEN
    CREATE POLICY "Authenticated can manage dinners" ON public.dinners FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.ratings (
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
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ratings' AND policyname='Anyone can view ratings') THEN
    CREATE POLICY "Anyone can view ratings" ON public.ratings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ratings' AND policyname='Users insert own rating') THEN
    CREATE POLICY "Users insert own rating" ON public.ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ratings' AND policyname='Users update own rating') THEN
    CREATE POLICY "Users update own rating" ON public.ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ratings' AND policyname='Users delete own rating') THEN
    CREATE POLICY "Users delete own rating" ON public.ratings FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS ratings_date_idx ON public.ratings(date);
CREATE INDEX IF NOT EXISTS dinners_date_idx ON public.dinners(date);

-- ============================================================
-- Migration 2: queries table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  feedback TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.queries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.queries TO authenticated;
GRANT ALL ON public.queries TO service_role;

ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='queries' AND policyname='Anyone can view queries') THEN
    CREATE POLICY "Anyone can view queries" ON public.queries FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='queries' AND policyname='Anyone can submit queries') THEN
    CREATE POLICY "Anyone can submit queries" ON public.queries FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='queries' AND policyname='Authenticated can manage queries') THEN
    CREATE POLICY "Authenticated can manage queries" ON public.queries FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS queries_created_at_idx ON public.queries(created_at DESC);
`;

function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'apikey': PUBLISHABLE_KEY,
        'Authorization': `Bearer ${PUBLISHABLE_KEY}`,
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Try via Supabase management API (pg meta)
function runSQLViaMeta(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      path: '/pg-meta/v1/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'apikey': PUBLISHABLE_KEY,
        'Authorization': `Bearer ${PUBLISHABLE_KEY}`,
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Testing connection to new Supabase project...');
  
  // First test: can we reach the project?
  const testResult = await new Promise((resolve) => {
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': PUBLISHABLE_KEY,
        'Authorization': `Bearer ${PUBLISHABLE_KEY}`,
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', e => resolve({ status: -1, body: e.message }));
    req.end();
  });

  console.log(`Connection test: HTTP ${testResult.status}`);
  if (testResult.status === -1) {
    console.error('FAILED: Cannot reach Supabase project. Check URL and key.');
    process.exit(1);
  }
  console.log('Connection OK!\n');

  // Try rpc/exec_sql
  console.log('Attempting to apply migrations via RPC...');
  const rpcResult = await runSQL(FULL_SQL);
  console.log(`RPC result: HTTP ${rpcResult.status}`);
  if (rpcResult.status === 200 || rpcResult.status === 204) {
    console.log('\n✅ SUCCESS! All migrations applied via RPC.');
    return;
  }
  console.log('RPC body:', rpcResult.body.substring(0, 200));

  // Try pg-meta
  console.log('\nTrying pg-meta endpoint...');
  const metaResult = await runSQLViaMeta(FULL_SQL);
  console.log(`pg-meta result: HTTP ${metaResult.status}`);
  if (metaResult.status === 200 || metaResult.status === 204) {
    console.log('\n✅ SUCCESS! All migrations applied via pg-meta.');
    return;
  }
  console.log('pg-meta body:', metaResult.body.substring(0, 300));

  console.log('\n⚠️  Automatic migration not possible with anon key (expected).');
  console.log('📋 Please run this SQL in your Supabase SQL Editor:');
  console.log('   → https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
  console.log('\n--- COPY THE SQL FROM: supabase/migrations/ ---');
}

main().catch(console.error);
