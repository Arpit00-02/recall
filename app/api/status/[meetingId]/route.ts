import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('id, title, summary, action_items, topics, created_at')
      .eq('id', params.meetingId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Determine status based on whether summary exists
    const status = data.summary ? 'complete' : 'processing';

    return NextResponse.json({
      status,
      meeting: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get status' },
      { status: 500 }
    );
  }
}

