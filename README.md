# ⚡ LifeOS — AI-powered Personal Life Operating System

> Organize your life. Improve every day.

A production-quality, full-stack mobile application built with React Native (Expo) + Node.js/Express/MongoDB.

---

## 🚀 Tech Stack

### Mobile (Frontend)
| Tech | Purpose |
|------|---------|
| React Native + Expo | Cross-platform mobile |
| TypeScript | Type safety |
| Expo Router | File-based navigation |
| NativeWind (Tailwind) | Styling |
| Zustand | State management |
| React Hook Form + Zod | Forms + validation |
| React Query | Data fetching & caching |
| Reanimated | Smooth animations |
| React Native SVG | Custom graphics |
| React Native Chart Kit | Analytics charts |
| Expo SecureStore | Token storage |
| Expo Notifications | Push notifications |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | REST API |
| MongoDB Atlas + Mongoose | Database |
| JWT + bcryptjs | Authentication |
| Cloudinary | Image storage |
| Firebase Admin | Push notifications |
| OpenAI GPT | AI Coach summaries |
| Node-cron | Scheduled jobs |
| Winston | Logging |
| Helmet + Rate Limiting | Security |

---

## 📁 Project Structure

```
LifeOS/
├── mobile/                    # React Native (Expo) app
│   ├── app/
│   │   ├── _layout.tsx        # Root layout
│   │   ├── index.tsx          # Auth redirect
│   │   ├── (auth)/            # Login, Register, Forgot Password
│   │   ├── (tabs)/            # Home, Timeline, Analytics, Habits, Profile
│   │   ├── onboarding/        # 5-step onboarding flow
│   │   └── screens/           # Modal screens (Water, Sleep, Workout, etc.)
│   ├── components/
│   │   ├── ui/                # Button, Input, ProgressRing, ProgressBar, etc.
│   │   ├── cards/             # LifeScoreCard, QuickStatCard, ActivityTimelineCard
│   │   ├── charts/            # Chart components
│   │   └── animations/        # Animated components
│   ├── store/                 # Zustand stores (auth, dashboard, water, etc.)
│   ├── services/              # API client with interceptors
│   ├── constants/             # Theme, colors, API endpoints
│   ├── types/                 # TypeScript type definitions
│   └── hooks/                 # Custom React hooks
│
└── backend/                   # Node.js + Express API
    └── src/
        ├── server.js          # Entry point
        ├── config/            # DB, Cloudinary config
        ├── models/            # Mongoose models (15 collections)
        ├── controllers/       # Business logic
        ├── routes/            # API routes
        ├── middleware/        # Auth, error handling, validation
        ├── services/          # External services
        ├── utils/             # XP calculator, Life score engine
        └── jobs/              # Cron jobs
```

---

## 🗄️ Database Collections

| Collection | Purpose |
|-----------|---------|
| users | User profiles, XP, settings |
| activities | Custom and default activities |
| activity_logs | Daily completion logs |
| sleep_logs | Sleep sessions & quality |
| meal_logs | Meals with macros |
| study_logs | Study sessions, Pomodoro |
| workout_logs | Workouts with exercises |
| water_logs | Hydration tracking |
| weight_logs | Weight & body measurements |
| screen_time_logs | Screen time data |
| habits | Habit definitions |
| xp_logs | XP history |
| user_badges | Earned badges |
| daily_scores | Life score components |
| reports | AI-generated reports |

---

## 🌟 Features

### Authentication
- Email/Password registration & login
- JWT access + refresh token rotation
- Forgot password with email reset
- Google OAuth (scaffolded)
- Secure token storage (Expo SecureStore)

### Onboarding (5 Steps)
- Personal info (name, age, gender, occupation)
- Body stats (height, weight, goal weight)
- Daily schedule (wake, sleep, meal, workout times)
- Daily goals (water, screen time, steps, study)
- Auto-generates default daily routine

### Home Dashboard
- Personalized greeting + live time
- **Life Score** (0-100) with grade (S/A/B/C/D/F)
- Level + XP progress bar
- Fire streak counter
- Quick stat cards (Sleep, Water, Workout, Study)
- Mood tracker (5 emoji options)
- Today's upcoming activities
- Recent badges earned
- Quick action buttons

### Timeline
- Google Calendar-style daily view
- Date navigation (prev/next day)
- Filter by status (All, Done, Pending, Missed)
- One-tap activity completion
- Completion progress bar

### Analytics
- Week / Month / Year views
- Life Score chart (line)
- Sleep duration chart (bar)
- Water intake chart (line)
- Workout minutes chart (bar)
- Study hours chart (line)
- XP earned chart (bar)
- Summary stats cards

### Habits
- Daily/Weekly/Monthly habits
- Streak tracking (current + best)
- Completion rate percentage
- Visual progress bars
- Category filtering

### Profile
- Avatar with camera upload
- Level badge + XP display
- Streak stats (current, best, total XP)
- Body stats (height, weight, BMI, goal)
- Badge showcase with rarity tiers
- Settings (notifications, theme, schedule)
- Account management

### Activity System
- Create/Edit/Delete/Duplicate activities
- Custom icon, color, category
- Scheduled time + estimated duration
- XP reward configuration
- Priority levels (Low/Medium/High/Critical)
- Smart reminders
- Repeat schedule (Daily/Weekly/Custom)
- Complete with notes, mood, rating

### XP & Level System
- Every activity awards XP
- Infinite level progression
- Formulaic level-up requirements
- XP log history
- Streak bonuses (7/30/100 days)

### Life Score
- Weighted daily score (0-100)
  - Sleep (20%), Exercise (20%), Meals (15%)
  - Water (15%), Study (15%), Screen Time (10%), Mood (5%)
- Grade system: S/A/B/C/D/F
- Daily breakdown explanation

### AI Coach
- Daily AI summary (OpenAI GPT-3.5)
- Weekly & Monthly reports
- Smart contextual suggestions
- Fallback summaries (no API key needed)

### Trackers
- **Water**: Quick add (150-750ml), goal ring, entry history
- **Sleep**: Start/end tracking, quality rating, sleep score
- **Workout**: Type, exercises, duration, intensity, calories, rating
- **Study**: Session tracking, Pomodoro timer (25/5/15 min), library check-in/out
- **Weight**: BMI auto-calc, body measurements, goal progress
- **Meals**: Breakfast/Lunch/Dinner/Snack, macros (protein/carbs/fat/calories)

### Badges (9 tiers)
- Early Bird, Workout Warrior, Study Beast
- Hydration Hero, Sleep Master, Legendary
- Common/Rare/Epic/Legendary rarity
- XP rewards on badge unlock

### Cron Jobs
- Daily midnight: Mark missed activities, update streaks
- 11:50 PM: Calculate final daily life scores

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account (optional)
- OpenAI API key (optional, for AI Coach)
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

```bash
cd LifeOS/backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### Mobile Setup

```bash
cd LifeOS/mobile
npm install
cp .env.example .env.local
# Set EXPO_PUBLIC_API_URL to your backend URL
npx expo start
```

### Environment Variables

**Backend** (`.env`):
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
OPENAI_API_KEY=sk-...
```

**Mobile** (`.env.local`):
```
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000/api
```

> Use your machine's local IP (not localhost) for physical device testing.

---

## 🚀 Deployment

### Backend → Render
1. Push to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect repo, set build command: `npm install`
4. Set start command: `npm start`
5. Add all environment variables
6. Deploy!

### Database → MongoDB Atlas
1. Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user with read/write access
3. Whitelist `0.0.0.0/0` for Render IP
4. Copy connection string to `MONGODB_URI`

### Images → Cloudinary
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Copy Cloud Name, API Key, API Secret

### Mobile → Expo / App Stores
```bash
npx eas build --platform all
npx eas submit
```

---

## 📱 Screens Overview

| Screen | Route |
|--------|-------|
| Login | `/(auth)/login` |
| Register | `/(auth)/register` |
| Forgot Password | `/(auth)/forgot-password` |
| Onboarding | `/onboarding` |
| Home Dashboard | `/(tabs)/home` |
| Timeline | `/(tabs)/timeline` |
| Analytics | `/(tabs)/analytics` |
| Habits | `/(tabs)/habits` |
| Profile | `/(tabs)/profile` |
| Water Tracker | `/screens/water-tracker` |
| Sleep Tracker | `/screens/sleep-tracker` |
| Workout Log | `/screens/workout-log` |
| Study Tracker | `/screens/study-tracker` |
| Weight Log | `/screens/weight-log` |
| Meal Log | `/screens/meal-log` |
| Add Activity | `/screens/add-activity` |
| Activity Detail | `/screens/activity-detail` |
| AI Report | `/screens/ai-report` |

---

## 🔮 Future Features (Roadmap)

- [ ] Health Connect / Google Fit integration
- [ ] Google Calendar sync
- [ ] Smartwatch support (Wear OS)
- [ ] Voice commands
- [ ] AI Chat Coach (real-time conversation)
- [ ] Expense Tracker module
- [ ] Friends & Leaderboards
- [ ] Challenges system
- [ ] Home/Lock screen Widgets
- [ ] Offline mode with background sync
- [ ] Location-based activity triggers

---

## 🎨 Design System

- **Primary**: `#6366F1` (Indigo)
- **Background**: `#0F0F23` (Deep Dark)
- **Surface**: `#1E1E3A`
- **Rounded cards** with subtle borders
- **Glassmorphism** on modals
- **Smooth Reanimated** transitions
- **Linear gradients** throughout
- **Dark mode** primary (light mode ready)

---

## 📄 License

MIT — Built with ❤️ for the community.
