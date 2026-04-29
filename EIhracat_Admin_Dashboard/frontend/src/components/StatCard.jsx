export default function StatCard({ label, value }) {
  return (
    <div className="stat-card soft-panel">
      <div className="stat-dot" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
