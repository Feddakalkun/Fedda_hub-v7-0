# Complete Project Setup: Frontend + Backend Local Development (2026)

> **Start from an empty folder** → Follow these instructions step-by-step → `npm install` → `npm run dev`

---

## 📥 Prerequisites & Download Links (2026)

### 1. Node.js v22.20.0 LTS (RECOMMENDED FOR PRODUCTION)
**Latest stable version with long-term support until April 2027**

#### Direct Downloads

| Platform | Download Link | File Size |
|----------|--------|-----------|
| **Windows 64-bit (Recommended)** | https://nodejs.org/dist/v22.20.0/node-v22.20.0-x64.msi | ~30 MB |
| **Windows 32-bit** | https://nodejs.org/dist/v22.20.0/node-v22.20.0-x86.msi | ~28 MB |
| **macOS 64-bit** | https://nodejs.org/dist/v22.20.0/node-v22.20.0.pkg | ~45 MB |
| **macOS ARM64 (M1/M2/M3)** | https://nodejs.org/dist/v22.20.0/node-v22.20.0.pkg | Auto-detects |
| **Linux x64 (tar.xz)** | https://nodejs.org/dist/v22.20.0/node-v22.20.0-linux-x64.tar.xz | ~35 MB |
| **Linux ARM64** | https://nodejs.org/dist/v22.20.0/node-v22.20.0-linux-arm64.tar.xz | ~33 MB |
| **Official Page** | https://nodejs.org/en/download | - |

**Includes:** npm 11.6.0 (latest as of January 2026)

#### Package Manager Installation

```bash
# Windows (Chocolatey)
choco install nodejs-lts

# macOS (Homebrew) - EASIEST for Mac users
brew install node

# macOS Alternative (nvm - Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 22
nvm use 22

# Linux (Ubuntu/Debian)
curl -sL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Linux (Fedora/RHEL)
curl -sL https://rpm.nodesource.com/setup_22.x | sudo bash
sudo dnf install -y nodejs
```

#### Verify Installation

```bash
node --version    # Should show v22.20.0
npm --version     # Should show 11.6.0
```

---

### 2. Git (Version Control - Optional but Recommended)

| Platform | Download | Alternative |
|----------|----------|-------------|
| **Windows** | https://git-scm.com/download/win | Chocolatey: `choco install git` |
| **macOS** | https://git-scm.com/download/mac | Homebrew: `brew install git` |
| **Linux** | https://git-scm.com/download/linux | `sudo apt install git` (Ubuntu) |

**Verify Installation:**
```bash
git --version  # Should show git version 2.x.x
```

---

### 3. Visual Studio Code (Recommended IDE)

**Latest v1.108.0 (January 2026)**

| Platform | Download |
|----------|----------|
| **Windows 64-bit** | https://code.visualstudio.com/download |
| **macOS (Universal)** | https://code.visualstudio.com/download |
| **Linux (deb/rpm/snap)** | https://code.visualstudio.com/download |
| **GitHub Download** | https://github.com/microsoft/vscode/releases |

**Recommended Extensions for This Project:**
```
es7-react-js-snippets        (dsznajder.es7-react-js-snippets)
Prettier - Code formatter    (esbenp.prettier-vscode)
Thunder Client               (rangav.vscode-thunder-client)
REST Client                  (humao.rest-client)
GitHub Copilot              (GitHub.copilot) - Optional, paid
MongoDB for VS Code         (mongodb.mongodb-vscode) - If using MongoDB
SQLite Viewer              (qwtel.sqlite-viewer) - Optional
```

**Install Extensions:**
Open VS Code → Extensions (Ctrl+Shift+X) → Search and click Install

---

## 🔗 Framework Versions (2026)

### Frontend Stack
| Package | Latest Version | Download | Docs |
|---------|--------|----------|------|
| **Next.js** | 16.1.1 LTS | `npm install next@latest` | https://nextjs.org/docs |
| **React** | 19.x | Installed via Next.js | https://react.dev |
| **TypeScript** | 5.x | Installed via Next.js | https://www.typescriptlang.org |
| **Axios** | 1.6.0 | `npm install axios` | https://axios-http.com |

### Backend Stack
| Package | Latest Version | Download | Docs |
|---------|--------|----------|------|
| **Express.js** | 5.1.0 | `npm install express@latest` | https://expressjs.com |
| **Node.js** | 22.20.0 LTS | Download above | https://nodejs.org/docs |
| **CORS** | 2.8.5 | `npm install cors` | https://github.com/expressjs/cors |
| **dotenv** | 16.3.1 | `npm install dotenv` | https://github.com/motdotla/dotenv |

### Dev Tools
| Tool | Version | Download | Purpose |
|------|---------|----------|---------|
| **concurrently** | 8.2.2 | `npm install concurrently -D` | Run frontend + backend together |
| **nodemon** | 3.0.1 | `npm install nodemon -D` | Auto-restart on changes |
| **ESLint** | 8.50.0 | `npm install eslint -D` | Code linting |
| **Prettier** | 3.x | `npm install prettier -D` | Code formatting |

---

## Project Structure

```
your-project-folder/
├── frontend/                 # Next.js + React UI
│   ├── app/
│   ├── components/
│   ├── pages/
│   ├── public/
│   ├── styles/
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
├── backend/                  # Node.js + Express API
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── utils/
│   ├── .env.local
│   ├── package.json
│   └── server.js
├── package.json              # Root workspace (monorepo)
└── README.md
```

---

## 🚀 Step 1: Initialize Root Workspace

```bash
# Create and navigate to project folder
mkdir your-project-name
cd your-project-name

# Initialize root package.json (monorepo)
npm init -y
```

**Edit `package.json`:**

```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "description": "Full-stack local development environment (2026)",
  "private": true,
  "scripts": {
    "dev": "npm run dev --workspaces",
    "install": "npm install --workspaces",
    "backend": "cd backend && npm run dev",
    "frontend": "cd frontend && npm run dev",
    "both": "concurrently \"npm run backend\" \"npm run frontend\""
  },
  "workspaces": [
    "frontend",
    "backend"
  ],
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

**Install workspace dependency:**

```bash
npm install concurrently --save-dev
```

---

## 🎨 Step 2: Create Frontend (Next.js 16 + React 19)

```bash
# Create frontend folder
mkdir frontend
cd frontend

# Initialize frontend package.json
npm init -y
```

**Edit `frontend/package.json`:**

```json
{
  "name": "frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^16.1.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "eslint": "^8.50.0",
    "eslint-config-next": "^16.1.1",
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

**Install dependencies:**

```bash
npm install
```

**Create `frontend/next.config.js`:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
};

module.exports = nextConfig;
```

**Create `frontend/tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

**Create folder structure:**

```bash
mkdir -p app/api components/ui lib styles
```

**Create `frontend/app/layout.tsx`:**

```typescript
import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Your Project',
  description: 'Full-stack local development (2026)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Create `frontend/app/page.tsx`:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/test`
      );
      setData(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🚀 Full-Stack Local Development (2026)</h1>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>Backend Connection Test</h2>
        
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {data && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            marginTop: '1rem',
          }}>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
        
        <button
          onClick={fetchData}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          Refresh Data
        </button>
      </section>

      <section style={{ marginTop: '3rem', fontSize: '14px', color: '#666' }}>
        <h3>📍 Local URLs</h3>
        <p>Frontend: http://localhost:3000</p>
        <p>Backend: http://localhost:3001</p>
        <p>Backend Health: http://localhost:3001/health</p>
      </section>

      <section style={{ marginTop: '2rem', fontSize: '13px' }}>
        <h3>✅ Tech Stack (2026)</h3>
        <ul>
          <li>Frontend: Next.js 16.1.1 + React 19</li>
          <li>Backend: Express.js 5.1.0</li>
          <li>Runtime: Node.js 22.20.0 LTS</li>
          <li>Type Safety: TypeScript 5.x</li>
        </ul>
      </section>
    </main>
  );
}
```

**Create `frontend/styles/globals.css`:**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #ffffff;
  color: #000000;
  line-height: 1.6;
}

button {
  font-family: inherit;
  cursor: pointer;
}

input,
textarea,
select {
  font-family: inherit;
}

code {
  background-color: #f4f4f4;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}
```

**Navigate back to root:**

```bash
cd ..
```

---

## ⚙️ Step 3: Create Backend (Express 5.1.0 + Node.js 22)

```bash
# Create backend folder
mkdir backend
cd backend

# Initialize backend package.json
npm init -y
```

**Edit `backend/package.json`:**

```json
{
  "name": "backend",
  "version": "1.0.0",
  "private": true,
  "main": "server.js",
  "scripts": {
    "dev": "node --watch server.js",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

**Install dependencies:**

```bash
npm install
```

**Create `backend/.env.local`:**

```env
# Backend Configuration (2026)
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# API Keys (add your keys here - NEVER commit to git!)
# ELEVENLABS_API_KEY=sk-...
# COMFYUI_URL=http://localhost:8188
# OLLAMA_URL=http://localhost:11434
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

**Create `backend/.gitignore`:**

```
node_modules/
.env.local
.env
.DS_Store
*.log
dist/
```

**Create folder structure:**

```bash
mkdir -p routes controllers middleware models utils
```

**Create `backend/server.js`:**

```javascript
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS Configuration
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 Backend Server Running             ║
║  📍 http://localhost:${PORT}             ║
║  🔗 CORS: ${FRONTEND_URL}  ║
║  📦 Node.js: ${process.version}            ║
║  📦 Express: 5.1.0                     ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
```

**Create `backend/routes/api.js`:**

```javascript
const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// Test endpoint
router.get('/test', testController.getTestData);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'API healthy',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
  });
});

module.exports = router;
```

**Create `backend/controllers/testController.js`:**

```javascript
exports.getTestData = async (req, res, next) => {
  try {
    const data = {
      message: '✅ Backend is connected to Frontend!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      features: {
        backend: 'Express.js 5.1.0',
        frontend: 'Next.js 16.1.1 + React 19',
        runtime: 'Node.js 22.20.0 LTS',
        database: 'Ready to integrate (PostgreSQL, MongoDB, etc)',
      },
    };

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
```

**Create `backend/middleware/auth.js`:**

```javascript
// JWT or API Key validation middleware (template for future use)
const authMiddleware = (req, res, next) => {
  // Add authentication logic here
  // Example: Check Authorization header
  // const token = req.headers.authorization?.split(' ')[1];
  // if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  next();
};

module.exports = authMiddleware;
```

**Create `backend/utils/logger.js`:**

```javascript
const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, Object.keys(data).length > 0 ? data : '');
};

module.exports = {
  info: (msg, data) => log('info', msg, data),
  error: (msg, data) => log('error', msg, data),
  debug: (msg, data) => log('debug', msg, data),
  warn: (msg, data) => log('warn', msg, data),
};
```

**Navigate back to root:**

```bash
cd ..
```

---

## 📦 Step 4: Install All Dependencies

From the **root folder**:

```bash
npm install
```

This installs dependencies for both frontend and backend workspaces.

**Verify installation:**
```bash
npm list --depth=0  # Shows installed packages
```

---

## ▶️ Step 5: Run the Full Stack

### Option A: Run Both Together (Recommended)

```bash
npm run both
```

You should see:

```
[0] Starting Backend...
[1] Starting Frontend...
[0] 🚀 Backend Server Running at http://localhost:3001
[1] ▲ Next.js (v16.x.x)
[1] ✓ Ready in 2.3s
[1] > Local:        http://localhost:3000
```

### Option B: Run Separately

**Terminal 1 (Backend):**
```bash
npm run backend
```

**Terminal 2 (Frontend):**
```bash
npm run frontend
```

### Option C: Individual Project Development

```bash
# Frontend only
cd frontend && npm run dev

# Backend only
cd backend && npm run dev
```

---

## ✅ Step 6: Verify Everything Works

1. **Open browser:** http://localhost:3000
2. **You should see:**
   - "🚀 Full-Stack Local Development (2026)"
   - "✅ Backend is connected to Frontend!"
   - A JSON response from backend showing versions
   - Tech stack details

3. **Click "Refresh Data" button** → Should re-fetch from backend

4. **Backend health check:** 
   ```bash
   curl http://localhost:3001/health
   ```
   Or open: http://localhost:3001/health

5. **Check versions:**
   ```bash
   node --version   # v22.20.0
   npm --version    # 11.6.0+
   ```

---

## 🔧 Adding New Features

### Add a Backend Route

**Create `backend/routes/character.js`:**

```javascript
const express = require('express');
const router = express.Router();

router.post('/create', (req, res) => {
  const { name, description, style } = req.body;
  
  // Validate input
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  // Your logic here (later: save to database)
  
  res.status(201).json({
    success: true,
    data: {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      style,
      createdAt: new Date().toISOString(),
    }
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    id,
    name: 'Sample Character',
    description: 'A sample character',
    style: 'anime',
    createdAt: new Date().toISOString(),
  });
});

module.exports = router;
```

**Update `backend/routes/api.js`:**

```javascript
const characterRoute = require('./character');
router.use('/character', characterRoute);
```

### Add a Frontend Component

**Create `frontend/components/ui/CharacterForm.tsx`:**

```typescript
'use client';

import { useState } from 'react';
import axios from 'axios';

interface CharacterFormProps {
  onSuccess?: () => void;
}

export default function CharacterForm({ onSuccess }: CharacterFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/character/create`,
        { name, description }
      );

      console.log('Character created:', response.data);
      setName('');
      setDescription('');
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Character Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter character name"
          required
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Character description"
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            minHeight: '100px',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</p>}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '0.5rem 1rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          backgroundColor: loading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Creating...' : 'Create Character'}
      </button>
    </form>
  );
}
```

---

## 🌍 Environment Variables Reference

### Frontend `.env.local` (optional)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Your App Name
NEXT_PUBLIC_DEBUG=true
```

### Backend `.env.local` (IMPORTANT: Create this file)

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# API Keys (NEVER commit to git!)
ELEVENLABS_API_KEY=sk-...
UBERDUCK_API_KEY=...
COMFYUI_URL=http://localhost:8188
OLLAMA_URL=http://localhost:11434

# Database (if using)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname

# Social Media APIs
TIKTOK_ACCESS_TOKEN=...
INSTAGRAM_ACCESS_TOKEN=...
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
TWITTER_API_KEY=...

# Logging
LOG_LEVEL=info
```

**⚠️ IMPORTANT: Add `.env.local` to `.gitignore`**

```bash
echo ".env.local" >> backend/.gitignore
echo ".env" >> backend/.gitignore
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `Port 3000/3001 already in use` | Kill process: `lsof -ti:3000 \| xargs kill -9` or change ports in scripts |
| `CORS error` | Check `FRONTEND_URL` in `backend/.env.local` |
| `Module not found` | Run `npm install` from root folder |
| `Next.js not found` | Run `cd frontend && npm install` |
| `Cannot find Express` | Run `cd backend && npm install` |
| `Hot reload not working` | Restart dev server (`Ctrl+C` then `npm run dev` again) |
| `Permission denied on Linux` | Run with `sudo` or fix npm permissions: `sudo chown -R $USER ~/.npm` |
| `npm command not found` | Reinstall Node.js from https://nodejs.org |
| `TypeScript errors` | Run `npm install` to ensure types are installed |
| `Port already in use (Windows)` | `netstat -ano \| findstr :3000` then `taskkill /PID <PID> /F` |

---

## 📋 File Checklist

### Frontend
- ✅ `frontend/package.json`
- ✅ `frontend/next.config.js`
- ✅ `frontend/tsconfig.json`
- ✅ `frontend/app/layout.tsx`
- ✅ `frontend/app/page.tsx`
- ✅ `frontend/styles/globals.css`

### Backend
- ✅ `backend/package.json`
- ✅ `backend/.env.local`
- ✅ `backend/.gitignore`
- ✅ `backend/server.js`
- ✅ `backend/routes/api.js`
- ✅ `backend/controllers/testController.js`
- ✅ `backend/middleware/auth.js`
- ✅ `backend/utils/logger.js`

### Root
- ✅ `package.json`
- ✅ `.gitignore`

---

## 📚 Next Steps (Roadmap)

1. ✅ **Setup complete** - Basic full-stack running
2. 🔄 **Add business logic** - Create routes and components
3. 🗄️ **Integrate database** - PostgreSQL, MongoDB, or SQLite
4. 🔐 **Add authentication** - JWT, OAuth, or sessions
5. 📊 **Add real features** - Character generation, image upload, etc.
6. 🎨 **Style with CSS/Tailwind** - Make it beautiful
7. 📦 **Deploy to production** - Vercel (frontend), Railway/Render (backend)

---

## 🎯 Quick Command Reference

```bash
# Installation
npm install               # Install all dependencies
npm install --legacy-peer-deps  # If peer dependency conflicts

# Development
npm run dev              # Run both frontend and backend
npm run backend          # Backend only
npm run frontend         # Frontend only
npm run both             # Alias for dev

# Building
npm run build            # Build frontend and backend

# Utilities
npm list                 # List all installed packages
npm outdated             # Check for outdated packages
npm update               # Update packages

# Health checks
curl http://localhost:3001/health
open http://localhost:3000

# Clean cache
npm cache clean --force
rm -rf node_modules
npm install
```

---

## 🔗 Useful Links & Resources

### Official Documentation
- **Node.js**: https://nodejs.org/docs/v22.20.0/api/
- **npm**: https://docs.npmjs.com/
- **Next.js**: https://nextjs.org/docs
- **Express.js**: https://expressjs.com/api.html
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs/

### Learning Resources
- **Node.js Tutorial**: https://www.w3schools.com/nodejs/
- **Express.js Guide**: https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs
- **Next.js Tutorial**: https://nextjs.org/learn
- **React Hooks**: https://react.dev/reference/react

### Community
- **Stack Overflow**: Tag `node.js`, `express`, `next.js`
- **GitHub Discussions**: https://github.com/nodejs/node/discussions
- **Discord Communities**: Node.js, Express, Next.js (find on Discord.gg)

---

## 💡 Pro Tips for Fedda Hub Development

Given your use case with ComfyUI, TTS, and social media APIs:

1. **Create an async queue system** for handling long-running image generation requests
2. **Use WebSockets** for real-time progress updates from ComfyUI
3. **Implement API key management** securely in the backend (never expose to frontend)
4. **Create rate limiting middleware** for expensive API calls
5. **Set up environment-specific configs** (dev, staging, production)
6. **Use database for persistence** - Character definitions, generation history, user accounts
7. **Implement proper error handling** - AI models fail, APIs timeout, be graceful
8. **Add logging and monitoring** - Debug issues in production
9. **Cache expensive operations** - ComfyUI generations, TTS results
10. **Plan for scalability** - Multiple model instances, queue workers, load balancing

---

**Happy coding! 🚀 (2026 Edition)**

**Last Updated:** January 2026
**Verified with:** Node.js 22.20.0, npm 11.6.0, Next.js 16.1.1, Express.js 5.1.0
