import { useState } from "react";
import { EVENT_TYPES, type EventType, type NewEvent } from "../types";

interface EventFormProps {
  defaultUserId: string;
  onCreate: (event: NewEvent) => Promise<void>;
}

type Status = { kind: "ok" | "err"; text: string } | null;

export default function EventForm({ defaultUserId, onCreate }: EventFormProps) {
  const [userId, setUserId] = useState(defaultUserId);
  const [type, setType] = useState<EventType>("login");
  const [payloadText, setPayloadText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (!userId.trim()) {
      setStatus({ kind: "err", text: "user_id est requis." });
      return;
    }

    let payload: Record<string, unknown> | null = null;
    if (payloadText.trim()) {
      try {
        payload = JSON.parse(payloadText);
      } catch {
        setStatus({ kind: "err", text: "Payload : JSON invalide." });
        return;
      }
    }

    setSubmitting(true);
    try {
      await onCreate({ user_id: userId.trim(), type, payload });
      setStatus({ kind: "ok", text: "Événement créé." });
      setPayloadText("");
    } catch (err) {
      setStatus({ kind: "err", text: err instanceof Error ? err.message : "Échec de la création." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <div className="eyebrow">Nouvel événement</div>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="uid">User ID</label>
          <input
            className="control"
            id="uid"
            placeholder="ex. u1"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Type</label>
          <div className="seg">
            {EVENT_TYPES.map((t) => (
              <span key={t} style={{ display: "contents" }}>
                <input
                  type="radio"
                  name="type"
                  id={`t-${t}`}
                  checked={type === t}
                  onChange={() => setType(t)}
                />
                <label htmlFor={`t-${t}`}>{t}</label>
              </span>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="payload">
            Payload <span className="opt">· optionnel (JSON)</span>
          </label>
          <textarea
            className="control"
            id="payload"
            placeholder={'{ "ip": "10.0.0.4", "device": "mobile" }'}
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
          />
        </div>

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "Création…" : "＋ Créer l'événement"}
        </button>

        {status && <div className={`form-msg ${status.kind}`}>{status.text}</div>}
      </form>
    </div>
  );
}
