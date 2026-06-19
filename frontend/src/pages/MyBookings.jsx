import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client.js';
import { formatDateTime, formatPrice } from '../lib/format.js';
import Loader from '../components/Loader.jsx';
import { CalendarIcon, MapPinIcon, TicketIcon, TrashIcon } from '../components/icons.jsx';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get('/bookings')
      .then((res) => setBookings(res.data.bookings))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking? The seats will be released.')) return;
    setCancellingId(id);
    setError('');
    try {
      const res = await api.patch(`/bookings/${id}/cancel`);
      setBookings((prev) => prev.map((b) => (b._id === id ? res.data.booking : b)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <Loader label="Loading your bookings..." />;

  return (
    <div className="animate-fade-up">
      <h1 className="mb-1 font-display text-2xl font-extrabold text-ink">My bookings</h1>
      <p className="mb-6 text-sm text-muted">Manage the events you've booked.</p>

      {error && (
        <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {bookings.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mist text-ink">
            <TicketIcon className="h-6 w-6" />
          </span>
          <p className="font-semibold text-ink">No bookings yet</p>
          <Link to="/" className="btn-primary mt-1">Browse events</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const cancelled = b.status === 'cancelled';
            const event = b.event;
            return (
              <div
                key={b._id}
                className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink font-display text-lg font-extrabold text-white">
                    {event ? event.name?.[0] : '?'}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display font-bold text-ink">
                        {event ? event.name : 'Event removed'}
                      </h3>
                      <span
                        className={`badge ${
                          cancelled ? 'bg-mist text-muted' : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {cancelled ? 'Cancelled' : 'Confirmed'}
                      </span>
                    </div>
                    {event && (
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon className="h-4 w-4 text-ink/40" />
                          {formatDateTime(event.dateTime)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPinIcon className="h-4 w-4 text-ink/40" />
                          {event.venue}
                        </span>
                      </div>
                    )}
                    <p className="mt-1.5 text-sm font-semibold text-ink">
                      {b.seats} seat(s){event ? ` · ${formatPrice(event.price * b.seats)}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:flex-col-reverse sm:items-end lg:flex-row">
                  {event && (
                    <Link to={`/events/${event._id}`} className="btn-secondary px-3.5 py-1.5 text-sm">
                      View event
                    </Link>
                  )}
                  {!cancelled && (
                    <button
                      className="btn-danger px-3.5 py-1.5 text-sm"
                      disabled={cancellingId === b._id}
                      onClick={() => handleCancel(b._id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                      {cancellingId === b._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
