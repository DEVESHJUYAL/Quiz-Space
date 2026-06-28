# Quiz Space

> A smart, anti-cheat quiz platform for classrooms — built with React + Spring Boot.

Teachers create quizzes, assign them to specific students, and get detailed analytics. Students take quizzes in a controlled, fullscreen environment with real-time timers and instant results.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
  - [Backend → Render](#backend--render)
  - [Frontend → Vercel](#frontend--vercel)
- [Database Migration Note](#database-migration-note)
- [Anti-Cheat System](#anti-cheat-system)

---

## Features

**For Teachers**
- Create quizzes with 4 question types: MCQ, True/False, Short Answer, Fill-in-the-Blank
- Restrict quizzes to specific student emails
- Publish with a shareable 8-character code
- Real-time per-question analytics and pass rates
- Upload whiteboard solution photos (via Cloudinary)
- View every student's answers side by side with violations

**For Students**
- Join any quiz by code or via dashboard
- Fullscreen enforcement with anti-cheat monitoring
- Real-time countdown timer synced from server (WebSocket)
- Resume quiz if browser crashes — session preserved
- Instant results with answer review and violation record
- View teacher-uploaded solutions after submission

**Anti-Cheat**
- Tab switch detection (3 strikes = auto-submit)
- Fullscreen exit detection with blocking overlay
- DevTools open detection
- Copy/paste/right-click blocked
- Browser crash tracked as a violation
- All counts visible to teacher on submissions page

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Axios, STOMP/SockJS |
| Backend | Spring Boot 3.2, Java 21, Spring Security, JPA |
| Database | PostgreSQL |
| Auth | JWT (via jjwt) |
| Real-time | WebSocket (STOMP) |
| File storage | Cloudinary |
| Frontend deploy | Vercel |
| Backend deploy | Render |

---

## Project Structure

```
quiz-space/
├── quiz-space-frontend/          # React + Vite app
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/           # Shared UI components
│   │   ├── context/              # AuthContext
│   │   ├── hooks/                # useAntiCheat, useServerTimer
│   │   ├── pages/                # One file per route
│   │   └── services/             # API calls (axios)
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── postcss.config.js
│
├── quiz-space-backend/           # Spring Boot app
│   └── src/main/java/com/quizgenerator/backend/
│       ├── controller/
│       ├── service/
│       ├── model/
│       ├── dto/
│       ├── repository/
│       ├── exception/
│       └── config/
│
├── .gitignore
├── application.example.properties   # Template — copy to backend resources/
└── README.md
```

---

## Local Development

### Prerequisites

- Java 21+
- Node.js 18+
- PostgreSQL 14+
- Maven 3.8+

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/quiz-space.git
cd quiz-space
```

### 2. Set up the database

```sql
CREATE DATABASE quizspace;
```

### 3. Configure the backend

```bash
cp application.example.properties \
   quiz-space-backend/src/main/resources/application.properties
```

Edit `application.properties` and fill in:
- `spring.datasource.url` → your PostgreSQL URL
- `spring.datasource.username` / `password`
- `jwt.secret` → any random 32+ character string
- Cloudinary credentials (get free account at cloudinary.com)

### 4. Run the backend

```bash
cd quiz-space-backend
mvn spring-boot:run
```

Backend starts at `http://localhost:8080`

### 5. Configure the frontend

```bash
cd quiz-space-frontend
cp .env.example .env.local
```

`.env.local`:
```
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
```

### 6. Run the frontend

```bash
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`

---

## Environment Variables

### Frontend (Vercel)

| Variable | Example | Description |
|---|---|---|
| `VITE_API_URL` | `https://quiz-space-api.onrender.com/api` | Backend API base URL |
| `VITE_WS_URL` | `https://quiz-space-api.onrender.com/ws` | WebSocket endpoint |

### Backend (Render)

| Variable | Description |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://HOST:5432/quizspace` |
| `SPRING_DATASOURCE_USERNAME` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | DB password |
| `JWT_SECRET` | Random 32+ char secret |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `CORS_ALLOWED_ORIGINS` | Your Vercel app URL e.g. `https://quiz-space.vercel.app` |

---

## Deployment

### Backend → Render

Render is the easiest free option for Spring Boot with WebSocket support.

**Step 1 — Push to GitHub**
```bash
git add .
git commit -m "initial commit"
git push origin main
```

**Step 2 — Create a PostgreSQL database on Render**
1. Go to [render.com](https://render.com) → **New → PostgreSQL**
2. Name it `quiz-space-db`
3. Select the free plan
4. Copy the **Internal Database URL** for the next step

**Step 3 — Create a Web Service on Render**
1. **New → Web Service**
2. Connect your GitHub repo
3. Set these fields:

| Field | Value |
|---|---|
| **Name** | `quiz-space-api` |
| **Root Directory** | `quiz-space-backend` |
| **Runtime** | `Java` |
| **Build Command** | `mvn clean package -DskipTests` |
| **Start Command** | `java -jar target/backend-0.0.1-SNAPSHOT.jar` |
| **Instance Type** | Free |

4. Under **Environment Variables**, add:

```
SPRING_DATASOURCE_URL       = jdbc:postgresql://<internal-db-host>:5432/quizspace
SPRING_DATASOURCE_USERNAME  = (from Render DB dashboard)
SPRING_DATASOURCE_PASSWORD  = (from Render DB dashboard)
JWT_SECRET                  = (generate: openssl rand -hex 32)
CLOUDINARY_CLOUD_NAME       = your-cloud-name
CLOUDINARY_API_KEY          = your-api-key
CLOUDINARY_API_SECRET       = your-api-secret
CORS_ALLOWED_ORIGINS        = https://quiz-space.vercel.app
```

5. Click **Create Web Service**

> ⚠️ **Free tier note:** Render's free web services spin down after 15 minutes of inactivity. The first request after sleep takes ~30s. Upgrade to Starter ($7/mo) for always-on.

> ⚠️ **WebSocket on Render:** WebSockets work on Render's paid plans. On the free tier, long-lived connections may be dropped. If the timer stops updating, this is why — upgrade or use a paid plan for production.

**Step 4 — Update `application.properties` to read from environment**

Make sure your `application.properties` uses environment variable overrides:

```properties
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
jwt.secret=${JWT_SECRET}
cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api-key=${CLOUDINARY_API_KEY}
cloudinary.api-secret=${CLOUDINARY_API_SECRET}
```

---

### Frontend → Vercel

**Step 1 — Go to [vercel.com](https://vercel.com)**
1. Click **Add New → Project**
2. Import your GitHub repo
3. Set **Root Directory** to `quiz-space-frontend`

**Step 2 — Configure build settings**

| Field | Value |
|---|---|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

**Step 3 — Add Environment Variables**

In Vercel project settings → Environment Variables:

```
VITE_API_URL  =  https://quiz-space-api.onrender.com/api
VITE_WS_URL   =  https://quiz-space-api.onrender.com/ws
```

**Step 4 — Add `vercel.json` for client-side routing**

React Router needs all routes to serve `index.html`. Create `quiz-space-frontend/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Step 5 — Deploy**

Click **Deploy**. Vercel auto-deploys on every push to `main`.

Your app will be live at `https://quiz-space.vercel.app` (or your custom domain).

---

## Database Migration Note

The project uses `spring.jpa.hibernate.ddl-auto=update` which auto-creates/updates tables on startup. If you've been running an older version, make sure your database has these columns:

```sql
-- Added for browser crash tracking
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS browser_crash_count INTEGER DEFAULT 0;

-- Added for DevTools tracking
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS devtools_count INTEGER DEFAULT 0;
```

---

## Anti-Cheat System

| Detection | Method | Threshold |
|---|---|---|
| Tab switch | `visibilitychange` + `window blur` | 3 strikes → auto-submit |
| Fullscreen exit | `fullscreenchange` | 3 strikes → auto-submit |
| DevTools | F12/keyboard shortcuts + window size heuristic | Tracked, not auto-submit |
| Right-click | `contextmenu` blocked | Tracked |
| Copy/Paste/Cut | Clipboard events blocked | Blocked silently |
| Keyboard shortcuts | Ctrl+C/V/X/A/U, Alt+anything, Meta key | Blocked silently |
| Print/Screenshot | `beforeprint` blocked | Tracked |
| Browser crash | Detected on resume via `browserCrashCount` | Tracked |

All counts are stored per-attempt and displayed to the teacher on the Submissions page.

---

## License

MIT