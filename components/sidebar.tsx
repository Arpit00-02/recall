'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, FileText } from 'lucide-react';
import type { Meeting } from '@/types/database';

export default function Sidebar() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    loadMeetings();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      searchMeetings(searchQuery);
    } else {
      loadMeetings();
    }
  }, [searchQuery]);

  async function loadMeetings() {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setMeetings(data);
    }
  }

  async function searchMeetings(query: string) {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .textSearch('search_vector', query)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setMeetings(data);
    }
  }

  return (
    <aside className="w-64 border-r border-border bg-card p-4 flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">All Meetings</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {meetings.map((meeting) => (
            <Link
              key={meeting.id}
              href={`/meeting/${meeting.id}`}
              className={`flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors ${
                pathname === `/meeting/${meeting.id}` ? 'bg-accent' : ''
              }`}
            >
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm truncate flex-1">
                {meeting.title || 'Untitled Meeting'}
              </span>
            </Link>
          ))}
          {meetings.length === 0 && (
            <p className="text-sm text-muted-foreground p-2">
              No meetings yet
            </p>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

