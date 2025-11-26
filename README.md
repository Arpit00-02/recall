# Recall - AI Meeting Assistant

Transcribe, summarize, and search your meetings with AI. Built for a 2-day hackathon.

## Features

- 🎤 Upload meeting recordings (Zoom, Google Meet, Riverside, etc.)
- 📝 Automatic transcription with speaker diarization
- 🤖 AI-powered summaries, action items, and topics
- 🔍 Global search across all meetings
- 💬 Ask anything about your meetings with AI chat

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Storage**: Vercel Blob (file uploads)
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq (Whisper for transcription, Llama-3-70b for analysis)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Vercel Blob

```bash
npx vercel link
npx vercel env add VERCEL_BLOB_STORE_ID
```

### 3. Set Up Supabase

1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql` in the Supabase SQL editor
3. Get your Supabase URL and anon key from project settings

### 4. Environment Variables

Create a `.env.local` file:

```env
# Groq API Key
GROQ_API_KEY=your_groq_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your_blob_token
VERCEL_BLOB_STORE_ID=your_blob_store_id
```

### 5. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── upload/          # File upload endpoint
│   │   ├── process/          # Transcription + LLM processing
│   │   └── status/           # Polling endpoint for status
│   ├── meeting/[id]/         # Meeting detail page
│   └── page.tsx              # Homepage
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── sidebar.tsx           # Global sidebar with search
│   ├── upload-area.tsx       # Drag & drop upload
│   └── meeting-detail.tsx    # Meeting page component
├── lib/
│   ├── groq.ts               # Groq client
│   ├── supabase.ts           # Supabase client
│   └── utils.ts              # Utility functions
└── supabase/
    └── schema.sql            # Database schema
```

## Development Notes

- Single-user mode (no authentication)
- Files are deleted from Blob storage after processing
- Polling every 4 seconds for processing status
- Dark mode only
- Desktop-first design

## License

MIT

