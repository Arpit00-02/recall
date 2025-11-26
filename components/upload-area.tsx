'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

type ProcessingState = 'idle' | 'uploading' | 'transcribing' | 'analyzing' | 'complete';

export default function UploadArea() {
  const [isDragging, setIsDragging] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    // Validate file
    const allowedTypes = ['video/mp4', 'audio/mp4', 'audio/mpeg', 'audio/webm', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please upload a video or audio file (.mp4, .m4a, .webm, .wav, .ogg)',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Maximum file size is 2GB',
      });
      return;
    }

    try {
      // Step 1: Upload
      setProcessingState('uploading');
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      const { url, pathname } = await uploadResponse.json();

      // Step 2: Start processing
      setProcessingState('transcribing');
      const processResponse = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, filename: file.name }),
      });

      if (!processResponse.ok) {
        const error = await processResponse.json();
        throw new Error(error.error || 'Processing failed');
      }

      const { meetingId: id } = await processResponse.json();
      setMeetingId(id);

      // Step 3: Poll for completion
      setProcessingState('analyzing');
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`/api/status/${id}`);
        if (statusResponse.ok) {
          const { status } = await statusResponse.json();
          if (status === 'complete') {
            clearInterval(pollInterval);
            setProcessingState('complete');
            setTimeout(() => {
              router.push(`/meeting/${id}`);
            }, 1000);
          }
        }
      }, 4000); // Poll every 4 seconds

      // Cleanup after 5 minutes
      setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);
    } catch (error: any) {
      setProcessingState('idle');
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: error.message || 'Try uploading again.',
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const getStatusText = () => {
    switch (processingState) {
      case 'uploading':
        return 'Uploading…';
      case 'transcribing':
        return 'Transcribing with AI…';
      case 'analyzing':
        return 'Analyzing content…';
      case 'complete':
        return 'Ready!';
      default:
        return '';
    }
  };

  if (processingState !== 'idle') {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 border border-border rounded-lg bg-card">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <p className="text-lg">{getStatusText()}</p>
          </div>
          {processingState !== 'complete' && (
            <Progress value={processingState === 'uploading' ? 25 : processingState === 'transcribing' ? 50 : 75} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`w-full max-w-2xl mx-auto p-12 border-2 border-dashed rounded-lg transition-colors ${
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <FileVideo className="h-12 w-12 text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold mb-1">Drop your meeting recording</h3>
          <p className="text-sm text-muted-foreground">
            Supports .mp4, .m4a, .webm, .wav, .ogg (max 2GB)
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </label>
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".mp4,.m4a,.webm,.wav,.ogg"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}

