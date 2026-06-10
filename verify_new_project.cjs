const https = require('https');

const PROJECT_REF = 'pufhbpkhutucjsiohdud';
const PUBLISHABLE_KEY = 'sb_publishable_Y9YLeRRDrwPM7BtpsTipIA_6mwuuKwC';
const BASE = `${PROJECT_REF}.supabase.co`;

function get(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: BASE,
      path,
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
}

function post(path, payload) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: BASE,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'apikey': PUBLISHABLE_KEY,
        'Authorization': `Bearer ${PUBLISHABLE_KEY}`,
        'Prefer': 'return=representation',
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', e => resolve({ status: -1, body: e.message }));
    req.write(body);
    req.end();
  });
}

function del(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: BASE,
      path,
      method: 'DELETE',
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
}

function check(name, status, expected, body) {
  const ok = expected.includes(status);
  const icon = ok ? '✅' : '❌';
  console.log(`${icon} ${name}: HTTP ${status}${ok ? '' : ' — ' + body.substring(0, 120)}`);
  return ok;
}

async function main() {
  console.log('=== Verifying new Supabase project: pufhbpkhutucjsiohdud ===\n');
  let allOk = true;

  // 1. Check dinners table (SELECT)
  const d = await get('/rest/v1/dinners?select=id&limit=1');
  allOk &= check('dinners table (SELECT)', d.status, [200], d.body);

  // 2. Check ratings table (SELECT)
  const r = await get('/rest/v1/ratings?select=id&limit=1');
  allOk &= check('ratings table (SELECT)', r.status, [200], r.body);

  // 3. Check queries table (SELECT)
  const q = await get('/rest/v1/queries?select=id&limit=1');
  allOk &= check('queries table (SELECT)', q.status, [200], q.body);

  // 4. INSERT a test query (anon key should be allowed)
  const ins = await post('/rest/v1/queries', {
    name: '__verify_test__',
    department: '__test__',
    feedback: 'Automated verification test — safe to delete'
  });
  allOk &= check('queries INSERT (anon)', ins.status, [200, 201], ins.body);

  // 5. Cleanup the test row
  if (ins.status === 200 || ins.status === 201) {
    const cleanup = await del('/rest/v1/queries?name=eq.__verify_test__');
    check('queries DELETE (cleanup)', cleanup.status, [200, 204], cleanup.body);
  }

  console.log('\n' + (allOk ? '🎉 All checks passed! App is fully wired to the new project.' : '⚠️  Some checks failed — review above.'));
}

main().catch(console.error);
