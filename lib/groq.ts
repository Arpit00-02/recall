import Groq from 'groq-sdk';

const groqApiKey = process.env.GROQ_API_KEY || 'placeholder-key';

export const groq = new Groq({
  apiKey: groqApiKey,
});

export function validateGroqConfig() {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('placeholder')) {
    throw new Error('Missing GROQ_API_KEY. Please add it to your .env.local file.');
  }
}

