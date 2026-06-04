import type { AppEvent, EventType, NewEvent, UserSummary } from "./types";

// Injectée au build par Vite. Le navigateur tourne sur l'hôte : il doit donc
// joindre l'API via le port mappé, pas le hostname Docker interne.
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`);
  }
  return res.json() as Promise<T>;
}

export interface EventFilters {
  user_id?: string;
  type?: EventType;
  limit?: number;
  offset?: number;
}

export function listEvents(filters: EventFilters = {}): Promise<AppEvent[]> {
  const params = new URLSearchParams();
  if (filters.user_id) params.set("user_id", filters.user_id);
  if (filters.type) params.set("type", filters.type);
  if (filters.limit != null) params.set("limit", String(filters.limit));
  if (filters.offset != null) params.set("offset", String(filters.offset));
  const qs = params.toString();
  return request<AppEvent[]>(`/events${qs ? `?${qs}` : ""}`);
}

export function createEvent(event: NewEvent): Promise<AppEvent> {
  return request<AppEvent>("/events", {
    method: "POST",
    body: JSON.stringify(event),
  });
}

export function getUserSummary(userId: string): Promise<UserSummary> {
  return request<UserSummary>(`/users/${encodeURIComponent(userId)}/summary`);
}
