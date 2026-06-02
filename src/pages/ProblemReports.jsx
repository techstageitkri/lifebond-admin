import { useCallback, useEffect, useState } from 'react';
import { api, dataOf } from '../api/client.js';
import { EmptyState, ErrorMessage, Loading, PageHeader, StatusBadge } from '../components/ui.jsx';
import { formatValue } from '../utils/format.js';

const statuses = ['pending', 'in_progress', 'resolved', 'dismissed', 'all'];
const categories = [
  'all',
  'technical_issue',
  'account_issue',
  'notification_issue',
  'profile_issue',
  'payment_issue',
  'safety_concern',
  'other',
];

export default function ProblemReports() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('pending');
  const [category, setCategory] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setReports(dataOf(await api.get('/admin/problem-reports', {
        params: { status, category },
      })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, status]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateReport = async (report, nextStatus) => {
    const adminNotes = window.prompt('Admin notes', report.admin_notes || '');
    if (adminNotes === null) return;

    setBusyId(report.id);
    setError('');
    try {
      await api.put(`/admin/problem-reports/${report.id}`, {
        status: nextStatus,
        admin_notes: adminNotes,
      });
      await fetchReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="page-section">
      <PageHeader
        title="Problem Reports"
        description="Review app issues submitted from the mobile Settings screen."
        action={
          <div className="row-actions">
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((option) => (
                <option key={option} value={option}>{formatValue(option)}</option>
              ))}
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statuses.map((option) => (
                <option key={option} value={option}>{formatValue(option)}</option>
              ))}
            </select>
          </div>
        }
      />
      <ErrorMessage error={error} />
      {loading ? (
        <Loading />
      ) : reports.length === 0 ? (
        <EmptyState title="No problem reports found" description="User-submitted app issues will appear here." />
      ) : (
        <div className="table-wrap">
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
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <strong>{report.profile?.name || report.user?.mobile_number || `User ${report.user_id}`}</strong>
                    <br />
                    <span>{report.user?.mobile_number || '-'}</span>
                  </td>
                  <td>{formatValue(report.category)}</td>
                  <td>{report.subject}</td>
                  <td className="description-cell">{report.description}</td>
                  <td>
                    <div>{formatValue(report.platform)} {formatValue(report.app_version)}</div>
                    <div>{formatValue(report.screen)}</div>
                    <div>Contact: {formatValue(report.contact_allowed)}</div>
                  </td>
                  <td><StatusBadge value={report.status} /></td>
                  <td className="description-cell">{formatValue(report.admin_notes)}</td>
                  <td>
                    <div className="row-actions">
                      {report.status === 'pending' && (
                        <button disabled={busyId === report.id} onClick={() => updateReport(report, 'in_progress')}>Start</button>
                      )}
                      {report.status !== 'resolved' && (
                        <button disabled={busyId === report.id} onClick={() => updateReport(report, 'resolved')}>Resolve</button>
                      )}
                      {report.status !== 'dismissed' && (
                        <button disabled={busyId === report.id} className="ghost-button" onClick={() => updateReport(report, 'dismissed')}>Dismiss</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
