const https = require('https');

const SUPABASE_URL = 'mcihemyquagsrxsgkuqp.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jaWhlbXlxdWFnc3J4c2drdXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwODQ2MjgsImV4cCI6MjA5NjY2MDYyOH0.6Ll3InNBhTnPfdScLNzBUrNRbRfdFuTWbhE1PZafKmg';

// Delete the test row
const options = {
  hostname: SUPABASE_URL,
  path: '/rest/v1/queries?name=eq.__test__',
  method: 'DELETE',
  headers: {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Delete status:', res.statusCode, body);
  });
});

req.on('error', e => console.error('Error:', e));
req.end();
