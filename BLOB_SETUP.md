# Vercel Blob Setup

## The Issue

The upload API requires Vercel Blob to be configured. If you're getting upload errors, you need to set up Vercel Blob.

## Quick Fix

Run these commands in your terminal:

```bash
# Link to your Vercel project (or create one)
npx vercel link

# Add the blob store environment variable
npx vercel env add VERCEL_BLOB_STORE_ID
```

When prompted:
- Select "Development" (or "Production" if deploying)
- It will automatically create a blob store and add the ID

## Alternative: Use Local Development

If you don't want to use Vercel Blob for local development, you can:

1. **Use a different storage solution** (like local file system for testing)
2. **Mock the upload** for development

## Verify Setup

After running the commands, check that `.env.local` has:
```
VERCEL_BLOB_STORE_ID=your_blob_store_id
```

## Still Having Issues?

1. Make sure you're logged into Vercel: `npx vercel login`
2. Make sure you have a Vercel project: `npx vercel link`
3. Check the error message in the browser console for more details

