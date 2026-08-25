import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Booking,
  fetchPublicAvailability,
  fetchPublicRooms,
  publicBook,
} from '../api';
import { formatDate, formatTime } from '../lib/routing';

function nextSlotDate(daysAhead: number, hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function toLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PublicBookPage() {
  const [rooms, setRooms] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    room: '',
    start: toLocalValue(nextSlotDate(2, 14)),
    end: toLocalValue(nextSlotDate(2, 17)),
  });

  const slots = useMemo(
    () => [
      { label: 'Tomorrow 2–5 PM', start: nextSlotDate(1, 14), end: nextSlotDate(1, 17) },
      { label: 'Thu 10 AM–1 PM', start: nextSlotDate(3, 10), end: nextSlotDate(3, 13) },
      { label: 'Sat 11 AM–2 PM', start: nextSlotDate(5, 11), end: nextSlotDate(5, 14) },
    ],
    [],
  );

  async function load() {
    try {
      setError(null);
      const [r, a] = await Promise.all([
        fetchPublicRooms(),
        fetchPublicAvailability(),
      ]);
      setRooms(r);
      setAvailability(a);
      if (r.length > 0) {
        setForm((prev) => ({ ...prev, room: prev.room || r[0] }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function pickSlot(start: Date, end: Date) {
    setForm((prev) => ({
      ...prev,
      start: toLocalValue(start),
      end: toLocalValue(end),
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    try {
      setError(null);
      setSuccess(null);
      const booking = await publicBook({
        name: form.name.trim(),
        email: form.email.trim(),
        room: form.room,
        start: new Date(form.start).toISOString(),
        end: new Date(form.end).toISOString(),
      });
      setSuccess(
        `Request received! Your ${booking.room} session is on hold — we'll confirm by email.`,
      );
      setForm({ name: '', email: '', room: form.room, start: form.start, end: form.end });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit booking');
    }
  }

  return (
    <div className="public">
      <header className="public__hero">
        <span className="public__mark" aria-hidden="true">
          ◉
        </span>
        <h1 className="public__title">Book studio time</h1>
        <p className="public__lead">
          Pick a room and time. No account needed — we'll hold your slot and follow up
          to confirm.
        </p>
      </header>

      {error && <p className="alert alert--error">{error}</p>}
      {success && <p className="alert alert--success">{success}</p>}

      <div className="public__grid">
        <form className="card form public__form" onSubmit={handleSubmit}>
          <h2 className="form__heading">Your session</h2>
          <div className="form__grid">
            <label className="field">
              <span className="field__label">Your name</span>
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
            <label className="field field--full">
              <span className="field__label">Room</span>
              <select
                className="field__input"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
              >
                {rooms.map((r) => (
                  <option key={r} value={r}>
                    {r}
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
          </div>

          <div className="public__quick">
            <span className="field__label">Quick picks</span>
            <div className="public__chips">
              {slots.map((slot) => (
                <button
                  key={slot.label}
                  type="button"
                  className="chip"
                  onClick={() => pickSlot(slot.start, slot.end)}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--block">
            Request booking
          </button>
        </form>

        <aside className="card public__aside">
          <h2 className="form__heading">Upcoming sessions</h2>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : availability.length === 0 ? (
            <p className="muted">Plenty of open time this week.</p>
          ) : (
            <ul className="public__schedule">
              {availability.slice(0, 6).map((b) => (
                <li key={b.id}>
                  <strong>{formatDate(b.start)}</strong>
                  <span>
                    {formatTime(b.start)} – {formatTime(b.end)} · {b.room}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
