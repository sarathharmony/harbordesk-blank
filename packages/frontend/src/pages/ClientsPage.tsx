import { FormEvent, useEffect, useState } from 'react';
import {
  Client,
  createClient,
  fetchClients,
  updateClient,
} from '../api';

const emptyForm = { name: '', email: '', phone: '', notes: '' };

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    try {
      setError(null);
      setClients(await fetchClients());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(client: Client) {
    setEditingId(client.id);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      notes: client.notes,
    });
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    try {
      setError(null);
      if (editingId) {
        await updateClient(editingId, form);
      } else {
        await createClient(form);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save client');
    }
  }

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Clients</h2>
          <p className="page__subtitle">Manage artists, bands, and session contacts.</p>
        </div>
        {!showForm && (
          <button type="button" className="btn btn--primary" onClick={startCreate}>
            Add client
          </button>
        )}
      </div>

      {error && <p className="alert alert--error">{error}</p>}

      {showForm && (
        <form className="card form" onSubmit={handleSubmit}>
          <h3 className="form__heading">
            {editingId ? 'Edit client' : 'New client'}
          </h3>
          <div className="form__grid">
            <label className="field">
              <span className="field__label">Name</span>
              <input
                className="field__input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Email</span>
              <input
                className="field__input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Phone</span>
              <input
                className="field__input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label className="field field--full">
              <span className="field__label">Notes</span>
              <textarea
                className="field__input field__textarea"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
          </div>
          <div className="form__actions">
            <button type="submit" className="btn btn--primary">
              {editingId ? 'Save changes' : 'Create client'}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="muted">Loading clients…</p>
      ) : clients.length === 0 ? (
        <div className="empty">
          <p className="empty__text">No clients yet.</p>
          <button type="button" className="btn btn--primary" onClick={startCreate}>
            Add your first client
          </button>
        </div>
      ) : (
        <ul className="list">
          {clients.map((client) => (
            <li key={client.id} className="card list__item">
              <div className="list__body">
                <strong className="list__title">{client.name}</strong>
                <span className="list__meta">{client.email}</span>
                {client.phone && (
                  <span className="list__meta">{client.phone}</span>
                )}
                {client.notes && (
                  <p className="list__notes">{client.notes}</p>
                )}
              </div>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => startEdit(client)}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
