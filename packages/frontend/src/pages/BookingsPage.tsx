import { FormEvent, useEffect, useState } from 'react';
import {
  Booking,
  BookingStatus,
  Client,
  createBooking,
  createInvoiceFromBooking,
  fetchBookings,
  fetchClients,
  updateBooking,
} from '../api';
import {
  formatDate,
  formatTime,
  groupByDay,
  navigate,
} from '../lib/routing';

const ROOMS = ['Studio A', 'Studio B', 'Live Room'];
const STATUSES: BookingStatus[] = ['held', 'confirmed', 'cancelled'];

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clientId: '',
    start: '',
    end: '',
    room: ROOMS[0],
    status: 'held' as BookingStatus,
    hourlyRate: 85,
  });

  const clientMap = new Map(clients.map((c) => [c.id, c]));

  async function load() {
    try {
      setError(null);
      const [b, c] = await Promise.all([fetchBookings(), fetchClients()]);
      setBookings(b);
      setClients(c);
      if (c.length > 0 && !form.clientId) {
        setForm((prev) => ({ ...prev, clientId: c[0].id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!form.clientId || !form.start || !form.end) return;
    try {
      setError(null);
      await createBooking(form);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    }
  }

  async function changeStatus(booking: Booking, status: BookingStatus) {
    try {
      setError(null);
      await updateBooking(booking.id, { status });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    }
  }

  async function invoiceBooking(booking: Booking) {
    try {
      setError(null);
      await createInvoiceFromBooking(booking.id);
      navigate('invoices');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
    }
  }

  const grouped = groupByDay(bookings);

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Bookings</h2>
          <p className="page__subtitle">Sessions grouped by day across your rooms.</p>
        </div>
        {!showForm && clients.length > 0 && (
          <button type="button" className="btn btn--primary" onClick={() => setShowForm(true)}>
            New booking
          </button>
        )}
      </div>

      {error && <p className="alert alert--error">{error}</p>}

      {showForm && (
        <form className="card form" onSubmit={handleCreate}>
          <h3 className="form__heading">Schedule a session</h3>
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
            <label className="field">
              <span className="field__label">Start</span>
              <input
                className="field__input"
                type="datetime-local"
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span className="field__label">End</span>
              <input
                className="field__input"
                type="datetime-local"
                value={form.end}
                onChange={(e) => setForm({ ...form, end: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Room</span>
              <select
                className="field__input"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
              >
                {ROOMS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field__label">Hourly rate ($)</span>
              <input
                className="field__input"
                type="number"
                min={0}
                step={1}
                value={form.hourlyRate}
                onChange={(e) =>
                  setForm({ ...form, hourlyRate: Number(e.target.value) })
                }
              />
            </label>
          </div>
          <div className="form__actions">
            <button type="submit" className="btn btn--primary">
              Create booking
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
        <p className="muted">Loading bookings…</p>
      ) : clients.length === 0 ? (
        <div className="empty">
          <p className="empty__text">Add a client before scheduling sessions.</p>
          <a href="#/clients" className="btn btn--primary">
            Go to Clients
          </a>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty">
          <p className="empty__text">No bookings on the calendar yet.</p>
          <button type="button" className="btn btn--primary" onClick={() => setShowForm(true)}>
            Schedule first session
          </button>
        </div>
      ) : (
        <div className="calendar">
          {[...grouped.entries()].map(([day, dayBookings]) => (
            <section key={day} className="calendar__day">
              <h3 className="calendar__date">{formatDate(dayBookings[0].start)}</h3>
              <ul className="calendar__list">
                {dayBookings.map((booking) => {
                  const client = clientMap.get(booking.clientId);
                  return (
                    <li key={booking.id} className="card calendar__item">
                      <div className="calendar__time">
                        {formatTime(booking.start)} – {formatTime(booking.end)}
                      </div>
                      <div className="calendar__details">
                        <strong>{client?.name ?? 'Unknown client'}</strong>
                        <span className="list__meta">{booking.room}</span>
                        <span className="list__meta">
                          ${booking.hourlyRate}/hr
                        </span>
                      </div>
                      <div className="calendar__actions">
                        <span className={`badge badge--${booking.status}`}>
                          {booking.status}
                        </span>
                        <select
                          className="field__input field__input--sm"
                          value={booking.status}
                          onChange={(e) =>
                            changeStatus(booking, e.target.value as BookingStatus)
                          }
                          aria-label="Change status"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {booking.status === 'confirmed' && (
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => invoiceBooking(booking)}
                          >
                            Invoice
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
