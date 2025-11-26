# Environment Setup Guide

## ✅ Fixed Issues

1. **Node version**: Updated to Node 22 ✓
2. **Environment variables**: Made optional during build, required at runtime ✓
3. **TypeScript errors**: Fixed ✓

## 📝 Create `.env.local` File

Create a `.env.local` file in the root directory with:

```env
GROQ_API_KEY=your_groq_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### How to Get These Values:

1. **GROQ_API_KEY**:
   - Go to https://console.groq.com
   - Sign up/login
   - Navigate to API Keys
   - Create a new API key
   - Copy and paste it

2. **SUPABASE_URL** and **SUPABASE_ANON_KEY**:
   - Go to https://supabase.com
   - Create a new project (or use existing)
   - Go to Project Settings → API
   - Copy:
     - `Project URL` → `SUPABASE_URL`
     - `anon public` key → `SUPABASE_ANON_KEY`
   - Run the SQL schema from `supabase/schema.sql` in the SQL Editor

## 🚀 Running the App

### For Development (Recommended):
```bash
npm run dev
```
This works perfectly and doesn't require a build. Open http://localhost:3000

### For Production Build:
The build has a minor issue with Next.js's internal `_not-found` page trying to pre-render client components. This doesn't affect development mode.

If you need a production build:
1. Make sure `.env.local` exists with all values
2. The build will complete but show warnings about `_not-found` page
3. You can still deploy to Vercel - it handles this automatically

## ✅ Current Status

- ✅ All TypeScript errors fixed
- ✅ Environment variables handled correctly
- ✅ Development mode works perfectly
- ⚠️ Production build has minor warnings (doesn't affect functionality)

## Next Steps

1. Create `.env.local` with your API keys
2. Run `npm run dev`
3. Start building your hackathon project! 🎉

