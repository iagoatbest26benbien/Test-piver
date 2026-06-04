import { EVENT_TYPES, type AppEvent, type EventType } from "../types";
import { formatDateTime, formatPayload } from "../format";
import TypeBadge from "./TypeBadge";

export interface ListFilters {
  user_id: string;
  type: "" | EventType;
}

interface EventListProps {
  events: AppEvent[];
  loading: boolean;
  error: string | null;
  filters: ListFilters;
  onFiltersChange: (filters: ListFilters) => void;
}

export default function EventList({ events, loading, error, filters, onFiltersChange }: EventListProps) {
  return (
    <div className="card">
      <div className="list-head">
        <div className="eyebrow" style={{ marginBottom: 0 }}>
          Événements récents
        </div>
        <div className="filters">
          <input
            className="control"
            placeholder="filtrer par user_id…"
            value={filters.user_id}
            onChange={(e) => onFiltersChange({ ...filters, user_id: e.target.value })}
          />
          <select
            className="control"
            value={filters.type}
            onChange={(e) => onFiltersChange({ ...filters, type: e.target.value as ListFilters["type"] })}
          >
            <option value="">type — tous</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="state error">{error}</div>
      ) : loading ? (
        <div className="state">Chargement des événements…</div>
      ) : events.length === 0 ? (
        <div className="state">Aucun événement pour ces filtres.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>User</th>
              <th>Payload</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => {
              const payload = formatPayload(ev.payload);
              return (
                <tr key={ev.id}>
                  <td>
                    <TypeBadge type={ev.type} />
                  </td>
                  <td className="uid">{ev.user_id}</td>
                  <td className="payload">
                    {payload ? <code>{payload}</code> : <span className="none">—</span>}
                  </td>
                  <td className="when">{formatDateTime(ev.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
