export const EVENT_TYPES = ["login", "transaction", "report"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface AppEvent {
  id: number;
  user_id: string;
  type: EventType;
  created_at: string;
  payload: Record<string, unknown> | null;
}

export interface UserSummary {
  user_id: string;
  total: number;
  by_type: Partial<Record<EventType, number>>;
  first_event_at: string | null;
  last_event_at: string | null;
}

export interface NewEvent {
  user_id: string;
  type: EventType;
  payload?: Record<string, unknown> | null;
}
