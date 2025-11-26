# Architecture Overview

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **File Storage**: Vercel Blob
- **Database**: Supabase (PostgreSQL)
- **AI Services**: Groq (Whisper + Llama-3-70b)

## Data Flow

```
1. User uploads file
   ↓
2. POST /api/upload → Vercel Blob
   ↓
3. POST /api/process → 
   a. Fetch file from blob URL
   b. Groq Whisper → transcription with segments
   c. Save chunks to Supabase
   d. Format transcript with speaker labels
   e. Groq Llama-3-70b → JSON (title, summary, action_items, topics)
   f. Update meeting record
   g. Delete blob file
   ↓
4. Client polls GET /api/status/[meetingId] every 4 seconds
   ↓
5. When complete → redirect to /meeting/[id]
```

## API Routes

### `/api/upload`
- Accepts multipart/form-data with file
- Validates file type and size (max 2GB)
- Uploads to Vercel Blob
- Returns blob URL and metadata

### `/api/process`
- Accepts: `{ url, filename }`
- Processes the entire pipeline:
  1. Fetches file from blob URL
  2. Transcribes with Groq Whisper
  3. Saves chunks to database
  4. Calls LLM for analysis
  5. Updates meeting record
  6. Deletes blob file
- Returns: `{ meetingId, status: 'complete' }`

### `/api/status/[meetingId]`
- Returns current processing status
- Status: `'processing'` or `'complete'`
- Includes meeting data when complete

### `/api/chat`
- Accepts: `{ meetingId, question }`
- Gets top 25 chunks from meeting
- Streams response from Groq Llama-3-70b
- Returns streaming text response

## Database Schema

### `meetings` table
- `id` (uuid, primary key)
- `title` (text)
- `duration_seconds` (int)
- `summary` (text)
- `action_items` (jsonb) - `[{text, assignee, done}]`
- `topics` (jsonb) - `[{title, start_seconds}]`
- `raw_transcript` (text)
- `created_at` (timestamp)
- `search_vector` (tsvector) - auto-generated for full-text search

### `chunks` table
- `id` (uuid, primary key)
- `meeting_id` (uuid, foreign key)
- `speaker` (text) - "Colleague 1", "Colleague 2", etc.
- `text` (text)
- `start_seconds` (float)
- `end_seconds` (float)

## Components

### Client Components
- `components/sidebar.tsx` - Global sidebar with search
- `components/upload-area.tsx` - Drag & drop upload with progress
- `components/meeting-detail.tsx` - Meeting page with transcript, summary, action items, chat

### Server Components
- `components/meeting-list.tsx` - Recent meetings list
- `app/page.tsx` - Homepage
- `app/meeting/[id]/page.tsx` - Meeting detail page wrapper

## Key Features

### 1. Upload & Processing
- Drag & drop or file picker
- Real-time progress states:
  - "Uploading…"
  - "Transcribing with AI…"
  - "Analyzing content…"
  - "Ready!"
- Polling every 4 seconds for status

### 2. Meeting Page
- Full transcript with speaker labels
- Auto-generated summary
- Action items with checkboxes (editable)
- Topics timeline (clickable to jump to transcript)
- "Ask anything" chat (streaming responses)

### 3. Global Search
- Full-text search across all meetings
- Searches title, summary, and transcript
- Real-time results in sidebar

## Environment Variables

```env
GROQ_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
VERCEL_BLOB_STORE_ID=auto_set_by_vercel_cli
```

## Deployment Notes

- Vercel Blob requires Vercel deployment or local setup
- Supabase can be self-hosted or cloud
- Groq API has rate limits (check your plan)
- File size limit: 2GB (Vercel Blob free tier)
- Processing timeout: 5 minutes (configurable in route)

## Performance Optimizations

- Files deleted after processing (saves storage)
- Chunks indexed for fast search
- Full-text search uses PostgreSQL GIN index
- Streaming chat responses for better UX
- Polling instead of WebSockets (simpler, good enough)

## Future Enhancements (Day 2+)

- Vector embeddings for semantic search
- Export transcript as PDF/Markdown
- Share meetings via link
- User authentication (currently single-user)
- Live recording via web mic
- Multiple file format support expansion

