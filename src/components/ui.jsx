export function PageHeader({ title, description, action }) {
  return (
    <div className="page-header">
      <div>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ value }) {
  const status = value || 'unknown';
  return <span className={`badge badge-${status}`}>{status.replaceAll('_', ' ')}</span>;
}

export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      {description && <p>{description}</p>}
    </div>
  );
}

export function ErrorMessage({ error }) {
  if (!error) return null;
  return <div className="error-message">{error}</div>;
}

export function Loading() {
  return <div className="loading">Loading...</div>;
}
