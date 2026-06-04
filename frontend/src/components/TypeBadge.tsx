import type { EventType } from "../types";

export default function TypeBadge({ type }: { type: EventType }) {
  return (
    <span className={`pill ${type}`}>
      <span className="pdot" />
      {type}
    </span>
  );
}
