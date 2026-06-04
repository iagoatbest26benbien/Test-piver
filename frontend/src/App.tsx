import { useCallback, useEffect, useMemo, useState } from "react";
import { createEvent, getUserSummary, listEvents } from "./api";
import type { AppEvent, NewEvent, UserSummary } from "./types";
import Header from "./components/Header";
import MetricBar from "./components/MetricBar";
import EventForm from "./components/EventForm";
import SummaryPanel from "./components/SummaryPanel";
import EventList, { type ListFilters } from "./components/EventList";

const DEFAULT_USER = "u1";

export default function App() {
  const [selectedUser, setSelectedUser] = useState(DEFAULT_USER);

  const [events, setEvents] = useState<AppEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListFilters>({ user_id: "", type: "" });

  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const data = await listEvents({
        user_id: filters.user_id.trim() || undefined,
        type: filters.type || undefined,
      });
      setEvents(data);
    } catch (err) {
      setEventsError(
        err instanceof Error
          ? `Impossible de charger les événements (${err.message}). L'API est-elle démarrée ?`
          : "Impossible de charger les événements.",
      );
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, [filters]);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      setSummary(await getUserSummary(selectedUser));
    } catch {
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, [selectedUser]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const handleCreate = useCallback(
    async (event: NewEvent) => {
      await createEvent(event);
      await Promise.all([loadEvents(), loadSummary()]);
    },
    [loadEvents, loadSummary],
  );

  // Utilisateurs proposés dans le sélecteur : la sélection courante + tous ceux vus dans la liste.
  const users = useMemo(() => {
    const set = new Set<string>([selectedUser]);
    for (const ev of events) set.add(ev.user_id);
    return [...set].sort();
  }, [events, selectedUser]);

  return (
    <div className="shell">
      <Header />

      <div className="page-title">
        <h1>Activité des événements</h1>
        <p>Suivi des événements utilisateurs — login, transactions et rapports.</p>
      </div>

      <MetricBar summary={summary} />

      <div className="grid">
        <div>
          <EventForm defaultUserId={selectedUser} onCreate={handleCreate} />
        </div>
        <div>
          <SummaryPanel
            summary={summary}
            loading={summaryLoading}
            users={users}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
          />
          <EventList
            events={events}
            loading={eventsLoading}
            error={eventsError}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      </div>
    </div>
  );
}
