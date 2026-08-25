import { FormEvent, useEffect, useState } from 'react';
import {
  Client,
  createInvoice,
  fetchClients,
  fetchInvoices,
  Invoice,
  markInvoicePaid,
  updateInvoiceStatus,
} from '../api';
import { formatCurrency, formatDateTime } from '../lib/routing';

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clientId: '',
    description: '',
    quantity: 1,
    unitPrice: 85,
  });

  const clientMap = new Map(clients.map((c) => [c.id, c]));

  async function load() {
    try {
      setError(null);
      const [inv, cl] = await Promise.all([fetchInvoices(), fetchClients()]);
      setInvoices(inv);
      setClients(cl);
      if (cl.length > 0 && !form.clientId) {
        setForm((prev) => ({ ...prev, clientId: cl[0].id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!form.clientId || !form.description.trim()) return;
    try {
      setError(null);
      await createInvoice({
        clientId: form.clientId,
        lineItems: [
          {
            description: form.description.trim(),
            quantity: form.quantity,
            unitPrice: form.unitPrice,
          },
        ],
        status: 'draft',
      });
      setShowForm(false);
      setForm((prev) => ({ ...prev, description: '' }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
    }
  }

  async function handleMarkPaid(id: string) {
    try {
      setError(null);
      await markInvoicePaid(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark paid');
    }
  }

  async function handleSend(id: string) {
    try {
      setError(null);
      await updateInvoiceStatus(id, 'sent');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice');
    }
  }

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Invoices</h2>
          <p className="page__subtitle">
            Draft, send, and track payments for studio work.
          </p>
        </div>
        {!showForm && clients.length > 0 && (
          <button type="button" className="btn btn--primary" onClick={() => setShowForm(true)}>
            Manual invoice
          </button>
        )}
      </div>

      {error && <p className="alert alert--error">{error}</p>}

      {showForm && (
        <form className="card form" onSubmit={handleCreate}>
          <h3 className="form__heading">Create manual invoice</h3>
          <div className="form__grid">
            <label className="field field--full">
              <span className="field__label">Client</span>
              <select
                className="field__input"
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--full">
              <span className="field__label">Line item description</span>
              <input
                className="field__input"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Mixing session — 4 hours"
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Quantity (hours/units)</span>
              <input
                className="field__input"
                type="number"
                min={0.5}
                step={0.5}
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: Number(e.target.value) })
                }
              />
            </label>
            <label className="field">
              <span className="field__label">Unit price ($)</span>
              <input
                className="field__input"
                type="number"
                min={0}
                step={1}
                value={form.unitPrice}
                onChange={(e) =>
                  setForm({ ...form, unitPrice: Number(e.target.value) })
                }
              />
            </label>
          </div>
          <div className="form__actions">
            <button type="submit" className="btn btn--primary">
              Create draft
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="muted">Loading invoices…</p>
      ) : clients.length === 0 ? (
        <div className="empty">
          <p className="empty__text">Add a client before creating invoices.</p>
          <a href="#/clients" className="btn btn--primary">
            Go to Clients
          </a>
        </div>
      ) : invoices.length === 0 ? (
        <div className="empty">
          <p className="empty__text">No invoices yet.</p>
          <p className="empty__hint">
            Confirm a booking and click Invoice, or create one manually.
          </p>
          <button type="button" className="btn btn--primary" onClick={() => setShowForm(true)}>
            Create manual invoice
          </button>
        </div>
      ) : (
        <ul className="list">
          {invoices.map((invoice) => {
            const client = clientMap.get(invoice.clientId);
            return (
              <li key={invoice.id} className="card list__item list__item--stack">
                <div className="list__body">
                  <div className="invoice__header">
                    <strong className="list__title">
                      {client?.name ?? 'Unknown client'}
                    </strong>
                    <span className={`badge badge--${invoice.status}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <span className="list__meta">
                    {formatDateTime(invoice.createdAt)} ·{' '}
                    {formatCurrency(invoice.total)}
                  </span>
                  <ul className="invoice__lines">
                    {invoice.lineItems.map((item, i) => (
                      <li key={i}>
                        {item.description} — {item.quantity} ×{' '}
                        {formatCurrency(item.unitPrice)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="invoice__actions">
                  {invoice.status === 'draft' && (
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => handleSend(invoice.id)}
                    >
                      Mark sent
                    </button>
                  )}
                  {invoice.status !== 'paid' && (
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      onClick={() => handleMarkPaid(invoice.id)}
                    >
                      Mark paid
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
