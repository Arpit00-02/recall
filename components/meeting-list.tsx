import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { FileText, Clock } from 'lucide-react';
import type { Meeting } from '@/types/database';

export default async function MeetingList() {
  const { data: meetings, error } = await supabase
    .from('meetings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !meetings || meetings.length === 0) {
    return null;
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-2">
      <h2 className="text-lg font-semibold">Recent Meetings</h2>
      <div className="space-y-2">
        {meetings.map((meeting) => (
          <Link
            key={meeting.id}
            href={`/meeting/${meeting.id}`}
            className="block p-4 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">{meeting.title || 'Untitled Meeting'}</h3>
                </div>
                {meeting.summary && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {meeting.summary}
                  </p>
                )}
              </div>
              {meeting.duration_seconds && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground ml-4">
                  <Clock className="h-4 w-4" />
                  {formatDuration(meeting.duration_seconds)}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

