import { NextRequest, NextResponse } from 'next/server';
import { groq, validateGroqConfig } from '@/lib/groq';
import { createServerClient, validateSupabaseConfig } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables at runtime
    validateGroqConfig();
    validateSupabaseConfig();

    // Create a fresh Supabase client for this request
    const supabase = createServerClient();

    const { meetingId, question } = await request.json();

    if (!meetingId || !question) {
      return NextResponse.json(
        { error: 'Missing meetingId or question' },
        { status: 400 }
      );
    }

    // Get top 25 chunks by time from beginning
    const { data: chunks, error } = await supabase
      .from('chunks')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('start_seconds', { ascending: true })
      .limit(25);

    if (error || !chunks || chunks.length === 0) {
      return NextResponse.json(
        { error: 'No chunks found for this meeting' },
        { status: 404 }
      );
    }

    const context = chunks
      .map((chunk) => `${chunk.speaker}: ${chunk.text}`)
      .join('\n\n');

    const prompt = `You are a helpful meeting assistant. Answer the question based on this meeting transcript:

${context}

Question: ${question}

Answer:`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful meeting assistant. Answer questions concisely based on the meeting transcript.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.1-8b-instant', // Using reliable Groq model
      temperature: 0.7,
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get response' },
      { status: 500 }
    );
  }
}

