import http from 'https';

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvYmJlZnRqZ3ZpemhiZGRncXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMjc5NjksImV4cCI6MjEwMzkwMzk2OX0.2P5ajNUGQSjLIi_d51Mko7p0C8rTaY3hFgUON3JGqPc';

const req = http.request({
  hostname: 'fobbeftjgvizhbddgqsi.supabase.co',
  path: '/rest/v1/posts?select=*',
  method: 'GET',
  headers: {
    'apikey': anonKey,
    'Authorization': 'Bearer ' + anonKey
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
