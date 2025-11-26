import { NextRequest, NextResponse } from 'next/server';
import { groq, validateGroqConfig } from '@/lib/groq';
import { createServerClient, validateSupabaseConfig } from '@/lib/supabase';
import { del } from '@vercel/blob';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

const KILLER_PROMPT = `You are an expert meeting assistant for a US tech company.

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
}`;

function formatTranscript(segments: any[]): string {
  return segments
    .map((seg) => {
      const speakerNum = seg.speaker || 0;
      const speakerName = `Colleague ${speakerNum + 1}`;
      return `${speakerName}: ${seg.text}`;
    })
    .join('\n\n');
}

export async function POST(request: NextRequest) {
  let blobUrl: string | null = null;
  
  try {
    // Validate environment variables at runtime
    validateGroqConfig();
    validateSupabaseConfig();

    // Create a fresh Supabase client for this request
    const supabase = createServerClient();

    const body = await request.json();
    const { url, filename } = body;
    blobUrl = url;

    if (!url) {
      return NextResponse.json({ error: 'No file URL provided' }, { status: 400 });
    }

    // Step 1: Fetch the file from blob URL
    const fileResponse = await fetch(url);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file from blob: ${fileResponse.status} ${fileResponse.statusText}`);
    }
    const fileBlob = await fileResponse.blob();
    const file = new File([fileBlob], filename || 'audio.mp4', { type: fileBlob.type });

    // Step 2: Transcribe with Groq Whisper
    let transcriptionResponse;
    try {
      transcriptionResponse = await groq.audio.transcriptions.create({
        file: file,
        model: 'whisper-large-v3-turbo',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment'],
      });
    } catch (transcribeError: any) {
      console.error('Transcription error:', transcribeError);
      throw new Error(`Transcription failed: ${transcribeError?.message || 'Unknown error'}`);
    }

    const transcription = transcriptionResponse as any;
    const segments = transcription.segments || [];
    const duration = transcription.duration || 0;

    if (!segments.length) {
      throw new Error('No segments returned from transcription');
    }

    // Step 3: Format transcript with speaker labels
    const rawTranscript = formatTranscript(segments);

    // Step 4: Save chunks to database
    const { data: meetingData, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        title: filename || 'Untitled Meeting',
        duration_seconds: Math.round(duration),
        raw_transcript: rawTranscript,
        summary: null,
        action_items: [],
        topics: [],
      })
      .select()
      .single();

    if (meetingError || !meetingData) {
      throw new Error(`Failed to create meeting: ${meetingError?.message || 'No data returned'}`);
    }

    // Save chunks
    const chunks = segments.map((seg: any) => ({
      meeting_id: meetingData.id,
      speaker: `Colleague ${(seg.speaker || 0) + 1}`,
      text: seg.text,
      start_seconds: seg.start,
      end_seconds: seg.end,
    }));

    const { error: chunksError } = await supabase
      .from('chunks')
      .insert(chunks);

    if (chunksError) {
      // Continue anyway - meeting is created
    }

    // Step 5: Call LLM for summary, action items, topics
    console.log('Calling LLM for analysis...');
    const prompt = KILLER_PROMPT.replace('{transcript}', rawTranscript);

    // Step 5: Call LLM for summary, action items, topics
    const models = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'mixtral-8x7b-32768'];
    let completion;
    let lastError: any = null;
    
    for (const model of models) {
      try {
        completion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that returns only valid JSON, no markdown formatting.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          model: model,
          temperature: 0.3,
          response_format: { type: 'json_object' },
        });
        break;
      } catch (modelError: any) {
        lastError = modelError;
      }
    }
    
    if (!completion) {
      throw new Error(`LLM analysis failed: ${lastError?.message || 'Unknown error'}`);
    }

    const llmResponse = completion.choices[0]?.message?.content;
    if (!llmResponse) {
      throw new Error('No response from LLM');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(llmResponse);
    } catch (e) {
      throw new Error('Invalid JSON from LLM');
    }

    // Step 6: Update meeting with LLM results
    await supabase
      .from('meetings')
      .update({
        title: parsedResponse.title || filename || 'Untitled Meeting',
        summary: parsedResponse.summary || '',
        action_items: (parsedResponse.action_items || []).map((item: any) => ({
          text: item.text,
          assignee: item.assignee || null,
          done: false,
        })),
        topics: parsedResponse.topics || [],
      })
      .eq('id', meetingData.id);

    // Step 7: Delete the blob file
    try {
      const blobPath = new URL(blobUrl).pathname;
      await del(blobPath);
    } catch (deleteError) {
      // Continue anyway - file will expire eventually
    }

    return NextResponse.json({
      meetingId: meetingData.id,
      status: 'complete',
    });
  } catch (error: any) {
    // Try to delete blob on error
    if (blobUrl) {
      try {
        const blobPath = new URL(blobUrl).pathname;
        await del(blobPath);
      } catch (deleteError) {
        // Ignore deletion errors
      }
    }

    return NextResponse.json(
      { error: error?.message || 'Something went wrong. Try uploading again.' },
      { status: 500 }
    );
  }
}

