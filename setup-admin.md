# Admin Test Account Setup

To create a test admin account, run this in your browser console:

```javascript
// Create admin user
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Pending Admin',
    email: 'admin@soundtrap.com',
    password: 'admin123',
    role: 'admin'
  })
})
```

**Test Admin Credentials:**
- Email: `admin@soundtrap.com`
- Password: `admin123`

**Test Artist Account:**
```javascript
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Artist',
    email: 'artist@soundtrap.com',
    password: 'artist123',
    role: 'artist'
  })
})
```

Then login at `/auth` with these credentials.

