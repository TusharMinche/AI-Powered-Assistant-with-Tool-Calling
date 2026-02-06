# 🤖 AI-Powered Chat Assistant

An intelligent chat assistant with tool calling capabilities, built with Next.js 15, featuring real-time weather, stock prices, and F1 race information.

![AI Assistant Preview](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## ✨ Features

- 🌤️ **Weather Information** - Get real-time weather for any city
- 📈 **Stock Prices** - Check live stock prices and changes
- 🏎️ **F1 Race Schedule** - Find upcoming Formula 1 race details
- 💬 **Chat History** - Persistent conversations with full history
- 🔐 **Authentication** - Google & GitHub OAuth login
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Dark Theme** - Beautiful dark UI

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React Framework |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| Drizzle ORM | Database |
| Neon PostgreSQL | Database Hosting |
| NextAuth.js | Authentication |
| Vercel AI SDK | AI Tool Calling |
| Groq API | LLM Provider |

## 📸 Screenshots

### Desktop View
<img width="1440" height="783" alt="Screenshot 2026-02-06 at 10 46 03 PM" src="https://github.com/user-attachments/assets/c31b4640-97b1-4d5d-b06e-8dce2ab0b6cb" />


### Mobile View
![WhatsApp Image 2026-02-06 at 22 47 48](https://github.com/user-attachments/assets/4d0c6791-9865-48b0-be6e-ab1975ca2a51)


## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (Neon recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TusharMinche/AI-Powered-Assistant-with-Tool-Calling.git
   cd ai-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your `.env.local`** (see Environment Variables section below)

5. **Push database schema**
   ```bash
   npx drizzle-kit push
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open** [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Authentication
AUTH_SECRET="your-random-secret-key"  # Generate with: openssl rand -base64 32
AUTH_TRUST_HOST=true

# Google OAuth
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# GitHub OAuth
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# API Keys
GROQ_API_KEY="your-groq-api-key"
OPENWEATHERMAP_API_KEY="your-openweathermap-api-key"
ALPHA_VANTAGE_API_KEY="your-alpha-vantage-api-key"
```

### Getting API Keys

| Service | Link |
|---------|------|
| Neon Database | [neon.tech](https://neon.tech) |
| Groq API | [console.groq.com](https://console.groq.com) |
| OpenWeatherMap | [openweathermap.org/api](https://openweathermap.org/api) |
| Alpha Vantage | [alphavantage.co](https://www.alphavantage.co/support/#api-key) |
| Google OAuth | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| GitHub OAuth | [GitHub Developer Settings](https://github.com/settings/developers) |

## 🌐 Deployment (Vercel)

1. Push your code to GitHub

2. Import project on [Vercel](https://vercel.com)

3. Add all environment variables in Vercel dashboard

4. **Update OAuth callback URLs**:
   - Google: `https://your-app.vercel.app/api/auth/callback/google`
   - GitHub: `https://your-app.vercel.app/api/auth/callback/github`

5. Deploy!

## 📁 Project Structure

```
ai-assistant/
├── src/
│   ├── app/
│   │   ├── (protected)/chat/    # Chat pages (auth required)
│   │   ├── api/                 # API routes
│   │   └── login/               # Login page
│   ├── components/
│   │   ├── chat/                # Chat components
│   │   ├── auth/                # Auth components
│   │   └── ui/                  # Shadcn UI components
│   ├── db/                      # Database schema
│   └── lib/                     # Utilities & AI tools
├── drizzle.config.ts            # Drizzle configuration
└── package.json
```

## 💬 Usage Examples

**Weather:**
> "What's the weather in Tokyo?"

**Stocks:**
> "Check the stock price of AAPL"

**F1:**
> "When is the next F1 race?"

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx drizzle-kit push` | Push schema to database |
| `npx drizzle-kit studio` | Open Drizzle Studio |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project!

---

Made with ❤️ by [Tushar Minche](https://github.com/TusharMinche)
