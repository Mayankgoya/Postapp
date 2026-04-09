const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 8081,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Register Response:', res.statusCode, data));
});

req.on('error', console.error);
req.write(JSON.stringify({
  name: 'Test User',
  email: 'test_auto@example.com',
  password: 'password123',
  otp: '123456' // Placeholder OTP
}));
req.end();
