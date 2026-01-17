---
title: Use Environment Variables for Configuration
impact: LOW-MEDIUM
impactDescription: Enables environment-specific configuration
tags: deployment, configuration, environment-variables, twelve-factor
---

## Use Environment Variables for Configuration

Use environment variables to configure your application for different environments.

**Incorrect (hardcoded configuration):**

```javascript
const app = express();

app.listen(3000); // Hardcoded port
mongoose.connect('mongodb://localhost/myapp'); // Hardcoded URL

const corsOptions = {
  origin: 'http://localhost:3000' // Hardcoded origin
};
```

**Correct (environment-based configuration):**

```javascript
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DB_URL,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN,
  jwtSecret: process.env.JWT_SECRET
};

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

mongoose.connect(config.dbUrl);

const corsOptions = {
  origin: config.corsOrigin.split(',')
};
```

**.env files:**

```bash
# .env.development
PORT=3000
DB_URL=mongodb://localhost/myapp-dev
CORS_ORIGIN=http://localhost:3000

# .env.production
PORT=8080
DB_URL=mongodb://prod-server/myapp
CORS_ORIGIN=https://myapp.com
```

Reference: [Twelve-Factor App](https://12factor.net/config)
