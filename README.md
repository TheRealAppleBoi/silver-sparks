# Silver Sparks ✨

A modern take on Omegle, but exclusively for verified seniors (65+). Connect safely with fellow seniors through spontaneous video chats in a warm, welcoming environment.

## Features

- **Age Verification**: AI-powered verification using OpenAI's Whisper and GPT-4
- **Safe Environment**: Only verified seniors 65+ can join
- **No Pressure**: Leave anytime, no strings attached
- **Senior-Friendly UI**: Large fonts, high contrast, intuitive design
- **Real-time Matching**: Instant peer-to-peer video connections
- **Privacy First**: No chat history, no personal data stored

## Tech Stack

- **Frontend**: Next.js 14 with React, TypeScript
- **Styling**: Tailwind CSS with custom senior-friendly design
- **Database**: SQLite with Prisma ORM
- **AI**: OpenAI API (Whisper + GPT-4)
- **Real-time**: Socket.io for matching and signaling
- **Video**: WebRTC with SimplePeer for P2P connections

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create `.env.local` with:
   ```
   DATABASE_URL="file:./dev.db"
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Verification**: Users verify their age with a voice message or text about their life experience
2. **Matching**: Verified users join a queue and are matched with another senior
3. **Video Chat**: Start a peer-to-peer video call with your match
4. **End Anytime**: Leave the call whenever you want, no questions asked

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── verify/        # Age verification endpoint
│   │   └── socket/        # Socket.io setup (placeholder)
│   ├── call/[peerId]/     # Video call page
│   ├── queue/             # Queue/waiting page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── VerificationModal.tsx
│   ├── VideoCall.tsx
│   └── QueueSpinner.tsx
├── hooks/                 # Custom React hooks
│   ├── useLocalStream.ts
│   ├── useSocket.ts
│   └── useVerification.ts
└── lib/                   # Utilities and configurations
    ├── openai.ts
    ├── prisma.ts
    └── utils.ts
```

## API Endpoints

- `POST /api/verify` - Age verification using OpenAI
- `GET /api/socket` - Socket.io connection for real-time matching

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`: Will be automatically set by Vercel
   - `OPENAI_API_KEY`: Your OpenAI API key
4. Deploy!

### Environment Variables

- `DATABASE_URL`: Database connection string (auto-set by Vercel)
- `OPENAI_API_KEY`: Your OpenAI API key for age verification

## Design Philosophy

Silver Sparks is designed specifically for seniors with:

- **Large, readable fonts** (minimum 18px)
- **High contrast colors** (WCAG AA compliant)
- **Warm, soothing color palette** (soft blues, greens, creams)
- **Intuitive navigation** with clear button labels
- **Gentle animations** and loading states
- **Mobile-responsive** but optimized for desktop/tablet use

## Safety Features

- AI-powered age verification ensures only seniors 65+ can join
- No personal information is collected or stored
- Verification tokens expire in 10 minutes
- All video calls are peer-to-peer and private
- Users can leave anytime with no questions asked

## Contributing

This is a hackathon project built with love for the senior community. Feel free to fork and improve!

## License

MIT License - Built with ❤️ for Hackathon

---

**Made with ❤️ for seniors, by developers who care about connection and community.**
