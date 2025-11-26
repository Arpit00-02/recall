import Groq from 'groq-sdk';

// Use placeholder during build, validate at runtime
const groqApiKey = process.env.GROQ_API_KEY || 'placeholder-key';

export const groq = new Groq({
  apiKey: groqApiKey,
});

// Runtime validation (only in API routes)
export function validateGroqConfig() {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('placeholder')) {
    throw new Error('Missing GROQ_API_KEY. Please add it to your .env.local file.');
  }
}

