import { Suspense } from 'react';
import Sidebar from '@/components/sidebar';
import UploadArea from '@/components/upload-area';
import MeetingList from '@/components/meeting-list';

// Disable static generation for pages with client components
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Recall</h1>
            <p className="text-muted-foreground">
              Upload a meeting recording and get instant transcripts, summaries, and insights
            </p>
          </div>
          <UploadArea />
          <Suspense fallback={<div className="text-muted-foreground">Loading meetings...</div>}>
            <MeetingList />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

