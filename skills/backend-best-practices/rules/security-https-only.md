---
title: Enforce HTTPS in Production
impact: CRITICAL
impactDescription: Prevents man-in-the-middle attacks and data interception
tags: security, https, ssl, tls
---

## Enforce HTTPS in Production

Always enforce HTTPS in production to encrypt data in transit and prevent man-in-the-middle attacks.

**Incorrect (allows HTTP):**

```javascript
const express = require('express');
const app = express();

// No HTTPS enforcement - vulnerable to MITM attacks!
app.get('/api/login', (req, res) => {
  // Credentials sent in plain text over HTTP!
  const { email, password } = req.body;
  // ...
});

app.listen(3000);
```

**Correct (enforce HTTPS):**

```javascript
const express = require('express');
const helmet = require('helmet');
const app = express();

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Security headers with Helmet
app.use(helmet());

// HSTS - Force HTTPS for future requests
app.use(helmet.hsts({
  maxAge: 31536000, // 1 year
  includeSubDomains: true,
  preload: true
}));

app.listen(3000);
```

**With HTTPS Server:**

```javascript
const https = require('https');
const fs = require('fs');

const httpsOptions = {
  key: fs.readFileSync('/path/to/private-key.pem'),
  cert: fs.readFileSync('/path/to/certificate.pem')
};

https.createServer(httpsOptions, app).listen(443);

// Redirect HTTP to HTTPS
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(80);
```

**Secure Cookie Configuration:**

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only over HTTPS
    httpOnly: true, // Prevent XSS
    sameSite: 'strict', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));
```

**Security Headers:**

```javascript
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:']
  }
}));

// Prevent clickjacking
app.use(helmet.frameguard({ action: 'deny' }));

// Prevent MIME sniffing
app.use(helmet.noSniff());

// Disable X-Powered-By header
app.disable('x-powered-by');
```

Reference: [HTTPS Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)
