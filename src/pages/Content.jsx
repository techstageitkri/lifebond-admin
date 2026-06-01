import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { api, dataOf } from '../api/client.js';
import { ErrorMessage, PageHeader } from '../components/ui.jsx';

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  [{ font: [] }],
  [{ size: ['small', false, 'large', 'huge'] }],
  ['bold', 'italic', 'underline'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['link'],
  ['clean'],
];

const KEYS = [
  { key: 'terms', label: 'Terms & Conditions' },
  { key: 'about', label: 'About Lifebond' },
];

function ContentEditor({ keyName, label }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get(`/admin/content/${keyName}`)
      .then((r) => setContent(dataOf(r).content))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [keyName]);

  const save = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await api.put(`/admin/content/${keyName}`, { content });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{label}</h3>
        <button
          className="primary-button"
          onClick={save}
          disabled={saving || loading}
          style={{ minWidth: 80 }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
      <ErrorMessage error={error} />
      {loading ? (
        <p style={{ color: '#888' }}>Loading…</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={{ toolbar: TOOLBAR }}
            style={{ minHeight: 320 }}
          />
        </div>
      )}
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#888' }}>
        Content is saved as HTML and rendered in the mobile app.
      </p>
    </div>
  );
}

export default function Content() {
  return (
    <section className="page-section">
      <PageHeader
        title="App Content"
        description="Manage Terms & Conditions and About text shown in the mobile app."
      />
      {KEYS.map(({ key, label }) => (
        <ContentEditor key={key} keyName={key} label={label} />
      ))}
    </section>
  );
}
