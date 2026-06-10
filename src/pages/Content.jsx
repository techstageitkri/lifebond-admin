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

const PAGES = [
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
    <div className="content-editor">
      <div className="content-editor__header">
        <h3>{label}</h3>
        <button
          className="primary-button small-button"
          onClick={save}
          disabled={saving || loading}
          type="button"
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
      {error && (
        <div style={{ padding: '0 var(--sp-5)' }}>
          <ErrorMessage error={error} />
        </div>
      )}
      {loading ? (
        <p style={{ padding: 'var(--sp-5)', color: 'var(--text-3)', fontSize: 13 }}>Loading…</p>
      ) : (
        <div className="content-editor__editor">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={{ toolbar: TOOLBAR }}
            className="content-editor__quill"
          />
        </div>
      )}
      <p className="content-editor-note">
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
        description="Manage Terms & Conditions and About text displayed in the mobile app."
      />
      {PAGES.map(({ key, label }) => (
        <ContentEditor key={key} keyName={key} label={label} />
      ))}
    </section>
  );
}
