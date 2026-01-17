---
title: Follow JWT Best Practices
impact: CRITICAL
impactDescription: Secures authentication and prevents token-based attacks
tags: security, jwt, authentication, tokens
---

## Follow JWT Best Practices

Implement JWT tokens correctly to ensure secure authentication and authorization.

**Incorrect (multiple security issues):**

```javascript
const jwt = require('jsonwebtoken');

// PROBLEMS: No expiration, weak secret, sensitive data in payload
app.post('/api/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  
  const token = jwt.sign(
    { 
      userId: user.id,
      password: user.password, // NEVER put sensitive data in JWT!
      role: user.role
    },
    'secret123', // Weak secret key!
    // No expiration time!
  );
  
  res.json({ token });
});
```

**Correct (secure JWT implementation):**

```javascript
const jwt = require('jsonwebtoken');

app.post('/api/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  
  if (!user || !await bcrypt.compare(req.body.password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Access token - short-lived
  const accessToken = jwt.sign(
    { 
      userId: user.id,
      role: user.role
    },
    process.env.JWT_SECRET, // Strong secret from env
    { 
      expiresIn: '15m', // Short expiration
      issuer: 'myapp',
      audience: 'myapp-users'
    }
  );
  
  // Refresh token - longer-lived, stored in httpOnly cookie
  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  
  res.json({ accessToken });
});
```

**Token Verification Middleware:**

```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.user = decoded;
    next();
  });
}

app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ userId: req.user.userId });
});
```

**Refresh Token Endpoint:**

```javascript
app.post('/api/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }
  
  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }
    
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    res.json({ accessToken });
  });
});
```

**Best Practices:**
- Use strong, random secrets (256+ bits)
- Set short expiration times (15min for access tokens)
- Store refresh tokens in httpOnly cookies
- Never store sensitive data in JWTs
- Implement token revocation for logout
- Use HTTPS in production
- Validate all JWT claims (exp, iss, aud)

Reference: [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
