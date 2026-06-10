import { useCallback, useEffect, useState } from 'react';
import { api, dataOf } from '../api/client.js';
import {
  EmptyState,
  ErrorMessage,
  Loading,
  PageHeader,
  Pagination,
  StatusBadge,
} from '../components/ui.jsx';
import { formatValue } from '../utils/format.js';

const STATUSES = ['pending', 'resolved', 'dismissed', 'all'];
const PAGE_SIZE = 10;

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setReports(dataOf(await api.get('/admin/reports', { params: { status } })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const updateReport = async (report, action, suspendUser = false) => {
    setBusyId(report.id);
    setError('');
    try {
      await api.put(`/admin/reports/${report.id}/${action}`, suspendUser ? { suspend_user: true } : {});
      await fetchReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE));
  const pagedReports = reports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="page-section">
      <PageHeader
        title="Reports"
        description="Review user complaints and take action on flagged profiles."
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontWeight: 600, fontSize: 13 }}>
              Status
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                style={{ width: 'auto', minWidth: 150 }}
              >
                {STATUSES.map((opt) => (
                  <option key={opt} value={opt}>{formatValue(opt)}</option>
                ))}
              </select>
            </label>
          </div>
        }
      />

      <ErrorMessage error={error} />

      {loading ? (
        <Loading />
      ) : reports.length === 0 ? (
        <EmptyState
          title="No reports found"
          description="Reports matching this status filter will appear here."
        />
      ) : (
        <div className="table-wrap">
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ fontSize: 14 }}>Reported Profiles</strong>
              <span style={{ fontSize: 12.5, color: 'var(--text-3)', marginLeft: 8 }}>{reports.length} result{reports.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Reported User</th>
                <th>Reporter</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedReports.map((report) => (
                <tr key={report.id}>
                  <td style={{ fontWeight: 600 }}>
                    {report.reported?.name || `Profile ${report.reported_id}`}
                  </td>
                  <td style={{ color: 'var(--text-2)' }}>
                    {report.reporter?.name || `Profile ${report.reporter_id}`}
                  </td>
                  <td style={{ color: 'var(--text-2)' }}>{formatValue(report.reason)}</td>
                  <td><StatusBadge value={report.status} /></td>
                  <td className="description-cell" style={{ color: 'var(--text-2)', fontSize: 13 }}>
                    {formatValue(report.description)}
                  </td>
                  <td>
                    <div className="row-actions">
                      {report.status === 'pending' && (
                        <>
                          <button
                            className="small-button primary-button"
                            disabled={busyId === report.id}
                            onClick={() => updateReport(report, 'resolve')}
                          >
                            Resolve
                          </button>
                          <button
                            className="small-button danger-button"
                            disabled={busyId === report.id}
                            onClick={() => updateReport(report, 'resolve', true)}
                          >
                            Suspend User
                          </button>
                          <button
                            className="small-button ghost-button"
                            disabled={busyId === report.id}
                            onClick={() => updateReport(report, 'dismiss')}
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={reports.length}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </section>
  );
}
