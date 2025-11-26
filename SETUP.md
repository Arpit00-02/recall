# Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Vercel Blob
```bash
npx vercel link          # Link to your Vercel project
npx vercel env add VERCEL_BLOB_STORE_ID   # Creates blob store automatically
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the SQL Editor in your Supabase dashboard
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Run the SQL script
5. Go to Project Settings → API
6. Copy your `Project URL` and `anon public` key

### 4. Get Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key

### 5. Create Environment Variables

Create a `.env.local` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 6. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing the App

1. Upload a meeting recording (any .mp4, .m4a, .webm, .wav, or .ogg file)
2. Wait for processing (30-120 seconds depending on file size)
3. View the transcript, summary, action items, and topics
4. Try the "Ask anything" chat feature
5. Use the sidebar to search across all meetings

## Troubleshooting

### "Missing GROQ_API_KEY" error
- Make sure your `.env.local` file exists and has the correct key

### "Missing SUPABASE_URL" error
- Check that your Supabase credentials are correct in `.env.local`

### Upload fails
- Make sure Vercel Blob is set up correctly
- Check file size (max 2GB)
- Check file format (must be video/audio)

### Transcription fails
- Check your Groq API key is valid
- Make sure you have credits/quota available
- Check the file is a valid audio/video format

### Database errors
- Make sure you ran the SQL schema in Supabase
- Check table names match exactly: `meetings` and `chunks`

## Next Steps

- Customize the UI colors in `app/globals.css`
- Add more features like export, sharing, etc.
- Deploy to Vercel for production

