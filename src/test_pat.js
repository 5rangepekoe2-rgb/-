import http from 'https';

const pat = 'sbp_8b87••••••••••••••••••••••••••••••••20af';

const req = http.request({
  hostname: 'api.supabase.com',
  path: '/v1/projects',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + pat
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', body);
  });
});

req.end();
