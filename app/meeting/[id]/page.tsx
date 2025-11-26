import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MeetingDetail from '@/components/meeting-detail';
import type { Meeting, Chunk } from '@/types/database';

// Disable static generation
export const dynamic = 'force-dynamic';

async function getMeeting(id: string): Promise<Meeting | null> {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getChunks(meetingId: string): Promise<Chunk[]> {
  const { data, error } = await supabase
    .from('chunks')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('start_seconds', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
}

export default async function MeetingPage({
  params,
}: {
  params: { id: string };
}) {
  const meeting = await getMeeting(params.id);
  const chunks = await getChunks(params.id);

  if (!meeting) {
    notFound();
  }

  return <MeetingDetail meeting={meeting} chunks={chunks} />;
}

