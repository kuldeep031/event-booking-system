import { useState } from 'react';
import { api, getErrorMessage } from '../api/client.js';

// Converts an ISO date string to the value format a datetime-local input wants
// (YYYY-MM-DDTHH:mm in local time).
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};

const emptyForm = {
  name: '',
  description: '',
  dateTime: '',
  venue: '',
  totalSeats: 100,
  price: 0,
};

// `event` present => edit mode; absent => create mode.
export default function EventForm({ event, onSaved, onCancel }) {
  const isEdit = Boolean(event);
  const [form, setForm] = useState(
    event
      ? {
          name: event.name,
          description: event.description,
          dateTime: toLocalInput(event.dateTime),
          venue: event.venue,
          totalSeats: event.totalSeats,
          price: event.price,
        }
      : emptyForm
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      ...form,
      dateTime: new Date(form.dateTime).toISOString(),
      totalSeats: Number(form.totalSeats),
      price: Number(form.price),
    };

    try {
      const res = isEdit
        ? await api.patch(`/events/${event._id}`, payload)
        : await api.post('/events', payload);
      onSaved(res.data.event);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h2 className="font-display text-lg font-bold text-ink">
        {isEdit ? 'Edit event' : 'Create event'}
      </h2>

      {error && (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <div>
        <label className="label" htmlFor="name">Name</label>
        <input id="name" name="name" className="input" value={form.name} onChange={handleChange} required />
      </div>

      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="input"
          value={form.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="dateTime">Date & time</label>
          <input
            id="dateTime"
            name="dateTime"
            type="datetime-local"
            className="input"
            value={form.dateTime}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="venue">Venue</label>
          <input id="venue" name="venue" className="input" value={form.venue} onChange={handleChange} required />
        </div>
        <div>
          <label className="label" htmlFor="totalSeats">Total seats</label>
          <input
            id="totalSeats"
            name="totalSeats"
            type="number"
            min={1}
            className="input"
            value={form.totalSeats}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="price">Price (₹)</label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            className="input"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create event'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
