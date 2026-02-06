# 🤖 AI-Powered Assistant with Tool Calling

A full-stack AI chatbot built with Next.js 16, featuring real-time streaming responses and AI tool calling for weather, stocks, and F1 race information.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

### 🔐 Authentication
- **Google OAuth** - Sign in with Google
- **GitHub OAuth** - Sign in with GitHub
- **Protected Routes** - Middleware-based route protection

### 💬 AI Chat
- **GROQ AI** - Lightning-fast LLM responses (Llama 3.3 70B)
- **Streaming Responses** - Real-time text streaming with Vercel AI SDK
- **Chat History** - Persistent conversations stored in PostgreSQL
- **Tool Calling** - AI can call external APIs for real-time data

### 🛠️ AI Tools
| Tool | API | Description |
|------|-----|-------------|
| 🌤️ Weather | OpenWeatherMap | Get current weather for any city |
| 📈 Stocks | Alpha Vantage | Get real-time stock prices |
| 🏎️ F1 Races | OpenF1 | Get next Formula 1 race info |

### 🎨 UI/UX
- **Dark Theme** - Beautiful dark mode interface
- **Tool Cards** - Gradient-styled cards for each tool result
- **Responsive Design** - Works on desktop and mobile
- **Loading States** - Smooth loading animations

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Auth**: NextAuth.js v5 (Auth.js)
- **AI**: Vercel AI SDK + GROQ

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or pnpm
- Neon Database account
- API keys (see below)

### 1. Clone the repository
```bash
git clone <repository-url>
cd ai-assistant
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://..."

# Auth
AUTH_SECRET="your-auth-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# AI
GROQ_API_KEY="your-groq-api-key"

# Tools
OPENWEATHERMAP_API_KEY="your-openweathermap-key"
ALPHA_VANTAGE_API_KEY="your-alpha-vantage-key"
```

### 4. Set up the database
```bash
npm run db:push
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🔑 Getting API Keys

| Service | URL | Notes |
|---------|-----|-------|
| GROQ | [console.groq.com](https://console.groq.com) | Free tier available |
| OpenWeatherMap | [openweathermap.org/api](https://openweathermap.org/api) | Free tier |
| Alpha Vantage | [alphavantage.co](https://www.alphavantage.co/support/#api-key) | Free tier (5 calls/min) |
| Google OAuth | [console.cloud.google.com](https://console.cloud.google.com) | Create credentials |
| GitHub OAuth | [github.com/settings/developers](https://github.com/settings/developers) | Create OAuth app |

## 🌐 Deployment (Vercel)

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and import your repository
2. Add all environment variables from `.env.local`
3. Deploy!

### 3. Update OAuth Redirect URLs
After deployment, update your OAuth apps:
- **Google**: Add `https://your-app.vercel.app/api/auth/callback/google`
- **GitHub**: Add `https://your-app.vercel.app/api/auth/callback/github`

## 📁 Project Structure

```
ai-assistant/
├── src/
│   ├── app/
│   │   ├── (protected)/      # Auth-protected routes
│   │   │   └── chat/         # Chat pages
│   │   ├── api/
│   │   │   ├── auth/         # NextAuth API routes
│   │   │   └── chat/         # AI chat endpoint
│   │   └── login/            # Login page
│   ├── components/
│   │   ├── chat/             # Chat interface components
│   │   └── ui/               # shadcn/ui components
│   ├── db/                   # Database schema & config
│   └── lib/                  # Auth config & AI tools
├── drizzle.config.ts
└── package.json
```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |

## 🎯 Usage Examples

Try these prompts with the AI:
- "What's the weather in New York?"
- "What's the Apple stock price?"
- "When is the next F1 race?"
- "How's the weather in Tokyo?"

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

Built with ❤️ using Next.js and Vercel AI SDK
