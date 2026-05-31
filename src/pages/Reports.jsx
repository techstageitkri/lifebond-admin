import { useCallback, useEffect, useState } from 'react';
import { api, dataOf } from '../api/client.js';
import { EmptyState, ErrorMessage, Loading, PageHeader, StatusBadge } from '../components/ui.jsx';
import { formatValue } from '../utils/format.js';

const statuses = ['pending', 'resolved', 'dismissed', 'all'];

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

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

  return (
    <section className="page-section">
      <PageHeader
        title="Reports"
        description="Review complaints and take immediate action on unsafe profiles."
        action={
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {statuses.map((option) => (
              <option key={option} value={option}>{formatValue(option)}</option>
            ))}
          </select>
        }
      />
      <ErrorMessage error={error} />
      {loading ? (
        <Loading />
      ) : reports.length === 0 ? (
        <EmptyState title="No reports found" description="Reports matching this status will appear here." />
      ) : (
        <div className="table-wrap">
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
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.reported?.name || `Profile ${report.reported_id}`}</td>
                  <td>{report.reporter?.name || `Profile ${report.reporter_id}`}</td>
                  <td>{formatValue(report.reason)}</td>
                  <td><StatusBadge value={report.status} /></td>
                  <td className="description-cell">{formatValue(report.description)}</td>
                  <td>
                    <div className="row-actions">
                      {report.status === 'pending' && (
                        <>
                          <button disabled={busyId === report.id} onClick={() => updateReport(report, 'resolve')}>Resolve</button>
                          <button disabled={busyId === report.id} onClick={() => updateReport(report, 'resolve', true)}>Suspend User</button>
                          <button disabled={busyId === report.id} className="ghost-button" onClick={() => updateReport(report, 'dismiss')}>Dismiss</button>
                        </>
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
