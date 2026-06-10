import { useEffect, useState } from 'react';

export function PageHeader({ title, description, action }) {
  return (
    <header className="page-header">
      <div className="page-header-copy">
        <h2 className="page-header-title">{title}</h2>
        {description && <p className="page-header-desc">{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </header>
  );
}

export function StatusBadge({ value }) {
  const status = value || 'unknown';
  return (
    <span className={`badge badge-${status}`} role="status">
      {status.replaceAll('_', ' ')}
    </span>
  );
}

export function EmptyState({ title, description, icon }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-state-icon" aria-hidden="true">
        {icon || (
          <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
            <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <h4>{title}</h4>
      {description && <p>{description}</p>}
    </div>
  );
}

export function ErrorMessage({ error }) {
  if (!error) return null;
  return (
    <div className="error-message" role="alert">
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style={{ flexShrink: 0, marginTop: 1 }}>
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {error}
    </div>
  );
}

export function SuccessMessage({ message }) {
  if (!message) return null;
  return (
    <div className="success-message" role="status" aria-live="polite">
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style={{ flexShrink: 0, marginTop: 1 }}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l3-3z" clipRule="evenodd" />
      </svg>
      {message}
    </div>
  );
}

export function Loading() {
  return (
    <div className="loading-state" aria-live="polite" aria-busy="true">
      <div className="loading-spin" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line-short" />
      <div className="skeleton skeleton-line-wide" />
      <div className="skeleton skeleton-block" style={{ marginTop: 8 }} />
    </div>
  );
}

export function Section({ title, description, action, children }) {
  return (
    <section className="section">
      {(title || action) && (
        <div className="section-heading">
          <div>
            {title && <h4>{title}</h4>}
            {description && <p>{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="section-body">{children}</div>
    </section>
  );
}

export function Panel({ title, description, children }) {
  return (
    <section className="panel">
      {(title || description) && (
        <div className="section-heading">
          <div>
            {title && <h4>{title}</h4>}
            {description && <p>{description}</p>}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, colorClass = 'blue', icon }) {
  return (
    <article className="stat-card">
      <div className="stat-card-header">
        {icon && <div className={`stat-card-icon ${colorClass}`}>{icon}</div>}
      </div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value ?? 0}</div>
    </article>
  );
}

export function FilterBar({ children }) {
  return (
    <form className="toolbar filter-toolbar" onSubmit={(e) => e.preventDefault()}>
      {children}
    </form>
  );
}

export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="pagination-wrap">
      <span className="pagination-meta">
        Showing {start}–{end} of {totalItems} results
      </span>
      <div className="pagination">
        <button type="button" onClick={() => onPageChange(1)} disabled={page === 1} aria-label="First page">«</button>
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page">‹</button>
        <span className="pagination-current">{page} / {totalPages}</span>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Next page">›</button>
        <button type="button" onClick={() => onPageChange(totalPages)} disabled={page === totalPages} aria-label="Last page">»</button>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <dialog className="modal-sheet" open onClick={(e) => e.stopPropagation()}>
        <h4>{title}</h4>
        {description && <p>{description}</p>}
        <div className="modal-footer">
          <button type="button" className="ghost-button" onClick={onCancel}>{cancelLabel}</button>
          <button
            type="button"
            className={tone === 'danger' ? 'danger-button' : 'primary-button'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </div>
  );
}

export function PromptDialog({
  open,
  title,
  description,
  defaultValue = '',
  multiline = true,
  confirmLabel = 'Submit',
  cancelLabel = 'Cancel',
  allowEmpty = true,
  onSubmit,
  onCancel,
}) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue, open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <dialog className="modal-sheet" open onClick={(e) => e.stopPropagation()}>
        <h4>{title}</h4>
        {description && <p>{description}</p>}
        <div className="modal-field">
          {multiline ? (
            <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={5} />
          ) : (
            <input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="ghost-button" onClick={onCancel}>{cancelLabel}</button>
          <button
            type="button"
            className="primary-button"
            onClick={() => onSubmit(value)}
            disabled={allowEmpty ? false : value.trim().length === 0}
          >
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </div>
  );
}

export function DataCellHint({ children }) {
  return <p className="muted" style={{ fontSize: 12 }}>{children}</p>;
}
