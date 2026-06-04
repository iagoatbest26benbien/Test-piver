import { EVENT_TYPES, type EventType, type UserSummary } from "../types";
import { formatDate, formatDateTime } from "../format";

const BAR_COLORS: Record<EventType, string> = {
  login: "var(--green)",
  transaction: "var(--cyan)",
  report: "var(--amber)",
};

interface SummaryPanelProps {
  summary: UserSummary | null;
  loading: boolean;
  users: string[];
  selectedUser: string;
  onSelectUser: (user: string) => void;
}

export default function SummaryPanel({
  summary,
  loading,
  users,
  selectedUser,
  onSelectUser,
}: SummaryPanelProps) {
  const initials = selectedUser.slice(0, 2).toUpperCase();

  return (
    <div className="card">
      {/* L'utilisateur du résumé se choisit ici, directement dans la carte. */}
      <div className="list-head">
        <div className="eyebrow" style={{ marginBottom: 0 }}>
          Résumé
        </div>
        <label className="userpick">
          <span className="avatar">{initials}</span>
          <select
            value={selectedUser}
            onChange={(e) => onSelectUser(e.target.value)}
            aria-label="Utilisateur du résumé"
          >
            {users.map((u) => (
              <option key={u} value={u}>
                user {u}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading || !summary ? (
        <div className="state">{loading ? "Chargement du résumé…" : "Aucun résumé."}</div>
      ) : summary.total === 0 ? (
        <div className="empty">
          <div className="icn">∅</div>
          <h4>Aucune activité pour user {summary.user_id}</h4>
          <p>
            L'absence d'événement est une réponse valide — <code>total: 0</code>, pas d'erreur 404.
          </p>
        </div>
      ) : (
        <>
          <div className="summary-head">
            <div className="summary-total">
              <span className="big">{summary.total.toLocaleString("fr-FR")}</span>
              <span className="unit">événements au total</span>
            </div>
            <div className="summary-dates">
              <div>
                premier&nbsp;: <b>{formatDate(summary.first_event_at)}</b>
              </div>
              <div>
                dernier&nbsp;: <b>{formatDateTime(summary.last_event_at)}</b>
              </div>
            </div>
          </div>

          {EVENT_TYPES.map((t) => {
            const count = summary.by_type[t] ?? 0;
            const width = summary.total > 0 ? (count / summary.total) * 100 : 0;
            return (
              <div className="bar-row" key={t}>
                <div className="bar-meta">
                  <span className="name">
                    <span className="swatch" style={{ background: BAR_COLORS[t] }} />
                    {t}
                  </span>
                  <span className="val">{count.toLocaleString("fr-FR")}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${width}%`, background: BAR_COLORS[t] }} />
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
