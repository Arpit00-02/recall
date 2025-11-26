# Quick Start - Hackathon Edition

## 🚀 Get Running in 5 Minutes

### Step 1: Install
```bash
npm install
```

### Step 2: Vercel Blob (30 seconds)
```bash
npx vercel link
npx vercel env add VERCEL_BLOB_STORE_ID
```

### Step 3: Supabase Setup
1. Create project at [supabase.com](https://supabase.com)
2. SQL Editor → Paste `supabase/schema.sql` → Run
3. Settings → API → Copy URL + anon key

### Step 4: Groq API Key
1. [console.groq.com](https://console.groq.com) → Get API key

### Step 5: `.env.local`
```env
GROQ_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

### Step 6: Run
```bash
npm run dev
```

## ✅ What's Already Built

- ✅ Next.js 14 + TypeScript + Tailwind + shadcn/ui
- ✅ Dark mode UI with sidebar layout
- ✅ Drag & drop file upload
- ✅ Vercel Blob integration
- ✅ Groq Whisper transcription pipeline
- ✅ LLM analysis (summary, action items, topics)
- ✅ Meeting detail page with transcript
- ✅ Editable action items with checkboxes
- ✅ Topics timeline (clickable)
- ✅ "Ask anything" chat (streaming)
- ✅ Global search across all meetings
- ✅ Progress states with polling
- ✅ Error handling + toast notifications

## 🎯 Demo Flow

1. **Upload** → Drag & drop a meeting recording
2. **Wait** → See progress: "Uploading…" → "Transcribing…" → "Analyzing…"
3. **View** → Auto-redirects to meeting page
4. **Explore** → Transcript, summary, action items, topics
5. **Chat** → Ask "What were the main decisions?"
6. **Search** → Use sidebar to find meetings

## 🐛 Common Issues

**"Missing API key"** → Check `.env.local` exists and has all 3 vars

**Upload fails** → Run `npx vercel link` again

**Transcription fails** → Check Groq API key is valid + has credits

**Database error** → Make sure you ran the SQL schema in Supabase

## 📝 The Killer Prompt

Already implemented in `app/api/process/route.ts` - it's the exact prompt that wins hackathons:

```text
You are an expert meeting assistant for a US tech company.

Transcript with speaker labels:

{transcript}

Return ONLY a valid JSON object (no markdown) with this exact structure:
{
  "title": "Short catchy title for this meeting",
  "summary": "3-6 sentence summary",
  "action_items": [
    {"text": "Do the thing", "assignee": "Nathan" or null if unclear}
  ],
  "topics": [
    {"title": "Sprint Planning", "start_seconds": 120},
    {"title": "Blockers", "start_seconds": 850}
  ]
}
```

## 🎨 Customization

- **Colors**: Edit `app/globals.css` CSS variables
- **Components**: All in `components/ui/` (shadcn)
- **Styling**: Tailwind classes everywhere

## 🚢 Deploy

```bash
vercel
```

That's it! The app is production-ready.

## 📊 What Judges See

- ⚡ Fast upload + processing
- 🎨 Beautiful dark mode UI
- 🤖 AI that actually works
- 💬 Interactive chat
- 🔍 Global search
- ✅ Editable action items
- 📱 Responsive (desktop-first)

**You're ready to win! 🏆**

