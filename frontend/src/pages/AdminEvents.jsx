import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../api/client.js';
import { formatDateTime, formatPrice } from '../lib/format.js';
import EventForm from '../components/EventForm.jsx';
import Loader from '../components/Loader.jsx';
import { PlusIcon, PencilIcon, TrashIcon } from '../components/icons.jsx';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // event being edited, or 'new', or null
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get('/events', { params: { limit: 100 } })
      .then((res) => setEvents(res.data.events))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSaved = () => {
    setEditing(null);
    load();
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`Delete "${event.name}"? This cannot be undone.`)) return;
    setDeletingId(event._id);
    setError('');
    try {
      await api.delete(`/events/${event._id}`);
      setEvents((prev) => prev.filter((e) => e._id !== event._id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Loader label="Loading events..." />;

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Manage events</h1>
          <p className="text-sm text-muted">Create, edit, and delete events.</p>
        </div>
        {!editing && (
          <button className="btn-primary" onClick={() => setEditing('new')}>
            <PlusIcon className="h-4 w-4" />
            New event
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {editing && (
        <div className="mb-6">
          <EventForm
            event={editing === 'new' ? null : editing}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-mist text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Event</th>
                <th className="px-5 py-3 font-semibold">When</th>
                <th className="px-5 py-3 font-semibold">Seats</th>
                <th className="px-5 py-3 font-semibold">Price</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {events.map((e) => (
                <tr key={e._id} className="transition-colors hover:bg-mist/50">
                  <td className="px-5 py-3 font-semibold text-ink">{e.name}</td>
                  <td className="px-5 py-3 text-muted">{formatDateTime(e.dateTime)}</td>
                  <td className="px-5 py-3 text-muted">
                    {e.availableSeats} / {e.totalSeats}
                  </td>
                  <td className="px-5 py-3 text-muted">{formatPrice(e.price)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        className="btn-secondary px-3 py-1.5 text-xs"
                        onClick={() => setEditing(e)}
                        aria-label={`Edit ${e.name}`}
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        className="btn-danger px-3 py-1.5 text-xs"
                        disabled={deletingId === e._id}
                        onClick={() => handleDelete(e)}
                        aria-label={`Delete ${e.name}`}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        {deletingId === e._id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {events.length === 0 && <div className="p-12 text-center text-muted">No events yet.</div>}
      </div>
    </div>
  );
}
