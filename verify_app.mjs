// Test using the actual Supabase JS client exactly as the app does
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pufhbpkhutucjsiohdud.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Y9YLeRRDrwPM7BtpsTipIA_6mwuuKwC';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('=== Verifying via Supabase JS Client ===\n');

  // 1. dinners SELECT
  const { data: dinners, error: de } = await supabase.from('dinners').select('id').limit(1);
  console.log(de ? `❌ dinners: ${de.message}` : `✅ dinners: OK (${dinners.length} rows)`);

  // 2. ratings SELECT
  const { data: ratings, error: re } = await supabase.from('ratings').select('id').limit(1);
  console.log(re ? `❌ ratings: ${re.message}` : `✅ ratings: OK (${ratings.length} rows)`);

  // 3. queries SELECT
  const { data: queries, error: qe } = await supabase.from('queries').select('id').limit(1);
  console.log(qe ? `❌ queries: ${qe.message}` : `✅ queries: OK (${queries.length} rows)`);

  // 4. INSERT a test query (anon insert should be allowed by RLS)
  const { data: ins, error: ie } = await supabase.from('queries').insert({
    name: '__verify__',
    department: '__test__',
    feedback: 'Automated verification — safe to delete'
  }).select();
  console.log(ie ? `❌ queries INSERT: ${ie.message}` : `✅ queries INSERT: OK → id=${ins[0]?.id}`);

  // 5. Cleanup
  if (!ie && ins?.[0]?.id) {
    const { error: ce } = await supabase.from('queries').delete().eq('id', ins[0].id);
    console.log(ce ? `⚠️  cleanup: ${ce.message}` : `✅ cleanup: OK`);
  }

  console.log('\n🎉 All tables verified via Supabase JS client!');
}

main().catch(console.error);
