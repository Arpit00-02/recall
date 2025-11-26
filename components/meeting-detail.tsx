'use client';

import { useState, useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Send, Clock } from 'lucide-react';
import type { Meeting, Chunk, ActionItem, Topic } from '@/types/database';

interface MeetingDetailProps {
  meeting: Meeting;
  chunks: Chunk[];
}

export default function MeetingDetail({ meeting, chunks }: MeetingDetailProps) {
  const [actionItems, setActionItems] = useState<ActionItem[]>(meeting.action_items || []);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const handleActionItemToggle = async (index: number) => {
    const updated = [...actionItems];
    updated[index].done = !updated[index].done;

    setActionItems(updated);

    // Update in database
    await supabase
      .from('meetings')
      .update({ action_items: updated })
      .eq('id', meeting.id);
  };

  const scrollToTopic = (startSeconds: number) => {
    // Find the chunk closest to this timestamp
    const targetChunk = chunks.find(
      (chunk) => chunk.start_seconds <= startSeconds && chunk.end_seconds >= startSeconds
    ) || chunks[0];

    if (targetChunk && transcriptRef.current) {
      const element = document.getElementById(`chunk-${targetChunk.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isChatLoading) return;

    setIsChatLoading(true);
    setChatResponse('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: meeting.id,
          question: chatMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullResponse += chunk;
          setChatResponse(fullResponse);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatResponse('Sorry, something went wrong. Please try again.');
    } finally {
      setIsChatLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border p-6">
          <h1 className="text-2xl font-bold mb-2">{meeting.title || 'Untitled Meeting'}</h1>
          {meeting.duration_seconds && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatTime(meeting.duration_seconds)}
            </div>
          )}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-border flex">
              <button className="px-6 py-3 border-b-2 border-primary font-medium">
                Transcript
              </button>
            </div>

            {/* Transcript */}
            <ScrollArea className="flex-1 p-6">
              <div ref={transcriptRef} className="space-y-4">
                {chunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    id={`chunk-${chunk.id}`}
                    className="space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{chunk.speaker}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(chunk.start_seconds)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{chunk.text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar */}
          <div className="w-96 border-l border-border flex flex-col">
            {/* Summary */}
            {meeting.summary && (
              <div className="border-b border-border p-6">
                <h2 className="font-semibold mb-2">Summary</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {meeting.summary}
                </p>
              </div>
            )}

            {/* Topics */}
            {meeting.topics && meeting.topics.length > 0 && (
              <div className="border-b border-border p-6">
                <h2 className="font-semibold mb-3">Topics</h2>
                <div className="space-y-2">
                  {(meeting.topics as Topic[]).map((topic, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollToTopic(topic.start_seconds)}
                      className="block w-full text-left text-sm p-2 rounded hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span>{topic.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(topic.start_seconds)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items */}
            {actionItems.length > 0 && (
              <div className="border-b border-border p-6 flex-1 overflow-auto">
                <h2 className="font-semibold mb-3">Action Items</h2>
                <div className="space-y-3">
                  {actionItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Checkbox
                        checked={item.done}
                        onCheckedChange={() => handleActionItemToggle(idx)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <p className={`text-sm ${item.done ? 'line-through text-muted-foreground' : ''}`}>
                          {item.text}
                        </p>
                        {item.assignee && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Assigned to: {item.assignee}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat */}
            <div className="border-t border-border p-6 flex flex-col h-64">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4" />
                <h2 className="font-semibold">Ask anything</h2>
              </div>
              <form onSubmit={handleChatSubmit} className="flex-1 flex flex-col">
                <Textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask a question about this meeting..."
                  className="mb-2 flex-1 resize-none"
                  disabled={isChatLoading}
                />
                <Button type="submit" disabled={!chatMessage.trim() || isChatLoading}>
                  <Send className="h-4 w-4 mr-2" />
                  Ask
                </Button>
              </form>
              {chatResponse && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{chatResponse}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

