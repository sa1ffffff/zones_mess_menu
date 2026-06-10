const https = require('https');

const SUPABASE_URL = 'mcihemyquagsrxsgkuqp.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jaWhlbXlxdWFnc3J4c2drdXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwODQ2MjgsImV4cCI6MjA5NjY2MDYyOH0.6Ll3InNBhTnPfdScLNzBUrNRbRfdFuTWbhE1PZafKmg';

// Try a simple insert to test the queries table existence
const testData = JSON.stringify({
  name: '__test__',
  department: '__test__',
  feedback: '__test__'
});

const options = {
  hostname: SUPABASE_URL,
  path: '/rest/v1/queries',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
    'Prefer': 'return=minimal'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
    if (res.statusCode === 201) {
      console.log('SUCCESS: queries table exists and is writable!');
    } else if (res.statusCode === 404) {
      console.log('Table does not exist yet - need to create it');
    } else {
      console.log('Response:', body);
    }
  });
});

req.on('error', e => console.error('Error:', e));
req.write(testData);
req.end();
