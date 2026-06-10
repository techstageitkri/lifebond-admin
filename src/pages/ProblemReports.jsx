import { useCallback, useEffect, useState } from 'react';
import { api, dataOf } from '../api/client.js';
import {
  EmptyState,
  ErrorMessage,
  Loading,
  PageHeader,
  Pagination,
  PromptDialog,
  StatusBadge,
} from '../components/ui.jsx';
import { formatValue } from '../utils/format.js';

const STATUSES = ['pending', 'in_progress', 'resolved', 'dismissed', 'all'];
const CATEGORIES = [
  'all', 'technical_issue', 'account_issue', 'notification_issue',
  'profile_issue', 'payment_issue', 'safety_concern', 'other',
];
const PAGE_SIZE = 10;

export default function ProblemReports() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('pending');
  const [category, setCategory] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [notesReport, setNotesReport] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setReports(dataOf(await api.get('/admin/problem-reports', { params: { status, category } })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, status]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const updateReport = async (report, nextStatus, notes = '') => {
    setBusyId(report.id);
    setError('');
    try {
      await api.put(`/admin/problem-reports/${report.id}`, {
        status: nextStatus,
        admin_notes: notes || report.admin_notes || '',
      });
      await fetchReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const openNotesDialog = (report, nextStatus) => setNotesReport({ ...report, nextStatus });

  const submitNotesDialog = async (notes) => {
    if (!notesReport) return;
    await updateReport(notesReport, notesReport.nextStatus, notes);
    setNotesReport(null);
  };

  const pagedReports = reports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE));

  return (
    <section className="page-section">
      <PageHeader
        title="Problem Reports"
        description="Review and resolve app issues submitted from the mobile Settings screen."
      />

      <div className="filter-card">
        <div className="filter-card-header">
          <span className="filter-card-title">Filters</span>
        </div>
        <div className="toolbar">
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontWeight: 600, fontSize: 13 }}>
            Category
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              style={{ width: 'auto', minWidth: 180 }}
            >
              {CATEGORIES.map((opt) => (
                <option key={opt} value={opt}>{formatValue(opt)}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontWeight: 600, fontSize: 13 }}>
            Status
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              style={{ width: 'auto', minWidth: 160 }}
            >
              {STATUSES.map((opt) => (
                <option key={opt} value={opt}>{formatValue(opt)}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <ErrorMessage error={error} />

      {loading ? (
        <Loading />
      ) : reports.length === 0 ? (
        <EmptyState
          title="No problem reports found"
          description="User-submitted app issues matching these filters will appear here."
        />
      ) : (
        <div className="table-wrap">
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ fontSize: 14 }}>Problem Reports</strong>
              <span style={{ fontSize: 12.5, color: 'var(--text-3)', marginLeft: 8 }}>{reports.length} result{reports.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Description</th>
                <th>Context</th>
                <th>Status</th>
                <th>Admin Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <strong style={{ display: 'block', fontSize: 13 }}>
                      {report.profile?.name || report.user?.mobile_number || `User ${report.user_id}`}
                    </strong>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      {report.user?.mobile_number || '-'}
                    </span>
                  </td>
                  <td><span style={{ fontSize: 13, color: 'var(--text-2)' }}>{formatValue(report.category)}</span></td>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{report.subject}</td>
                  <td className="description-cell" style={{ fontSize: 13, color: 'var(--text-2)' }}>{report.description}</td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
                    <span style={{ display: 'block' }}>{formatValue(report.platform)} {formatValue(report.app_version)}</span>
                    <span style={{ display: 'block' }}>{formatValue(report.screen)}</span>
                    <span>Contact: {formatValue(report.contact_allowed)}</span>
                  </td>
                  <td><StatusBadge value={report.status} /></td>
                  <td className="description-cell" style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
                    {formatValue(report.admin_notes)}
                  </td>
                  <td>
                    <div className="row-actions">
                      {report.status === 'pending' && (
                        <button
                          className="small-button primary-button"
                          disabled={busyId === report.id}
                          onClick={() => openNotesDialog(report, 'in_progress')}
                        >
                          Start
                        </button>
                      )}
                      {report.status !== 'resolved' && (
                        <button
                          className="small-button"
                          disabled={busyId === report.id}
                          onClick={() => openNotesDialog(report, 'resolved')}
                        >
                          Resolve
                        </button>
                      )}
                      {report.status !== 'dismissed' && (
                        <button
                          className="small-button ghost-button"
                          disabled={busyId === report.id}
                          onClick={() => openNotesDialog(report, 'dismissed')}
                        >
                          Dismiss
                        </button>
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

      <PromptDialog
        open={Boolean(notesReport)}
        title="Admin notes"
        description={`Set status to "${notesReport ? formatValue(notesReport.nextStatus) : ''}" with optional notes.`}
        defaultValue={notesReport?.admin_notes || ''}
        onSubmit={submitNotesDialog}
        onCancel={() => setNotesReport(null)}
      />
    </section>
  );
}
