export interface Meeting {
  id: string;
  title: string | null;
  duration_seconds: number | null;
  summary: string | null;
  action_items: ActionItem[];
  topics: Topic[];
  raw_transcript: string;
  created_at: string;
}

export interface ActionItem {
  text: string;
  assignee: string | null;
  done: boolean;
}

export interface Topic {
  title: string;
  start_seconds: number;
}

export interface Chunk {
  id: string;
  meeting_id: string;
  speaker: string;
  text: string;
  start_seconds: number;
  end_seconds: number;
}

