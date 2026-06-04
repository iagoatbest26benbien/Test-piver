import type { UserSummary } from "../types";

interface MetricBarProps {
  summary: UserSummary | null;
}

export default function MetricBar({ summary }: MetricBarProps) {
  const total = summary?.total ?? 0;
  const login = summary?.by_type.login ?? 0;
  const transaction = summary?.by_type.transaction ?? 0;
  const report = summary?.by_type.report ?? 0;
  const pct = (n: number) => (total > 0 ? `${Math.round((n / total) * 100)}% du total` : "—");

  return (
    <div className="metrics">
      <div className="metric">
        <div className="label">Total</div>
        <div className="num">{total.toLocaleString("fr-FR")}</div>
        <div className="delta">événements</div>
      </div>
      <div className="metric">
        <div className="label">Login</div>
        <div className="num">{login.toLocaleString("fr-FR")}</div>
        <div className="delta">{pct(login)}</div>
      </div>
      <div className="metric">
        <div className="label">Transaction</div>
        <div className="num">{transaction.toLocaleString("fr-FR")}</div>
        <div className="delta">{pct(transaction)}</div>
      </div>
      <div className="metric">
        <div className="label">Report</div>
        <div className="num">{report.toLocaleString("fr-FR")}</div>
        <div className="delta">{pct(report)}</div>
      </div>
    </div>
  );
}
