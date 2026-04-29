export default function GlassCard({ title, subtitle, action, children }) {
  return (
    <section className="glass-card soft-panel">
      {(title || subtitle || action) && (
        <div className="card-header">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
